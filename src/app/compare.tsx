import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getPlayer } from "../services/api";
import type { Player } from "../types/player";

// Karşılaştırma tablosunda gösterilecek sezon istatistik satırlarını belirler.
const statRows = [
  { label: "Gol", key: "goals" },
  { label: "Asist", key: "assists" },
  { label: "Sarı Kart", key: "yellowCards" },
  { label: "Kırmızı Kart", key: "redCards" },
  { label: "Dakika", key: "minutes" },
] as const;

export default function CompareScreen() {
  const { player1, player2 } = useLocalSearchParams();
  const navigation = useNavigation();
  const [players, setPlayers] = useState<[Player, Player] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Oyuncu Karşılaştırma",
      headerTitle: "Oyuncu Karşılaştırma",
      headerShown: true,
    });
  }, [navigation]);

  // URL'deki iki oyuncu id'sine göre karşılaştırılacak oyuncu detaylarını yükler.
  useEffect(() => {
    let active = true;
    const firstId = Number(Array.isArray(player1) ? player1[0] : player1);
    const secondId = Number(Array.isArray(player2) ? player2[0] : player2);

    if (!firstId || !secondId) {
      setError("Karşılaştırma için iki oyuncu seçilmeli");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    Promise.all([getPlayer(firstId), getPlayer(secondId)])
      .then(([firstPlayer, secondPlayer]) => {
        if (active) {
          setPlayers([firstPlayer, secondPlayer]);
        }
      })
      .catch(() => {
        if (active) {
          setError("Oyuncular yüklenemedi");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [player1, player2]);

  if (loading) {
    return (
      <View style={styles.page}>
        <Text style={styles.statusText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!players) {
    return (
      <View style={styles.page}>
        <Text style={styles.errorText}>{error || "Oyuncular bulunamadı"}</Text>
      </View>
    );
  }

  const [firstPlayer, secondPlayer] = players;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Yan yana analiz</Text>
        <Text style={styles.title}>Oyuncu Karşılaştırma</Text>
      </View>

      <View style={styles.playerGrid}>
        <PlayerCard player={firstPlayer} />
        <PlayerCard player={secondPlayer} />
      </View>

      <View style={styles.table}>
        <Text style={styles.sectionTitle}>Sezon İstatistikleri</Text>

        {statRows.map((row) => (
          <View key={row.key} style={styles.statRow}>
            <View style={styles.statInner}>
              <Text style={styles.statValue}>{Number(firstPlayer[row.key])}</Text>
              <Text style={styles.statLabel}>{row.label}</Text>
              <Text style={styles.statValue}>{Number(secondPlayer[row.key])}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.table}>
        <Text style={styles.sectionTitle}>Kulüp Kariyeri</Text>
        <View style={styles.statRow}>
          <View style={styles.statInner}>
            <Text style={styles.statValue}>
              {firstPlayer.clubCareer?.matches ?? 0}
            </Text>
            <Text style={styles.statLabel}>Maç</Text>
            <Text style={styles.statValue}>
              {secondPlayer.clubCareer?.matches ?? 0}
            </Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statInner}>
            <Text style={styles.statValue}>
              {firstPlayer.clubCareer?.goals ?? 0}
            </Text>
            <Text style={styles.statLabel}>Gol</Text>
            <Text style={styles.statValue}>
              {secondPlayer.clubCareer?.goals ?? 0}
            </Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statInner}>
            <Text style={styles.statValue}>
              {firstPlayer.clubCareer?.assists ?? 0}
            </Text>
            <Text style={styles.statLabel}>Asist</Text>
            <Text style={styles.statValue}>
              {secondPlayer.clubCareer?.assists ?? 0}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// Karşılaştırılan oyuncunun profil özet kartını oluşturur.
function PlayerCard({ player }: { player: Player }) {
  return (
    <View style={styles.playerCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {player.name.charAt(0)}
          {player.surname.charAt(0)}
        </Text>
      </View>
      <Text style={styles.playerName}>
        {player.name} {player.surname}
      </Text>
      {player.position ? (
        <Text style={styles.positionBadge}>{player.position}</Text>
      ) : null}
      <Text style={styles.playerMeta}>{player.team}</Text>
      <Text style={styles.playerMeta}>
        {player.league} | {player.season}
      </Text>
    </View>
  );
}

// UI'ın hazırlanmasında Codex kullanılmıştır.
// Oyuncu karşılaştırma sayfasındaki profil kartlarını, istatistik tablolarını ve yeşil tema renklerini düzenler.
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },
  content: {
    padding: 20,
    gap: 14,
  },
  header: {
    backgroundColor: "#14532d",
    borderRadius: 8,
    padding: 18,
  },
  eyebrow: {
    color: "#bbf7d0",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
  },
  playerGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  playerCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: 16,
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#14532d",
    fontSize: 20,
    fontWeight: "900",
  },
  playerName: {
    color: "#143524",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  positionBadge: {
    color: "#14532d",
    backgroundColor: "#dcfce7",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 8,
  },
  playerMeta: {
    color: "#5f6f64",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
  },
  table: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    overflow: "hidden",
  },
  sectionTitle: {
    color: "#143524",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5f3ea",
  },
  statRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5f3ea",
  },
  statInner: {
    width: "100%",
    maxWidth: 760,
    flexDirection: "row",
    alignItems: "center",
  },
  statValue: {
    flex: 1,
    color: "#15803d",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  statLabel: {
    flex: 0.9,
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
  },
  statusText: {
    color: "#15803d",
    fontWeight: "800",
    padding: 20,
  },
  errorText: {
    color: "#b42318",
    fontWeight: "800",
    padding: 20,
  },
});

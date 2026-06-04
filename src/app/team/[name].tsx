import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { getTeamPlayers } from "../../services/api";
import type { Player } from "../../types/player";

export default function TeamScreen() {
  const { name } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  // Takım adı URL'de encode edildiği çin ekranda kullanmadan önce burada geri çevrilir.
  const teamName = decodeURIComponent(name as string);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    // Takim sayfasi sadece secilen takimin oyuncularini backendden ister.
    getTeamPlayers(teamName)
      .then((items) => {
        if (active) {
          setTeamPlayers(items);
        }
      })
      .catch(() => {
        if (active) {
          setError("Takım yüklenemedi");
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
  }, [teamName]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: teamName,
      headerTitle: teamName,
      headerShown: true,
    });
  }, [navigation, teamName]);

  const goToPlayer = (playerId: number) => {
    // Listedeki oyuncuya tiklayinca oyuncu detay ekranina gidilir.
    router.push(`/player/${playerId}`);
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <Text style={styles.statusText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (teamPlayers.length === 0) {
    return (
      <View style={styles.page}>
        <Text style={styles.errorText}>
          {error || `Takım bulunamadı: ${teamName}`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Takım kadrosu</Text>
        <Text style={styles.teamName}>{teamName}</Text>
        <Text style={styles.playerCount}>{teamPlayers.length} oyuncu</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.playerCell]}>Oyuncu</Text>
          <Text style={[styles.headerCell, styles.statCell]}>Gol</Text>
          <Text style={[styles.headerCell, styles.statCell]}>Asist</Text>
          <Text style={[styles.headerCell, styles.statCell]}>Sarı</Text>
          <Text style={[styles.headerCell, styles.statCell]}>Kırmızı</Text>
        </View>

        <FlatList
          style={styles.playersList}
          data={teamPlayers}
          //Bu kod Codex yardımıyla yazılmıştır
          // rowKey SQL istatistik satirini da icerir; ayni oyuncu id'si tekrar etse bile liste bozulmaz.
          keyExtractor={(item, index) =>
            item.rowKey ||
            `${item.id}-${item.team}-${item.league}-${item.season}-${index}`
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => goToPlayer(item.id)}
            >
              <View style={styles.playerCell}>
                <Text style={styles.playerName}>
                  {item.name} {item.surname}
                </Text>
                <Text style={styles.leagueName}>{item.league}</Text>
              </View>
              <Text style={[styles.statText, styles.statCell]}>{item.goals}</Text>
              <Text style={[styles.statText, styles.statCell]}>
                {item.assists}
              </Text>
              <Text style={[styles.statText, styles.statCell]}>
                {item.yellowCards}
              </Text>
              <Text style={[styles.statText, styles.statCell]}>
                {item.redCards}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}

// UI'ın hazırlanmasında Codex kullanılmıştır.
// Takım kadrosu sayfasındaki üst bilgi alanını, oyuncu listesini ve istatistik kolonlarını düzenler.
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f2f4f7",
    padding: 20,
  },
  header: {
    backgroundColor: "#14532d",
    borderRadius: 8,
    padding: 18,
    marginBottom: 14,
  },
  eyebrow: {
    color: "#bbf7d0",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  teamName: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
  },
  playerCount: {
    color: "#dcfce7",
    fontSize: 14,
    marginTop: 6,
    fontWeight: "700",
  },
  table: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    overflow: "hidden",
  },
  tableHeader: {
    height: 44,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  playersList: {
    flex: 1,
  },
  headerCell: {
    color: "#4f6356",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5f3ea",
  },
  playerCell: {
    width: 360,
    minWidth: 0,
    marginRight: 20,
  },
  statCell: {
    width: 58,
    textAlign: "right",
  },
  playerName: {
    color: "#143524",
    fontSize: 16,
    fontWeight: "800",
  },
  leagueName: {
    color: "#5f6f64",
    fontSize: 13,
    marginTop: 3,
    fontWeight: "700",
  },
  statText: {
    color: "#15803d",
    fontSize: 17,
    fontWeight: "900",
  },
  statusText: {
    color: "#15803d",
    fontWeight: "800",
  },
  errorText: {
    color: "#b42318",
    fontWeight: "800",
  },
});

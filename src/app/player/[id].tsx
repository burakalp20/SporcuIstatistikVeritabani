import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getPlayer } from "../../services/api";
import type { Player } from "../../types/player";

export default function PlayerScreen() {
  // URL'deki /player/[id] parametresi hangi oyuncunun detayinin acilacagini belirler.
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    // Oyuncu detayi mockData'dan degil, backenddeki /players/:id endpointinden gelir.
    getPlayer(Number(id))
      .then((item) => {
        if (active) {
          setPlayer(item);
        }
      })
      .catch(() => {
        if (active) {
          setPlayer(null);
          setError("Oyuncu bulunamadi");
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
  }, [id]);

  useLayoutEffect(() => {
    // Oyuncu geldikten sonra ekran basligi dinamik olarak ad-soyad ile guncellenir.
    if (player) {
      navigation.setOptions({
        title: `${player.name} ${player.surname}`,
        headerTitle: `${player.name} ${player.surname}`,
        headerShown: true,
      });
    }
  }, [navigation, player]);

  if (loading) {
    return (
      <View style={styles.page}>
        <Text style={styles.statusText}>Yukleniyor...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.page}>
        <Text style={styles.errorText}>{error || "Oyuncu bulunamadi"}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {player.name.charAt(0)}
            {player.surname.charAt(0)}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            {player.name} {player.surname}
          </Text>
          <Text style={styles.team}>{player.team}</Text>
          <Text style={styles.league}>
            {player.league} | Sezon {player.season}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sezon Istatistikleri</Text>
        <View style={styles.statsContainer}>
          <StatBox label="Gol" value={player.goals} />
          <StatBox label="Asist" value={player.assists} />
          <StatBox label="Sari Kart" value={player.yellowCards} />
          <StatBox label="Kirmizi Kart" value={player.redCards} />
          <StatBox label="Dakika" value={player.minutes} />
        </View>
      </View>

      {player.clubCareer && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kulup Kariyeri</Text>
          <View style={styles.statsContainer}>
            <StatBox label="Mac" value={player.clubCareer.matches} />
            <StatBox label="Gol" value={player.clubCareer.goals} />
            <StatBox label="Asist" value={player.clubCareer.assists} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },
  content: {
    padding: 20,
    gap: 14,
  },
  profileHeader: {
    backgroundColor: "#0b2b4c",
    borderRadius: 8,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 8,
    backgroundColor: "#d8e6f2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#0b2b4c",
    fontSize: 24,
    fontWeight: "900",
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
  },
  team: {
    color: "#d8e6f2",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  league: {
    color: "#9fc2df",
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d9e1ea",
    padding: 16,
  },
  sectionTitle: {
    color: "#12263a",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    minWidth: 116,
    flex: 1,
    backgroundColor: "#eef3f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d9e1ea",
    padding: 14,
  },
  statValue: {
    color: "#0b5cab",
    fontSize: 25,
    fontWeight: "900",
  },
  statLabel: {
    color: "#66788a",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    textTransform: "uppercase",
  },
  statusText: {
    color: "#0b5cab",
    fontWeight: "800",
    padding: 20,
  },
  errorText: {
    color: "#b42318",
    fontWeight: "800",
    padding: 20,
  },
});

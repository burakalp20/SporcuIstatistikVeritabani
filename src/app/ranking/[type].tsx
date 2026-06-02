import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { getRanking } from "../../services/api";
import type { Player, RankingKey } from "../../types/player";

function normalizeRankingType(type: string | string[] | undefined): RankingKey {
  const value = Array.isArray(type) ? type[0] : type;
  const normalized = String(value || "").toLowerCase();

  if (normalized === "goals") {
    return "goals";
  }

  if (normalized === "assists") {
    return "assists";
  }

  if (normalized === "yellowcards" || normalized === "yellow-cards") {
    return "yellowCards";
  }

  return "redCards";
}

export default function RankingScreen() {
  const { type, league } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  // type parametresi hangi kralligin acildigini belirler: gol, asist veya kartlar.
  const rankingType = normalizeRankingType(type);
  const selectedLeague = Array.isArray(league) ? league[0] || "" : league || "";
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerTitle: "",
    });
  }, [navigation]);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    // Sadece secilen krallik ve lig icin sirali oyuncu listesi backendden alinir.
    getRanking(rankingType, selectedLeague || undefined)
      .then((items) => {
        if (active) {
          setPlayers(items);
        }
      })
      .catch(() => {
        if (active) {
          setError("Siralama yuklenemedi");
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
  }, [rankingType, selectedLeague]);

  const leagueTitle = selectedLeague ? `${selectedLeague} - ` : "";
  const rankingTitle =
    rankingType === "goals"
      ? "Gol"
      : rankingType === "assists"
        ? "Asist"
        : rankingType === "yellowCards"
          ? "Sari Kart"
          : "Kirmizi Kart";

  const goToPlayer = (playerId: number) => {
    // Siralama satirindaki oyuncuya tiklayinca oyuncu detay ekranina gidilir.
    router.push(`/player/${playerId}`);
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{leagueTitle || "Genel"}</Text>
        <Text style={styles.title}>{rankingTitle} Kralligi</Text>
        <Text style={styles.subtitle}>Ilk 10 oyuncu siralamasi</Text>
      </View>

      {loading && <Text style={styles.statusText}>Yukleniyor...</Text>}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.rankCell]}>#</Text>
          <Text style={[styles.headerCell, styles.playerCell]}>Oyuncu</Text>
          <Text style={[styles.headerCell, styles.teamCell]}>Takim</Text>
          <Text style={[styles.headerCell, styles.valueCell]}>Deger</Text>
        </View>

        <FlatList
          data={players.slice(0, 10)}
          // Ayni oyuncunun birden fazla satiri olabilecegi icin id yerine rowKey tercih edilir.
          keyExtractor={(item, index) =>
            item.rowKey ||
            `${item.id}-${item.team}-${item.league}-${item.season}-${index}`
          }
          renderItem={({ item, index }) => (
            <Pressable
              style={styles.row}
              onPress={() => goToPlayer(item.id)}
            >
              <Text style={[styles.rankText, styles.rankCell]}>
                {index + 1}
              </Text>
              <Text style={[styles.playerName, styles.playerCell]}>
                {item.name} {item.surname}
              </Text>
              <Text style={[styles.teamName, styles.teamCell]}>{item.team}</Text>
              <Text style={[styles.valueText, styles.valueCell]}>
                {Number(item[rankingType])}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f2f4f7",
    padding: 20,
  },
  header: {
    backgroundColor: "#0b2b4c",
    borderRadius: 8,
    padding: 18,
    marginBottom: 14,
  },
  eyebrow: {
    color: "#9fc2df",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: "#d8e6f2",
    fontSize: 13,
    marginTop: 6,
  },
  statusText: {
    color: "#0b5cab",
    fontWeight: "800",
    marginBottom: 10,
  },
  errorText: {
    color: "#b42318",
    fontWeight: "800",
    marginBottom: 10,
  },
  table: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d9e1ea",
    overflow: "hidden",
  },
  tableHeader: {
    height: 38,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef3f8",
    borderBottomWidth: 1,
    borderBottomColor: "#d9e1ea",
  },
  headerCell: {
    color: "#617184",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  row: {
    minHeight: 54,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#edf1f5",
  },
  rankCell: {
    width: 34,
  },
  playerCell: {
    flex: 1.25,
    minWidth: 0,
  },
  teamCell: {
    flex: 1,
    minWidth: 0,
  },
  valueCell: {
    width: 58,
    textAlign: "right",
  },
  rankText: {
    color: "#0b5cab",
    fontSize: 15,
    fontWeight: "900",
  },
  playerName: {
    color: "#12263a",
    fontSize: 15,
    fontWeight: "800",
  },
  teamName: {
    color: "#66788a",
    fontSize: 13,
    fontWeight: "700",
  },
  valueText: {
    color: "#0b5cab",
    fontSize: 17,
    fontWeight: "900",
  },
});

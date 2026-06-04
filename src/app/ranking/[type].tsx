import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { getRanking } from "../../services/api";
import type { Player, RankingKey } from "../../types/player";

// URL'den gelen krallık değerini uygulamanın kullandığı sıralama anahtarına çevirir.
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
  // type parametresi hangi krallığın açıldığını burada belirler: gol, asist veya kartlar.
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

    // Sadece seçilen krallık ve lig için sıralı oyuncu listesi backendden buradan alınır.
    getRanking(rankingType, selectedLeague || undefined)
      .then((items) => {
        if (active) {
          setPlayers(items);
        }
      })
      .catch(() => {
        if (active) {
          setError("Sıralama yüklenemedi");
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
          ? "Sarı Kart"
          : "Kırmızı Kart";

  const goToPlayer = (playerId: number) => {
    // Siralama satirindaki oyuncuya tiklayinca oyuncu detay ekranina gidilir.
    router.push(`/player/${playerId}`);
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{leagueTitle || "Genel"}</Text>
        <Text style={styles.title}>{rankingTitle} Krallığı</Text>
        <Text style={styles.subtitle}>İlk 10 oyuncu sıralaması</Text>
      </View>

      {loading && <Text style={styles.statusText}>Yükleniyor...</Text>}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.rankCell]}>#</Text>
          <Text style={[styles.headerCell, styles.playerCell]}>Oyuncu</Text>
          <Text style={[styles.headerCell, styles.teamCell]}>Takım</Text>
          <Text style={[styles.headerCell, styles.valueCell]}>Değer</Text>
        </View>

        <FlatList
          style={styles.rankingList}
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

// UI'ın hazırlanmasında Codex kullanılmıştır.
// Krallık top 10 sayfalarının başlık alanını, kompakt tablo kolonlarını ve kaydırılabilir listeyi düzenler.
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
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: "#dcfce7",
    fontSize: 14,
    marginTop: 6,
  },
  statusText: {
    color: "#15803d",
    fontWeight: "800",
    marginBottom: 10,
  },
  errorText: {
    color: "#b42318",
    fontWeight: "800",
    marginBottom: 10,
  },
  table: {
    flex: 1,
    alignSelf: "flex-start",
    width: "100%",
    maxWidth: 760,
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
  rankingList: {
    flex: 1,
  },
  headerCell: {
    color: "#4f6356",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  row: {
    minHeight: 60,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5f3ea",
  },
  rankCell: {
    width: 38,
  },
  playerCell: {
    width: 310,
    minWidth: 0,
  },
  teamCell: {
    width: 220,
    minWidth: 0,
  },
  valueCell: {
    width: 72,
    textAlign: "right",
  },
  rankText: {
    color: "#15803d",
    fontSize: 17,
    fontWeight: "900",
  },
  playerName: {
    color: "#143524",
    fontSize: 16,
    fontWeight: "800",
  },
  teamName: {
    color: "#5f6f64",
    fontSize: 14,
    fontWeight: "700",
  },
  valueText: {
    color: "#15803d",
    fontSize: 19,
    fontWeight: "900",
  },
});

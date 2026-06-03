import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Player, RankingKey } from "../types/player";

type Props = {
  title: string;
  data: Player[];
  valueKey: RankingKey;
  selectedLeague?: string;
};

function getPlayerKey(item: Player, index: number, valueKey: RankingKey) {
  // Backend rowKey dondururse onu kullaniriz; yoksa liste icin yedek benzersiz key uretiriz.
  return (
    item.rowKey ||
    `${valueKey}-${item.id}-${item.team}-${item.league}-${item.season}-${index}`
  );
}

export default function RankingCard({
  title,
  data,
  valueKey,
  selectedLeague,
}: Props) {
  const router = useRouter();

  // Kartlar ana sayfada sadece ilk 5 sirayi gosterdigi icin veri burada kisaltilir.
  const sorted = [...data]
    .sort((a, b) => Number(b[valueKey] ?? 0) - Number(a[valueKey] ?? 0))
    .slice(0, 5);

  // Kart başlığına basıldığında ilgili krallığın detay sayfasını açar.
  const goToRanking = () => {
    // "Tumunu Gor" tiklandiginda secili lig query parametresiyle siralama sayfasina tasinir.
    router.push(`/ranking/${valueKey}?league=${selectedLeague || ""}`);
  };

  return (
    <View style={styles.container} key={`${selectedLeague || "all"}-${valueKey}`}>
      <Pressable onPress={goToRanking} style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>İlk 5 oyuncu</Text>
        </View>
        <Text style={styles.linkText}>Tümünü gör</Text>
      </Pressable>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.rankCell]}>#</Text>
        <Text style={[styles.headerCell, styles.playerCell]}>Oyuncu</Text>
        <Text style={[styles.headerCell, styles.valueCell]}>Değer</Text>
      </View>

      <View style={styles.list}>
        {sorted.map((item, index) => (
          <View key={getPlayerKey(item, index, valueKey)} style={styles.row}>
            <Text style={[styles.rowText, styles.rankCell]}>{index + 1}</Text>
            <View style={styles.playerCell}>
              <Text style={styles.playerName}>
                {item.name} {item.surname}
              </Text>
              <Text style={styles.teamName}>{item.team}</Text>
            </View>
            <Text style={[styles.valueText, styles.valueCell]}>
              {Number(item[valueKey] ?? 0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// UI'ın hazırlanmasında Codex kullanılmıştır.
// Ana sayfadaki krallık kartlarının başlığını, tablo satırlarını ve değer kolonunu düzenler.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    overflow: "hidden",
  },
  header: {
    minHeight: 64,
    backgroundColor: "#166534",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    color: "#bbf7d0",
    fontSize: 13,
    marginTop: 2,
  },
  linkText: {
    color: "white",
    fontSize: 13,
    fontWeight: "900",
  },
  tableHeader: {
    height: 40,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  headerCell: {
    color: "#4f6356",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  list: {
    // Sabit yukseklik, lig degisimlerinde satirlarin baslik ustune tasmasini engeller.
    height: 280,
    overflow: "hidden",
  },
  row: {
    height: 56,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5f3ea",
  },
  rowText: {
    color: "#1f3d2c",
    fontSize: 15,
    fontWeight: "800",
  },
  rankCell: {
    width: 30,
  },
  playerCell: {
    flex: 1,
    minWidth: 0,
  },
  valueCell: {
    width: 54,
    textAlign: "right",
  },
  playerName: {
    color: "#143524",
    fontSize: 15,
    fontWeight: "800",
  },
  teamName: {
    color: "#5f6f64",
    fontSize: 13,
    marginTop: 2,
  },
  valueText: {
    color: "#15803d",
    fontSize: 18,
    fontWeight: "900",
  },
});

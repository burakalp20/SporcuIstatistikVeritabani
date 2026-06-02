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

  const goToRanking = () => {
    // "Tumunu Gor" tiklandiginda secili lig query parametresiyle siralama sayfasina tasinir.
    router.push(`/ranking/${valueKey}?league=${selectedLeague || ""}`);
  };

  return (
    <View style={styles.container} key={`${selectedLeague || "all"}-${valueKey}`}>
      <Pressable onPress={goToRanking} style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Ilk 5 oyuncu</Text>
        </View>
        <Text style={styles.linkText}>Tumunu Gor</Text>
      </Pressable>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.rankCell]}>#</Text>
        <Text style={[styles.headerCell, styles.playerCell]}>Oyuncu</Text>
        <Text style={[styles.headerCell, styles.valueCell]}>Deger</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d9e1ea",
    overflow: "hidden",
  },
  header: {
    minHeight: 58,
    backgroundColor: "#123f6d",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    color: "#bdd5e9",
    fontSize: 12,
    marginTop: 2,
  },
  linkText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
  },
  tableHeader: {
    height: 34,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef3f8",
    borderBottomWidth: 1,
    borderBottomColor: "#d9e1ea",
  },
  headerCell: {
    color: "#617184",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  list: {
    // Sabit yukseklik, lig degisimlerinde satirlarin baslik ustune tasmasini engeller.
    minHeight: 264,
    overflow: "hidden",
  },
  row: {
    height: 52,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#edf1f5",
  },
  rowText: {
    color: "#24364a",
    fontSize: 14,
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
    color: "#12263a",
    fontSize: 14,
    fontWeight: "700",
  },
  teamName: {
    color: "#66788a",
    fontSize: 12,
    marginTop: 2,
  },
  valueText: {
    color: "#0b5cab",
    fontSize: 16,
    fontWeight: "900",
  },
});

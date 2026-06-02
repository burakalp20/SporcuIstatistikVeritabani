import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { getTeamPlayers } from "../../services/api";
import type { Player } from "../../types/player";

export default function TeamScreen() {
  const { name } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  // Takim adi URL'de encode edildigi icin ekranda kullanmadan once geri cevrilir.
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
          setError("Takim yuklenemedi");
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
        <Text style={styles.statusText}>Yukleniyor...</Text>
      </View>
    );
  }

  if (teamPlayers.length === 0) {
    return (
      <View style={styles.page}>
        <Text style={styles.errorText}>
          {error || `Takim bulunamadi: ${teamName}`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Takim kadrosu</Text>
        <Text style={styles.teamName}>{teamName}</Text>
        <Text style={styles.playerCount}>{teamPlayers.length} oyuncu</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.playerCell]}>Oyuncu</Text>
          <Text style={[styles.headerCell, styles.statCell]}>Gol</Text>
          <Text style={[styles.headerCell, styles.statCell]}>Asist</Text>
          <Text style={[styles.headerCell, styles.statCell]}>Sari</Text>
          <Text style={[styles.headerCell, styles.statCell]}>Kirmizi</Text>
        </View>

        <FlatList
          data={teamPlayers}
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
  teamName: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
  },
  playerCount: {
    color: "#d8e6f2",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "700",
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
    minHeight: 58,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#edf1f5",
  },
  playerCell: {
    flex: 1,
    minWidth: 0,
  },
  statCell: {
    width: 58,
    textAlign: "right",
  },
  playerName: {
    color: "#12263a",
    fontSize: 15,
    fontWeight: "800",
  },
  leagueName: {
    color: "#66788a",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "700",
  },
  statText: {
    color: "#0b5cab",
    fontSize: 15,
    fontWeight: "900",
  },
  statusText: {
    color: "#0b5cab",
    fontWeight: "800",
  },
  errorText: {
    color: "#b42318",
    fontWeight: "800",
  },
});

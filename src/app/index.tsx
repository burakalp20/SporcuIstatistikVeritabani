import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import LeagueSelector from "../components/LeagueSelector";
import PlayerCompareBar from "../components/PlayerCompareBar";
import RankingCard from "../components/RankingCard";
import SearchBar from "../components/SearchBar";
import { getLeagues, getPlayers } from "../services/api";
import type { Player } from "../types/player";

export default function Home() {
  const [league, setLeague] = useState("");
  const [leagues, setLeagues] = useState<string[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let active = true;

    // Ilk acilista ligleri backendden alir ve gelen ilk ligi varsayilan secim yapar.
    getLeagues()
      .then((items) => {
        if (!active) {
          return;
        }

        setLeagues(items);
        setLeague((current) => current || items[0] || "");
      })
      .catch(() => {
        if (active) {
          setError("Ligler yüklenemedi");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
    if (!league) {
      return undefined;
    }

    let active = true;

    setLoading(true);
    setError("");

    // Secilen lig degistikce oyuncu listesi SQL verisine gore yeniden yuklenir.
    getPlayers(league)
      .then((items) => {
        if (active) {
          setPlayers(items);
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
  }, [league]),
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerGrid}>
          <View style={styles.headerMain}>
            <Text style={styles.eyebrow}>Canlı veritabanı bağlantılı panel</Text>
            <Text style={styles.title}>Sporcu İstatistik Sistemi</Text>
            <Text style={styles.subtitle}>
              Liglere göre oyuncu performanslarını, takım kadrolarını ve
              krallık sıralamalarını incele.
            </Text>

            <SearchBar />
          </View>

          <View style={styles.compareColumn}>
            <PlayerCompareBar />
          </View>
        </View>
      </View>

      <View style={styles.toolbar}>
        <View>
          <Text style={styles.sectionTitle}>Ligler</Text>
          <Text style={styles.sectionMeta}>
            Seçili lig: {league || "Yükleniyor"}
          </Text>
        </View>

        <View style={styles.toolbarActions}>
          {loading && <Text style={styles.statusText}>Yükleniyor...</Text>}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/add-player" as any)}
          >
            <Text style={styles.addButtonText}>Yeni Oyuncu Ekle</Text>
          </Pressable>
        </View>
      </View>

      <LeagueSelector
        leagues={leagues}
        selected={league}
        onSelect={setLeague}
      />

      <View style={styles.gridRow}>
        <View style={styles.gridColumn}>
          {/* Lig degistiginde kart tamamen yenilensin; eski liste satirlari karismasin. */}
          <RankingCard
            key={`${league}-goals`}
            title="Gol Krallığı"
            data={players}
            valueKey="goals"
            selectedLeague={league}
          />
        </View>
        <View style={styles.gridColumn}>
          <RankingCard
            key={`${league}-assists`}
            title="Asist Krallığı"
            data={players}
            valueKey="assists"
            selectedLeague={league}
          />
        </View>
      </View>

      <View style={styles.gridRow}>
        <View style={styles.gridColumn}>
          <RankingCard
            key={`${league}-yellowCards`}
            title="Sarı Kart"
            data={players}
            valueKey="yellowCards"
            selectedLeague={league}
          />
        </View>
        <View style={styles.gridColumn}>
          <RankingCard
            key={`${league}-redCards`}
            title="Kırmızı Kart"
            data={players}
            valueKey="redCards"
            selectedLeague={league}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// UI'ın hazırlanmasında Codex kullanılmıştır.
// Ana sayfanın başlık paneli, arama alanı, lig araç çubuğu ve krallık kart yerleşimlerini düzenler.
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
    padding: 20,
    borderWidth: 1,
    borderColor: "#166534",
  },
  headerGrid: {
    flexDirection: "row",
    gap: 20,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  headerMain: {
    flex: 1,
    minWidth: 320,
  },
  compareColumn: {
    flex: 1,
    minWidth: 320,
    paddingTop: 46,
  },
  eyebrow: {
    color: "#bbf7d0",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: "#dcfce7",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
  },
  toolbar: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d1fae5",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  toolbarActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    color: "#143524",
    fontSize: 18,
    fontWeight: "800",
  },
  sectionMeta: {
    color: "#5f6f64",
    fontSize: 14,
    marginTop: 3,
  },
  statusText: {
    color: "#15803d",
    fontSize: 14,
    fontWeight: "700",
    alignSelf: "center",
  },
  errorText: {
    color: "#b42318",
    fontSize: 14,
    fontWeight: "700",
    alignSelf: "center",
  },
  addButton: {
    backgroundColor: "#15803d",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  gridColumn: {
    flex: 1,
  },
});

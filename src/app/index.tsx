import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import LeagueSelector from "../components/LeagueSelector";
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
          setError("Ligler yuklenemedi");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!league) {
      return;
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
          setError("Oyuncular yuklenemedi");
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
  }, [league]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Canli veritabani baglantili panel</Text>
        <Text style={styles.title}>Sporcu Istatistik Sistemi</Text>
        <Text style={styles.subtitle}>
          Liglere gore oyuncu performanslarini, takim kadrolarini ve krallik
          siralamalarini incele.
        </Text>

        <SearchBar />
      </View>

      <View style={styles.toolbar}>
        <View>
          <Text style={styles.sectionTitle}>Ligler</Text>
          <Text style={styles.sectionMeta}>
            Secili lig: {league || "Yukleniyor"}
          </Text>
        </View>

        {loading && <Text style={styles.statusText}>Yukleniyor...</Text>}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
            title="Gol Kralligi"
            data={players}
            valueKey="goals"
            selectedLeague={league}
          />
        </View>
        <View style={styles.gridColumn}>
          <RankingCard
            key={`${league}-assists`}
            title="Asist Kralligi"
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
            title="Sari Kart"
            data={players}
            valueKey="yellowCards"
            selectedLeague={league}
          />
        </View>
        <View style={styles.gridColumn}>
          <RankingCard
            key={`${league}-redCards`}
            title="Kirmizi Kart"
            data={players}
            valueKey="redCards"
            selectedLeague={league}
          />
        </View>
      </View>
    </ScrollView>
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
  header: {
    backgroundColor: "#0b2b4c",
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: "#123f6d",
  },
  eyebrow: {
    color: "#9fc2df",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#d8e6f2",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  toolbar: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d9e1ea",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: "#12263a",
    fontSize: 18,
    fontWeight: "800",
  },
  sectionMeta: {
    color: "#5d6f82",
    fontSize: 13,
    marginTop: 3,
  },
  statusText: {
    color: "#0b5cab",
    fontWeight: "700",
    alignSelf: "center",
  },
  errorText: {
    color: "#b42318",
    fontWeight: "700",
    alignSelf: "center",
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  gridColumn: {
    flex: 1,
  },
});

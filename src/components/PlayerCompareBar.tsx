import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { searchPlayers } from "../services/api";
import type { PlayerSearchResult } from "../types/player";

type SelectedPlayer = PlayerSearchResult;

export default function PlayerCompareBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SelectedPlayer[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const searchId = useRef(0);
  const router = useRouter();

  // Ana sayfaya geri dönüldüğünde önceki karşılaştırma seçimlerini temizler.
  useFocusEffect(
    useCallback(() => {
      setQuery("");
      setResults([]);
      setSelectedPlayers([]);
    }, []),
  );

  // Karşılaştırma alanında sadece oyuncu önerilerini arar.
  const handleSearch = async (text: string) => {
    setQuery(text);
    searchId.current += 1;
    const currentSearchId = searchId.current;

    if (text.trim().length === 0 || selectedPlayers.length >= 2) {
      setResults([]);
      return;
    }

    try {
      const players = await searchPlayers(text);

      if (currentSearchId === searchId.current) {
        setResults(
          players.filter(
            (player) =>
              player.type === "player" &&
              !selectedPlayers.some((selected) => selected.id === player.id),
          ),
        );
      }
    } catch {
      if (currentSearchId === searchId.current) {
        setResults([]);
      }
    }
  };

  // Seçilen oyuncuyu karşılaştırma listesine ekler.
  const addPlayer = (player: SelectedPlayer) => {
    if (selectedPlayers.length >= 2) {
      return;
    }

    setSelectedPlayers((current) => [...current, player]);
    setQuery("");
    setResults([]);
  };

  // Seçili oyuncu rozetine basıldığında oyuncuyu karşılaştırmadan çıkarır.
  const removePlayer = (playerId: number) => {
    setSelectedPlayers((current) =>
      current.filter((player) => player.id !== playerId),
    );
  };

  // İki oyuncu seçildiyse karşılaştırma sayfasına gerekli id'lere buradan gidilir.
  const comparePlayers = () => {
    if (selectedPlayers.length !== 2) {
      return;
    }

    router.push(
      `/compare?player1=${selectedPlayers[0].id}&player2=${selectedPlayers[1].id}` as any,
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oyuncu Karşılaştırma</Text>
      <Text style={styles.helperText}>İki oyuncu seç.</Text>

      <TextInput
        style={styles.input}
        placeholder="Karşılaştırmak için iki oyuncu seç"
        value={query}
        onChangeText={handleSearch}
        placeholderTextColor="#6b7d70"
        autoCapitalize="none"
        autoCorrect={false}
        editable={selectedPlayers.length < 2}
      />

      {results.length > 0 && (
        <View style={styles.results}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.resultRow}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>
                    {item.name} {item.surname}
                  </Text>
                  <Text style={styles.playerMeta}>
                    {item.position ? `${item.position} | ` : ""}
                    {item.team}
                  </Text>
                </View>
                <Pressable style={styles.addButton} onPress={() => addPlayer(item)}>
                  <Text style={styles.addButtonText}>+</Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      )}

      {selectedPlayers.length > 0 && (
        <View style={styles.selectedArea}>
          {selectedPlayers.map((player) => (
            <Pressable
              key={player.id}
              style={styles.selectedChip}
              onPress={() => removePlayer(player.id)}
            >
              <Text style={styles.selectedText}>
                {player.name} {player.surname}
              </Text>
              <Text style={styles.removeText}>x</Text>
            </Pressable>
          ))}
        </View>
      )}

      {selectedPlayers.length === 2 && (
        <Pressable style={styles.compareButton} onPress={comparePlayers}>
          <Text style={styles.compareText}>Karşılaştır</Text>
        </Pressable>
      )}
    </View>
  );
}

// UI'ın hazırlanmasında Codex kullanılmıştır.
// Oyuncu karşılaştırma arama panelini, seçilen oyuncu rozetlerini ve karşılaştırma butonunu düzenler.
const styles = StyleSheet.create({
  container: {
    minHeight: 0,
    zIndex: 900,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  helperText: {
    color: "#dcfce7",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  results: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    marginTop: 6,
    maxHeight: 168,
    overflow: "hidden",
  },
  resultRow: {
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5f3ea",
  },
  playerInfo: {
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    color: "#143524",
    fontSize: 14,
    fontWeight: "900",
  },
  playerMeta: {
    color: "#5f6f64",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#15803d",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22,
  },
  selectedArea: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
    alignItems: "center",
  },
  selectedChip: {
    backgroundColor: "#dcfce7",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedText: {
    color: "#14532d",
    fontSize: 13,
    fontWeight: "900",
  },
  removeText: {
    color: "#15803d",
    fontSize: 13,
    fontWeight: "900",
  },
  compareButton: {
    marginTop: 10,
    backgroundColor: "#dcfce7",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  compareText: {
    color: "#14532d",
    fontSize: 15,
    fontWeight: "900",
  },
});

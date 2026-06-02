import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { searchPlayersAndTeams } from "../services/api";
import type { SearchResult } from "../types/player";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  // Hizli yazarken eski API cevabi yeni arama sonucunun ustune yazmasin diye sayac tutulur.
  const searchId = useRef(0);
  const router = useRouter();

  const handleSearch = async (text: string) => {
    setQuery(text);
    searchId.current += 1;
    const currentSearchId = searchId.current;

    if (text.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await searchPlayersAndTeams(text);

      // Sadece en son baslatilan arama cevabi ekrana yazilir.
      if (currentSearchId === searchId.current) {
        setSuggestions(results);
      }
    } catch {
      if (currentSearchId === searchId.current) {
        setSuggestions([]);
      }
    }
  };

  const selectItem = (item: SearchResult) => {
    setQuery("");
    setSuggestions([]);

    if (item.type === "player") {
      // Oyuncu sonucu detay ekranina, takim sonucu takim ekranina yonlendirilir.
      router.push(`/player/${item.id}` as any);
    } else {
      router.push(`/team/${encodeURIComponent(item.name)}` as any);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Oyuncu veya takim ara"
        value={query}
        onChangeText={handleSearch}
        placeholderTextColor="#7f91a5"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.suggestionItem}
                onPress={() => selectItem(item)}
              >
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionText}>
                    {item.type === "player"
                      ? `${item.name} ${item.surname}`
                      : item.name}
                  </Text>
                  <Text style={styles.suggestionSubtext}>
                    {item.type === "player" ? item.team : "Takim"}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#b8cadc",
  },
  suggestionsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d9e1ea",
    marginTop: 6,
    zIndex: 1001,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 260,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#edf1f5",
  },
  suggestionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  suggestionText: {
    color: "#12263a",
    fontSize: 15,
    fontWeight: "800",
  },
  suggestionSubtext: {
    color: "#66788a",
    fontSize: 12,
    fontWeight: "700",
  },
});

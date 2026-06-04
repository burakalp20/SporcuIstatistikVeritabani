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
  // Hızlı yazarken eski API cevabı yeni arama sonucunun üstüne yazmasın diye sayac tutulur.
  const searchId = useRef(0);
  const router = useRouter();

  // Kullanıcı yazdıkça backend'den oyuncu ve takım önerilerini alır.
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

  // Seçilen arama sonucunun tipine göre oyuncu profiline veya takım sayfasına yönlendirir.
  const selectItem = (item: SearchResult) => {
    setQuery("");
    setSuggestions([]);

    // Oyuncu seçilirse profil sayfasına, takım seçilirse takim kadrosuna gidilir.
    if (item.type === "player") {
      router.push(`/player/${item.id}` as any);
      return;
    }

    router.push(`/team/${encodeURIComponent(item.team)}` as any);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Oyuncu veya takım ara"
        value={query}
        onChangeText={handleSearch}
        placeholderTextColor="#6b7d70"
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
                    {item.name} {item.surname}
                  </Text>
                  <Text style={styles.suggestionSubtext}>
                    {item.type === "team"
                      ? "Takım"
                      : `${item.position ? `${item.position} | ` : ""}${item.team}`}
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

// UI'ın hazırlanmasında Codex kullanılmıştır.
// Genel oyuncu/takım arama çubuğunu ve arama önerisi listesinin görünümünü düzenler.
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
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  suggestionsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
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
    borderBottomColor: "#e5f3ea",
  },
  suggestionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  suggestionText: {
    color: "#143524",
    fontSize: 16,
    fontWeight: "900",
  },
  suggestionSubtext: {
    color: "#5f6f64",
    fontSize: 13,
    fontWeight: "800",
  },
});

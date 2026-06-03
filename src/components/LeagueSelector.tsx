import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  leagues: string[];
  selected: string;
  onSelect: (league: string) => void;
};

export default function LeagueSelector({ leagues, selected, onSelect }: Props) {
  // Ligler sabit listeden degil, backendden gelen dizi uzerinden olusturulur.
  return (
    <View style={styles.container}>
      {leagues.map((league) => {
        const isSelected = selected === league;

        return (
          <Pressable
            key={league}
            onPress={() => onSelect(league)}
            style={[styles.item, isSelected && styles.selectedItem]}
          >
            <Text style={[styles.text, isSelected && styles.selectedText]}>
              {league}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// UI'ın hazırlanmasında Codex kullanılmıştır.
// Lig seçim butonlarının boşluklarını, kenarlıklarını ve seçili lig rengini düzenler.
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: 8,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  item: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1fae5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f8fbf8",
  },
  selectedItem: {
    backgroundColor: "#15803d",
    borderColor: "#15803d",
  },
  text: {
    color: "#1f3d2c",
    fontSize: 14,
    fontWeight: "800",
  },
  selectedText: {
    color: "white",
  },
});

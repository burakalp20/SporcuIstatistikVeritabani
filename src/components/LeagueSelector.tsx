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

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d9e1ea",
    padding: 8,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  item: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d2dbe5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f7f9fb",
  },
  selectedItem: {
    backgroundColor: "#0b5cab",
    borderColor: "#0b5cab",
  },
  text: {
    color: "#24364a",
    fontSize: 13,
    fontWeight: "700",
  },
  selectedText: {
    color: "white",
  },
});

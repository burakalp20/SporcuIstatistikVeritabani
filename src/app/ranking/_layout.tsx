import { Stack } from "expo-router";

export default function RankingLayout() {
  return (
    // Krallik sayfalari kendi stack yapisini kullanir; geri butonu acik, baslik metni bostur.
    <Stack
      screenOptions={{
        headerShown: true,
        title: "",
        headerTitle: "",
        headerBackTitle: "",
        headerBackVisible: true,
        headerTintColor: "#0b5cab",
      }}
    >
      <Stack.Screen
        name="[type]"
        options={{
          title: "",
          headerTitle: "",
          headerBackTitle: "",
          headerTintColor: "#0b5cab",
        }}
      />
    </Stack>
  );
}

import { Stack } from "expo-router";

export default function RankingLayout() {
  return (
    // Krallık sayfaları kendi stack yapısını kullanır; geri butonu açık, başlık metni boştur.
    <Stack
      screenOptions={{
        headerShown: true,
        title: "",
        headerTitle: "",
        headerBackTitle: "",
        headerBackVisible: true,
        headerTintColor: "#15803d",
      }}
    >
      <Stack.Screen
        name="[type]"
        options={{
          title: "",
          headerTitle: "",
          headerBackTitle: "",
          headerTintColor: "#15803d",
        }}
      />
    </Stack>
  );
}

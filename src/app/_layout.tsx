import { Stack } from "expo-router";

export default function Layout() {
  return (
    // Ana sayfada baslik gizli, detay sayfalarinda geri butonu gorunur olacak sekilde rota yapisi tanimlanir.
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: "#0b5cab",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="ranking" />
      <Stack.Screen
        name="player/[id]"
        options={{
          headerShown: true,
          headerBackTitle: "Geri",
          headerTintColor: "#0b5cab",
          title: "",
        }}
      />
      <Stack.Screen
        name="team/[name]"
        options={{
          headerShown: true,
          headerBackTitle: "Geri",
          headerTintColor: "#0b5cab",
          title: "",
        }}
      />
    </Stack>
  );
}

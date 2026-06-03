import { Stack } from "expo-router";

export default function Layout() {
  return (
    // Ana sayfada baslik gizli, detay sayfalarinda geri butonu gorunur olacak sekilde rota yapisi tanimlanir.
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: "#15803d",
      }}
      >
      <Stack.Screen name="index" />
      {/* Yeni oyuncu ekleme sayfası üst başlık ve geri butonu ile açılır. */}
      <Stack.Screen
        name="add-player"
        options={{
          headerShown: true,
          headerBackTitle: "Geri",
          headerTintColor: "#15803d",
          title: "Yeni Oyuncu Ekle",
        }}
      />
      {/* Oyuncu karşılaştırma sayfası seçilen iki oyuncuyu ayrı bir ekranda gösterir. */}
      <Stack.Screen
        name="compare"
        options={{
          headerShown: true,
          headerBackTitle: "Geri",
          headerTintColor: "#15803d",
          title: "Oyuncu Karşılaştırma",
        }}
      />
      <Stack.Screen name="ranking" />
      {/* Oyuncu detay sayfası dinamik id parametresiyle ilgili oyuncuyu açar. */}
      <Stack.Screen
        name="player/[id]"
        options={{
          headerShown: true,
          headerBackTitle: "Geri",
          headerTintColor: "#15803d",
          title: "",
        }}
      />
      {/* Takım detay sayfası URL'deki takım adına göre kadro listesini açar. */}
      <Stack.Screen
        name="team/[name]"
        options={{
          headerShown: true,
          headerBackTitle: "Geri",
          headerTintColor: "#15803d",
          title: "",
        }}
      />
    </Stack>
  );
}

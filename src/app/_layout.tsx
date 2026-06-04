import { Stack } from "expo-router";

export default function Layout() {
  return (
    // Uygulama içerisindeki ekran geçişleri ve navigasyon ayarlarını tanımlayan kod.
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: "#15803d",
      }}
      >
      <Stack.Screen name="index" />
      {/* Yeni oyuncu ekleme sayfasını üst başlık ve geri dönüş butonu ile açan kod. */}
      <Stack.Screen
        name="add-player"
        options={{
          headerShown: true,
          headerBackTitle: "Geri",
          headerTintColor: "#15803d",
          title: "Yeni Oyuncu Ekle",
        }}
      />
      {/* İki oyuncunun istatistiklerini karşılaştırmalı olarak gösteren ekranı oluşturan kod. */}
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
      {/* Seçilen oyuncunun detay bilgilerini dinamik ID parametresine göre görüntüleyen kod. */}
      <Stack.Screen
        name="player/[id]"
        options={{
          headerShown: true,
          headerBackTitle: "Geri",
          headerTintColor: "#15803d",
          title: "",
        }}
      />
      {/* Seçilen takımın kadro ve istatistik bilgilerini listeleyen detay sayfası kodu. */}
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

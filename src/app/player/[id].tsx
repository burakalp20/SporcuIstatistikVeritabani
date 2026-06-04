import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { deletePlayer, getPlayer } from "../../services/api";
import type { Player } from "../../types/player";

export default function PlayerScreen() {
  // URL'deki /player/[id] parametresi hangi oyuncunun detaının açılacağını belirler.
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    // Oyuncu detayi mockData'dan degil, backenddeki /players/:id endpointinden gelir.
    getPlayer(Number(id))
      .then((item) => {
        if (active) {
          setPlayer(item);
        }
      })
      .catch(() => {
        if (active) {
          setPlayer(null);
          setError("Oyuncu bulunamadı");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  useLayoutEffect(() => {
    // Oyuncu geldikten sonra ekran basligi dinamik olarak ad-soyad ile guncellenir.
    if (player) {
      navigation.setOptions({
        title: `${player.name} ${player.surname}`,
        headerTitle: `${player.name} ${player.surname}`,
        headerShown: true,
      });
    }
  }, [navigation, player]);

  // Onay penceresinde "Sil" seçildiğinde oyuncuyu veritabanından kaldıran kod.
  const confirmDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      await deletePlayer(Number(id));
      setConfirmVisible(false);
      router.replace("/");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Oyuncu silinemedi",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.page}>
        <Text style={styles.statusText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.page}>
        <Text style={styles.errorText}>{error || "Oyuncu bulunamadı"}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {player.name.charAt(0)}
            {player.surname.charAt(0)}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {player.name} {player.surname}
            </Text>
            {player.position ? (
              <Text style={styles.positionBadge}>{player.position}</Text>
            ) : null}
          </View>
          <Text style={styles.team}>{player.team}</Text>
          <Text style={styles.league}>
            {player.league} | Sezon {player.season}
          </Text>
        </View>
        <Pressable
          style={styles.deleteButton}
          onPress={() => setConfirmVisible(true)}
        >
          <Text style={styles.deleteButtonText}>Oyuncuyu Sil</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.statsLayout}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sezon İstatistikleri</Text>
          <View style={styles.statsContainer}>
            <StatBox label="Gol" value={player.goals} />
            <StatBox label="Asist" value={player.assists} />
            <StatBox label="Sarı Kart" value={player.yellowCards} />
            <StatBox label="Kırmızı Kart" value={player.redCards} />
            <StatBox label="Dakika" value={player.minutes} />
          </View>
        </View>

        {player.clubCareer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kulüp Kariyeri</Text>
            <View style={styles.statsContainer}>
              <StatBox label="Maç" value={player.clubCareer.matches} />
              <StatBox label="Gol" value={player.clubCareer.goals} />
              <StatBox label="Asist" value={player.clubCareer.assists} />
            </View>
          </View>
        )}
      </View>

      <Modal transparent visible={confirmVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Oyuncuyu silmek istediğinizden emin misiniz?</Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setConfirmVisible(false)}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmDeleteButton, deleting && styles.disabledButton]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                <Text style={styles.confirmDeleteText}>
                  {deleting ? "Siliniyor..." : "Sil"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Oyuncu profilindeki tek bir istatistik satırını etiket ve değer olarak gösterir.
function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// UI'ın hazırlanmasında Codex kullanılmıştır.
// Oyuncu profil başlığını, istatistik kutularını ve oyuncu silme onay penceresini düzenler.
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },
  content: {
    padding: 20,
    gap: 14,
  },
  profileHeader: {
    backgroundColor: "#14532d",
    borderRadius: 8,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 8,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#14532d",
    fontSize: 24,
    fontWeight: "900",
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  name: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
  },
  positionBadge: {
    color: "#14532d",
    backgroundColor: "#bbf7d0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "900",
  },
  team: {
    color: "#dcfce7",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  league: {
    color: "#bbf7d0",
    fontSize: 14,
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: "#d92d20",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "900",
  },
  statsLayout: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  section: {
    flex: 1,
    minWidth: 300,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: 16,
  },
  sectionTitle: {
    color: "#143524",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  statsContainer: {
    gap: 8,
  },
  statBox: {
    minHeight: 48,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statValue: {
    color: "#15803d",
    fontSize: 24,
    fontWeight: "900",
  },
  statLabel: {
    color: "#5f6f64",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  statusText: {
    color: "#15803d",
    fontWeight: "800",
    padding: 20,
  },
  errorText: {
    color: "#b42318",
    fontWeight: "800",
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(7, 18, 33, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  confirmBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: 18,
  },
  confirmTitle: {
    color: "#143524",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 16,
  },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#d1fae5",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: "#143524",
    fontSize: 14,
    fontWeight: "900",
  },
  confirmDeleteButton: {
    backgroundColor: "#d92d20",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  confirmDeleteText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.65,
  },
});

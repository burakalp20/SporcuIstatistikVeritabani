import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  createPlayer,
  searchLeagueOptions,
  searchTeamOptions,
} from "../services/api";
import type { LeagueOption, NewPlayerInput, TeamOption } from "../types/player";

const positionOptions = [
  "Kaleci",
  "Stoper",
  "Sağ Bek",
  "Sol Bek",
  "Ön Libero",
  "Orta Saha",
  "Sağ Kanat",
  "Sol Kanat",
  "Forvet",
];

const emptyForm = {
  name: "",
  surname: "",
  birthDate: "",
  nationality: "",
  position: "",
  league: "",
  leagueCountry: "",
  team: "",
  teamCity: "",
  teamFoundedYear: "",
  season: "24-25",
  matches: "0",
  goals: "0",
  assists: "0",
  yellowCards: "0",
  redCards: "0",
  minutes: "0",
  careerMatches: "0",
  careerGoals: "0",
  careerAssists: "0",
};

export default function AddPlayerScreen() {
  const [form, setForm] = useState(emptyForm);
  const [leagueOptions, setLeagueOptions] = useState<LeagueOption[]>([]);
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const leagueSearchId = useRef(0);
  const teamSearchId = useRef(0);
  const router = useRouter();

  // Formdaki tek bir alanın değerini günceller.
  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  // Lig alanına yazıldıkça SQL'deki lig seçeneklerini arar.
  const handleLeagueSearch = async (text: string) => {
    updateField("league", text);
    leagueSearchId.current += 1;
    const currentSearchId = leagueSearchId.current;

    if (!text.trim()) {
      setLeagueOptions([]);
      return;
    }

    try {
      const results = await searchLeagueOptions(text);

      if (currentSearchId === leagueSearchId.current) {
        setLeagueOptions(results);
      }
    } catch {
      if (currentSearchId === leagueSearchId.current) {
        setLeagueOptions([]);
      }
    }
  };

  // Lig seçildiğinde lig adı ve ülke bilgisini forma yerleştirir.
  const selectLeague = (league: LeagueOption) => {
    setForm((current) => ({
      ...current,
      league: league.name,
      leagueCountry: league.country,
    }));
    setLeagueOptions([]);
  };

  // Takım alanına yazıldıkça SQL'deki takım seçeneklerini arar.
  const handleTeamSearch = async (text: string) => {
    updateField("team", text);
    teamSearchId.current += 1;
    const currentSearchId = teamSearchId.current;

    if (!text.trim()) {
      setTeamOptions([]);
      return;
    }

    try {
      const results = await searchTeamOptions(text);

      if (currentSearchId === teamSearchId.current) {
        setTeamOptions(results);
      }
    } catch {
      if (currentSearchId === teamSearchId.current) {
        setTeamOptions([]);
      }
    }
  };

  // Takım seçildiğinde takım, şehir, kuruluş yılı ve lig bilgilerini otomatik doldurur.
  const selectTeam = (team: TeamOption) => {
    setForm((current) => ({
      ...current,
      team: team.name,
      teamCity: team.city,
      teamFoundedYear:
        team.foundedYear === null || team.foundedYear === undefined
          ? ""
          : String(team.foundedYear),
      league: team.league,
      leagueCountry: team.leagueCountry,
    }));
    setTeamOptions([]);
    setLeagueOptions([]);
  };

  // Sayısal inputlardaki metni negatif olmayan tam sayıya çevirir.
  const toNumber = (value: string) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : 0;
  };

  // Boş bırakılabilen sayı alanlarında boş değeri null olarak gönderir.
  const toNullableNumber = (value: string) => {
    if (!value.trim()) {
      return null;
    }

    return toNumber(value);
  };

  // Formdaki string değerleri backend'in beklediği NewPlayerInput formatına dönüştürür.
  const buildPayload = (): NewPlayerInput => ({
    name: form.name.trim(),
    surname: form.surname.trim(),
    birthDate: form.birthDate.trim(),
    nationality: form.nationality.trim(),
    position: form.position.trim(),
    league: form.league.trim(),
    leagueCountry: form.leagueCountry.trim(),
    team: form.team.trim(),
    teamCity: form.teamCity.trim(),
    teamFoundedYear: toNullableNumber(form.teamFoundedYear),
    season: form.season.trim(),
    matches: toNumber(form.matches),
    goals: toNumber(form.goals),
    assists: toNumber(form.assists),
    yellowCards: toNumber(form.yellowCards),
    redCards: toNumber(form.redCards),
    minutes: toNumber(form.minutes),
    careerMatches: toNumber(form.careerMatches),
    careerGoals: toNumber(form.careerGoals),
    careerAssists: toNumber(form.careerAssists),
  });

  // Zorunlu alanları kontrol eder, oyuncuyu SQL'e kaydeder ve yeni profil sayfasına gider.
  const savePlayer = async () => {
    const payload = buildPayload();
    const requiredFields = [
      payload.name,
      payload.surname,
      payload.birthDate,
      payload.nationality,
      payload.position,
      payload.league,
      payload.team,
      payload.season,
    ];

    if (requiredFields.some((value) => !value)) {
      setMessage("Ad, soyad, doğum tarihi, uyruk, mevki, lig, takım ve sezon zorunlu.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const result = await createPlayer(payload);
      setForm(emptyForm);
      router.replace(`/player/${result.id}` as any);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Oyuncu eklenemedi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Veritabanı kaydı</Text>
        <Text style={styles.title}>Yeni Oyuncu Ekle</Text>
        <Text style={styles.subtitle}>
          Girilen bilgiler SQL veritabanına kaydedilir ve listelerde görünür.
        </Text>
      </View>

      <View style={styles.formGrid}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Oyuncu Bilgileri</Text>
          <View style={styles.twoColumn}>
            <FormInput label="Ad" value={form.name} onChangeText={(text) => updateField("name", text)} />
            <FormInput label="Soyad" value={form.surname} onChangeText={(text) => updateField("surname", text)} />
          </View>
          <View style={styles.twoColumn}>
            <FormInput label="Doğum Tarihi" placeholder="YYYY-MM-DD" value={form.birthDate} onChangeText={(text) => updateField("birthDate", text)} />
            <FormInput label="Uyruk" value={form.nationality} onChangeText={(text) => updateField("nationality", text)} />
          </View>
          <FormInput label="Mevki" value={form.position} onChangeText={(text) => updateField("position", text)} />
          <View style={styles.chipRow}>
            {positionOptions.map((position) => (
              <Pressable
                key={position}
                style={[
                  styles.positionChip,
                  form.position === position && styles.activeChip,
                ]}
                onPress={() => updateField("position", position)}
              >
                <Text
                  style={[
                    styles.positionChipText,
                    form.position === position && styles.activeChipText,
                  ]}
                >
                  {position}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Takım ve Lig</Text>
          <View style={styles.twoColumn}>
            <SearchInput
              label="Lig"
              value={form.league}
              onChangeText={handleLeagueSearch}
              options={leagueOptions}
              onSelect={selectLeague}
              renderTitle={(league) => league.name}
              renderSubtitle={(league) => league.country}
            />
            <FormInput label="Lig Ülkesi" value={form.leagueCountry} onChangeText={(text) => updateField("leagueCountry", text)} />
          </View>
          <View style={styles.twoColumn}>
            <SearchInput
              label="Takım"
              value={form.team}
              onChangeText={handleTeamSearch}
              options={teamOptions}
              onSelect={selectTeam}
              renderTitle={(team) => team.name}
              renderSubtitle={(team) => `${team.league} | ${team.city}`}
            />
            <FormInput label="Takım Şehri" value={form.teamCity} onChangeText={(text) => updateField("teamCity", text)} />
          </View>
          <View style={styles.twoColumn}>
            <FormInput label="Kuruluş Yılı" keyboardType="numeric" value={form.teamFoundedYear} onChangeText={(text) => updateField("teamFoundedYear", text)} />
            <FormInput label="Sezon" value={form.season} onChangeText={(text) => updateField("season", text)} />
          </View>
        </View>
      </View>

      <View style={styles.formGrid}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sezon İstatistikleri</Text>
          <View style={styles.numberGrid}>
            <FormInput label="Maç" keyboardType="numeric" value={form.matches} onChangeText={(text) => updateField("matches", text)} />
            <FormInput label="Gol" keyboardType="numeric" value={form.goals} onChangeText={(text) => updateField("goals", text)} />
            <FormInput label="Asist" keyboardType="numeric" value={form.assists} onChangeText={(text) => updateField("assists", text)} />
            <FormInput label="Sarı Kart" keyboardType="numeric" value={form.yellowCards} onChangeText={(text) => updateField("yellowCards", text)} />
            <FormInput label="Kırmızı Kart" keyboardType="numeric" value={form.redCards} onChangeText={(text) => updateField("redCards", text)} />
            <FormInput label="Dakika" keyboardType="numeric" value={form.minutes} onChangeText={(text) => updateField("minutes", text)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kulüp Kariyeri</Text>
          <View style={styles.numberGrid}>
            <FormInput label="Maç" keyboardType="numeric" value={form.careerMatches} onChangeText={(text) => updateField("careerMatches", text)} />
            <FormInput label="Gol" keyboardType="numeric" value={form.careerGoals} onChangeText={(text) => updateField("careerGoals", text)} />
            <FormInput label="Asist" keyboardType="numeric" value={form.careerAssists} onChangeText={(text) => updateField("careerAssists", text)} />
          </View>
        </View>
      </View>

      {message ? <Text style={styles.errorText}>{message}</Text> : null}

      <Pressable
        style={[styles.saveButton, saving && styles.disabledButton]}
        onPress={savePlayer}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Kaydediliyor..." : "Oyuncuyu Kaydet"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// Standart metin/sayı inputlarını ortak etiket ve stil ile gösterir.
function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#6b7d70"
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

// Lig ve takım alanlarında öneri listesi gösteren tekrar kullanılabilir arama inputudur.
function SearchInput<T extends { id: number }>({
  label,
  value,
  onChangeText,
  options,
  onSelect,
  renderTitle,
  renderSubtitle,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  options: T[];
  onSelect: (item: T) => void;
  renderTitle: (item: T) => string;
  renderSubtitle: (item: T) => string;
}) {
  return (
    <View style={[styles.inputGroup, styles.searchGroup]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#6b7d70"
        autoCapitalize="none"
      />

      {options.length > 0 && (
        <View style={styles.optionList}>
          {options.map((option) => (
            <Pressable
              key={option.id}
              style={styles.optionRow}
              onPress={() => onSelect(option)}
            >
              <Text style={styles.optionTitle}>{renderTitle(option)}</Text>
              <Text style={styles.optionSubtitle}>{renderSubtitle(option)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// UI'ın hazırlanmasında Codex kullanılmıştır.
// Yeni oyuncu ekleme formunun bölümlerini, inputlarını, arama önerilerini ve kayıt butonunu düzenler.
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },
  content: {
    padding: 20,
    gap: 14,
  },
  header: {
    backgroundColor: "#14532d",
    borderRadius: 8,
    padding: 18,
  },
  eyebrow: {
    color: "#bbf7d0",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    color: "white",
    fontSize: 25,
    fontWeight: "900",
  },
  subtitle: {
    color: "#dcfce7",
    fontSize: 15,
    marginTop: 8,
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  section: {
    flex: 1,
    minWidth: 320,
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
  twoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  numberGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  inputGroup: {
    flex: 1,
    minWidth: 150,
    marginBottom: 10,
  },
  searchGroup: {
    zIndex: 20,
  },
  label: {
    color: "#4f6356",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#d1fae5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: "#143524",
    fontSize: 15,
    fontWeight: "700",
  },
  optionList: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1fae5",
    borderRadius: 8,
    marginTop: 6,
    overflow: "hidden",
  },
  optionRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5f3ea",
  },
  optionTitle: {
    color: "#143524",
    fontSize: 15,
    fontWeight: "900",
  },
  optionSubtitle: {
    color: "#5f6f64",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  positionChip: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#d1fae5",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  activeChip: {
    backgroundColor: "#15803d",
    borderColor: "#15803d",
  },
  positionChipText: {
    color: "#14532d",
    fontSize: 13,
    fontWeight: "900",
  },
  activeChipText: {
    color: "white",
  },
  errorText: {
    color: "#b42318",
    fontWeight: "800",
  },
  saveButton: {
    backgroundColor: "#15803d",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },
});

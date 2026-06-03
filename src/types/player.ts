export type RankingKey = "goals" | "assists" | "yellowCards" | "redCards";

// Backend SQL verisini bu tipe cevirir; ekranlar artik mockData yerine bu modeli kullanir.
export type Player = {
  // Liste elemanlarini React icin benzersiz tutar. Ayni oyuncunun birden fazla
  // sezon/istatistik satiri oldugunda sadece id kullanmak yeterli olmayabilir.
  rowKey?: string;
  id: number;
  name: string;
  surname: string;
  position?: string;
  team: string;
  league: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
  season: string;
  clubCareer?: {
    matches: number;
    goals: number;
    assists: number;
  };
};

// Arama kutusu hem oyuncu hem takim sonucu gosterdigi icin iki farkli sonuc tipi tutulur.
export type SearchResult =
  | {
      id: number;
      name: string;
      surname: string;
      position?: string;
      team: string;
      type: "player";
    }
  | {
      id: string;
      name: string;
      surname: "";
      team: string;
      type: "team";
    };

// Genel arama sonucundan sadece oyuncu tipini ayırmak için kullanılır.
export type PlayerSearchResult = Extract<SearchResult, { type: "player" }>;

// Yeni oyuncu formunda lig seçildiğinde doldurulacak lig bilgilerini temsil eder.
export type LeagueOption = {
  id: number;
  name: string;
  country: string;
};

// Yeni oyuncu formunda takım seçildiğinde otomatik doldurulacak takım bilgilerini temsil eder.
export type TeamOption = {
  id: number;
  name: string;
  city: string;
  foundedYear: number | null;
  league: string;
  leagueCountry: string;
};

// Yeni oyuncu ekleme formunun backend'e göndereceği tüm alanları tanımlar.
export type NewPlayerInput = {
  name: string;
  surname: string;
  birthDate: string;
  nationality: string;
  position: string;
  league: string;
  leagueCountry: string;
  team: string;
  teamCity: string;
  teamFoundedYear: number | null;
  season: string;
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutes: number;
  careerMatches: number;
  careerGoals: number;
  careerAssists: number;
};

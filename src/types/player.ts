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

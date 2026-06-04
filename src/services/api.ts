import type {
  LeagueOption,
  NewPlayerInput,
  Player,
  PlayerSearchResult,
  RankingKey,
  SearchResult,
  TeamOption,
} from "../types/player";

// Expo uygulamasi tum veriyi Node.js backendinden alir.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

function buildUrl(path: string, params: Record<string, string | undefined> = {}) {
  // Bos parametreler URL'ye eklenmez; dolu parametreler encode edilerek gonderilir.
  const query = Object.entries(params)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`,
    )
    .join("&");

  return `${API_BASE_URL}${path}${query ? `?${query}` : ""}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  // Tum API istekleri burada toplandigi icin hata kontrolu tek yerde yapilir.
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API hatası: ${response.status}`);
  }

  return response.json();
}

export function getLeagues() {
  return fetchJson<string[]>(buildUrl("/leagues"));
}

// Yeni oyuncu formundaki lig araması için SQL'deki lig kayıtları burada getirir.
export function searchLeagueOptions(query: string) {
  return fetchJson<LeagueOption[]>(buildUrl("/league-options", { q: query }));
}

// Yeni oyuncu formundaki takım araması için SQL'deki takım kayıtları burada getirir.
export function searchTeamOptions(query: string) {
  return fetchJson<TeamOption[]>(buildUrl("/team-options", { q: query }));
}

// Ana sayfada seçilen lige göre oyuncu istatistikleri burada listelenir.
export function getPlayers(league?: string) {
  return fetchJson<Player[]>(buildUrl("/players", { league }));
}

// Oyuncu profil sayfası için tek bir oyuncunun detay bilgisi burada getirir.
export function getPlayer(id: number) {
  return fetchJson<Player>(buildUrl(`/players/${id}`));
}

// Takım sayfasında gösterilecek kadro listesini takım adına göre burada getirir.
export function getTeamPlayers(teamName: string) {
  return fetchJson<Player[]>(buildUrl(`/teams/${encodeURIComponent(teamName)}`));
}

// Krallık sayfaları için gol, asist veya kart sıralamasını buradagetirir.
export function getRanking(type: RankingKey, league?: string) {
  return fetchJson<Player[]>(buildUrl(`/rankings/${type}`, { league }));
}

// Yeni oyuncu ekleme formundaki bilgileri backend'e gönderip SQL'e burada kaydeder.
export async function createPlayer(player: NewPlayerInput) {
  const response = await fetch(buildUrl("/players"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(player),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || `API hatası: ${response.status}`);
  }

  return response.json() as Promise<{ id: number }>;
}

// Oyuncu profilindeki silme işlemini backend'e bu kod bildirir.
export async function deletePlayer(id: number) {
  const response = await fetch(buildUrl(`/players/${id}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || `API hatası: ${response.status}`);
  }

  return response.json() as Promise<{ ok: boolean }>;
}

// Genel arama çubuğu için oyuncu ve takım sonuçlarını tek listede toplar.
export async function searchPlayersAndTeams(query: string) {
  const result = await fetchJson<{
    players: Array<{
      id: number;
      name: string;
      surname: string;
      position?: string;
      team: string;
    }>;
    teams: string[];
  }>(buildUrl("/search", { q: query }));

  // Backend oyuncu ve takimlari ayrı dondurur arama kutusu tek liste gösterdiği için burada ortak SearchResult formatına çevrilir.
  return [
    ...result.players.map<SearchResult>((player) => ({
      ...player,
      type: "player",
    })),
    ...result.teams.map<SearchResult>((team) => ({
      id: `team-${team}`,
      name: team,
      surname: "",
      team,
      type: "team",
    })),
  ];
}

// Oyuncu karşılaştırma paneli sadece oyuncu seçebildiği için takım sonuçlarını burada filtreler.
export async function searchPlayers(query: string): Promise<PlayerSearchResult[]> {
  const results = await searchPlayersAndTeams(query);

  return results.filter(
    (result): result is PlayerSearchResult => result.type === "player",
  );
}

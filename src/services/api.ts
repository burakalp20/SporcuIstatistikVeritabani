import type { Player, RankingKey, SearchResult } from "../types/player";

// Expo uygulamasi tum veriyi Node.js backendinden alir.
// Telefonda test ederken bu adres .env ile bilgisayarin yerel IP'sine cevrilebilir.
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
    throw new Error(`API hatasi: ${response.status}`);
  }

  return response.json();
}

export function getLeagues() {
  return fetchJson<string[]>(buildUrl("/leagues"));
}

export function getPlayers(league?: string) {
  return fetchJson<Player[]>(buildUrl("/players", { league }));
}

export function getPlayer(id: number) {
  return fetchJson<Player>(buildUrl(`/players/${id}`));
}

export function getTeamPlayers(teamName: string) {
  return fetchJson<Player[]>(buildUrl(`/teams/${encodeURIComponent(teamName)}`));
}

export function getRanking(type: RankingKey, league?: string) {
  return fetchJson<Player[]>(buildUrl(`/rankings/${type}`, { league }));
}

export async function searchPlayersAndTeams(query: string) {
  const result = await fetchJson<{
    players: Array<{
      id: number;
      name: string;
      surname: string;
      team: string;
    }>;
    teams: string[];
  }>(buildUrl("/search", { q: query }));

  // Backend oyuncu ve takimlari ayri dondurur; arama kutusu tek liste gosterdigi
  // icin burada ortak SearchResult formatina cevrilir.
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

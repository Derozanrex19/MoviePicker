import type { Genre } from "../types";

export const TMDB_GENRES: Genre[] = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 53, name: "Thriller" },
  { id: 878, name: "Sci-Fi" },
  { id: 10749, name: "Romance" },
  { id: 16, name: "Animation" },
  { id: 9648, name: "Mystery" },
  { id: 27, name: "Horror" },
  { id: 10751, name: "Family" },
  { id: 12, name: "Adventure" },
];

export const GENRE_MAP: Record<number, string> = Object.fromEntries(
  TMDB_GENRES.map((g) => [g.id, g.name])
);

export function getGenreName(id: number): string {
  return GENRE_MAP[id] ?? "Unknown";
}

export function getGenreNames(ids: number[]): string[] {
  return ids.map(getGenreName).filter((n) => n !== "Unknown");
}

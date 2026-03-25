import type { Movie, Genre } from "../types";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";

export const POSTER_BASE = "https://image.tmdb.org/t/p";
export const POSTER_SIZES = { small: "w185", medium: "w342", large: "w500", original: "original" } as const;

export function getPosterUrl(path: string | null, size: keyof typeof POSTER_SIZES = "medium"): string {
  if (!path) return "";
  return `${POSTER_BASE}/${POSTER_SIZES[size]}${path}`;
}

export function getBackdropUrl(path: string | null): string {
  if (!path) return "";
  return `${POSTER_BASE}/w1280${path}`;
}

export function isApiAvailable(): boolean {
  return Boolean(API_KEY);
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

interface TMDBListResponse {
  results: Movie[];
  total_pages: number;
  total_results: number;
}

interface TMDBGenreResponse {
  genres: Genre[];
}

export async function getGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<TMDBGenreResponse>("/genre/movie/list", { language: "en-US" });
  return data.genres;
}

export interface DiscoverParams {
  genreIds?: number[];
  minVoteAverage?: number;
  minVoteCount?: number;
  maxRuntime?: number;
  minRuntime?: number;
  sortBy?: string;
  page?: number;
  releaseDateGte?: string;
  releaseDateLte?: string;
  withOriginalLanguage?: string;
}

export async function discoverMovies(params: DiscoverParams): Promise<{ movies: Movie[]; totalPages: number }> {
  const queryParams: Record<string, string> = {
    language: "en-US",
    include_adult: "false",
    include_video: "false",
    sort_by: params.sortBy || "vote_average.desc",
    "vote_count.gte": String(params.minVoteCount ?? 50),
    page: String(params.page ?? 1),
  };

  if (params.genreIds?.length) {
    queryParams.with_genres = params.genreIds.join("|");
  }
  if (params.minVoteAverage) {
    queryParams["vote_average.gte"] = String(params.minVoteAverage);
  }
  if (params.maxRuntime && params.maxRuntime < 900) {
    queryParams["with_runtime.lte"] = String(params.maxRuntime);
  }
  if (params.minRuntime) {
    queryParams["with_runtime.gte"] = String(params.minRuntime);
  }
  if (params.releaseDateGte) {
    queryParams["primary_release_date.gte"] = params.releaseDateGte;
  }
  if (params.releaseDateLte) {
    queryParams["primary_release_date.lte"] = params.releaseDateLte;
  }
  if (params.withOriginalLanguage) {
    queryParams.with_original_language = params.withOriginalLanguage;
  }

  const data = await tmdbFetch<TMDBListResponse>("/discover/movie", queryParams);
  return { movies: data.results, totalPages: data.total_pages };
}

interface TMDBMovieDetail extends Movie {
  runtime: number;
  genres: Genre[];
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetail> {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${movieId}`, { language: "en-US" });
}

export type Mood =
  | "chill"
  | "funny"
  | "emotional"
  | "intense"
  | "mind-blowing"
  | "dark"
  | "wholesome"
  | "romantic"
  | "thought-provoking";

export type TimePreference = "short" | "medium" | "long";
export type EnergyLevel = "light" | "medium" | "heavy";
export type PopularityPreference = "popular" | "hidden-gem" | "either";
export type AwardsPreference = "any" | "major-awards";
export type DecadePreference =
  | "1910s"
  | "1920s"
  | "1930s"
  | "1940s"
  | "1950s"
  | "1960s"
  | "1970s"
  | "1980s"
  | "1990s"
  | "2000s"
  | "2010s"
  | "2020s";

export interface Genre {
  id: number;
  name: string;
}

export interface RegionOption {
  id: string;
  label: string;
  languages: string[];
}

export interface UserPreferences {
  mood: Mood;
  time: TimePreference;
  energy: EnergyLevel;
  genre: number | null;
  animeOnly: boolean;
  decade: DecadePreference | null;
  popularity: PopularityPreference;
  region: string | null;
  awards: AwardsPreference;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  runtime: number | null;
}

export interface ScoredMovie extends Movie {
  score: number;
  matchPercentage: number;
  matchReason: string;
}

export interface AppState {
  phase: "form" | "loading" | "results" | "error";
  preferences: UserPreferences | null;
  results: ScoredMovie[];
  error: string | null;
}

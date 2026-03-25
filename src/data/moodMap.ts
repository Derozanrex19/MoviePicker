import type { Mood } from "../types";

/**
 * Maps each mood to TMDB genre IDs it should favor,
 * plus a tonal weight that modulates scoring.
 *
 * Genre IDs reference:
 *  28  Action       12  Adventure    16  Animation
 *  35  Comedy       80  Crime        99  Documentary
 *  18  Drama        10751 Family     14  Fantasy
 *  36  History      27  Horror       10402 Music
 *  9648 Mystery     10749 Romance   878 Sci-Fi
 *  10770 TV Movie   53  Thriller     10752 War
 *  37  Western
 */
export interface MoodProfile {
  genres: number[];
  minVoteAverage: number;
  maxRuntime: number | null;
  preferHighPopularity: boolean;
  intensityRange: [number, number]; // 0-10 scale mapped from vote_average spread
  description: string;
}

export const MOOD_MAP: Record<Mood, MoodProfile> = {
  chill: {
    genres: [35, 16, 10751, 10749],
    minVoteAverage: 6.0,
    maxRuntime: null,
    preferHighPopularity: false,
    intensityRange: [0, 4],
    description: "relaxed and easy-going",
  },
  funny: {
    genres: [35, 16, 10751],
    minVoteAverage: 6.0,
    maxRuntime: null,
    preferHighPopularity: true,
    intensityRange: [0, 5],
    description: "light-hearted and comedic",
  },
  emotional: {
    genres: [18, 10749, 10751],
    minVoteAverage: 7.0,
    maxRuntime: null,
    preferHighPopularity: false,
    intensityRange: [3, 7],
    description: "heartfelt and moving",
  },
  intense: {
    genres: [28, 53, 80, 10752],
    minVoteAverage: 6.5,
    maxRuntime: null,
    preferHighPopularity: true,
    intensityRange: [6, 10],
    description: "gripping and high-stakes",
  },
  "mind-blowing": {
    genres: [878, 9648, 53, 14],
    minVoteAverage: 7.0,
    maxRuntime: null,
    preferHighPopularity: false,
    intensityRange: [5, 10],
    description: "surprising and mind-bending",
  },
  dark: {
    genres: [27, 53, 80, 9648],
    minVoteAverage: 6.0,
    maxRuntime: null,
    preferHighPopularity: false,
    intensityRange: [6, 10],
    description: "dark and atmospheric",
  },
  wholesome: {
    genres: [10751, 16, 35, 12],
    minVoteAverage: 6.5,
    maxRuntime: null,
    preferHighPopularity: true,
    intensityRange: [0, 4],
    description: "warm and feel-good",
  },
  romantic: {
    genres: [10749, 18, 35],
    minVoteAverage: 6.0,
    maxRuntime: null,
    preferHighPopularity: false,
    intensityRange: [2, 6],
    description: "romantic and tender",
  },
  "thought-provoking": {
    genres: [18, 878, 9648, 99, 36],
    minVoteAverage: 7.0,
    maxRuntime: null,
    preferHighPopularity: false,
    intensityRange: [4, 8],
    description: "cerebral and contemplative",
  },
};

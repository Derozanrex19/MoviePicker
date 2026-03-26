import type { Movie, ScoredMovie, UserPreferences, TimePreference, EnergyLevel, PopularityPreference } from "../types";
import { MOOD_MAP } from "../data/moodMap";
import { getGenreName, getGenreNames } from "../data/genres";
import { getRegionById } from "../data/regions";

const TIME_RANGES: Record<TimePreference, { min: number; max: number; label: string }> = {
  short: { min: 0, max: 100, label: "under 90 min" },
  medium: { min: 80, max: 140, label: "around 2 hours" },
  long: { min: 130, max: 999, label: "a long watch" },
};

function scoreRuntime(runtime: number | null, timePref: TimePreference): number {
  if (runtime == null) return 0.5;
  const range = TIME_RANGES[timePref];
  if (runtime >= range.min && runtime <= range.max) return 1.0;
  const distance = runtime < range.min ? range.min - runtime : runtime - range.max;
  return Math.max(0, 1 - distance / 60);
}

function scoreGenreMatch(movieGenres: number[], moodGenres: number[], userGenre: number | null): number {
  const matchCount = movieGenres.filter((g) => moodGenres.includes(g)).length;
  let score = matchCount > 0 ? Math.min(matchCount / 2, 1.0) : 0;

  if (userGenre && movieGenres.includes(userGenre)) {
    score = Math.min(score + 0.4, 1.0);
  }

  return score;
}

function scoreAnimeOnly(movieGenres: number[], animeOnly: boolean): number {
  if (!animeOnly) return 1.0;
  return movieGenres.includes(16) ? 1.0 : 0.0;
}

function scoreEnergy(voteAverage: number, runtime: number | null, energy: EnergyLevel): number {
  const complexity = (voteAverage / 10) * 0.6 + ((runtime ?? 120) / 200) * 0.4;

  switch (energy) {
    case "light":
      return complexity < 0.5 ? 1.0 : Math.max(0, 1 - (complexity - 0.5) * 2);
    case "medium":
      return 1.0 - Math.abs(complexity - 0.55) * 1.5;
    case "heavy":
      return complexity > 0.5 ? 1.0 : Math.max(0, complexity * 2);
  }
}

function scorePopularity(movie: Movie, pref: PopularityPreference): number {
  const pop = movie.popularity;
  switch (pref) {
    case "popular":
      return pop > 50 ? 1.0 : pop / 50;
    case "hidden-gem":
      return pop < 40 ? 1.0 : Math.max(0, 1 - (pop - 40) / 80);
    case "either":
      return 0.7;
  }
}

function scoreQuality(voteAverage: number, voteCount: number): number {
  const ratingScore = voteAverage / 10;
  const confidenceBonus = Math.min(voteCount / 10000, 0.2);
  return Math.min(ratingScore + confidenceBonus, 1.0);
}

/**
 * Core scoring function. Each factor has a weight;
 * the total is normalized to 0-100 match percentage.
 */
export function scoreMovie(movie: Movie, prefs: UserPreferences): ScoredMovie {
  const moodProfile = MOOD_MAP[prefs.mood];

  const weights = {
    genre: 30,
    anime: 10,
    runtime: 25,
    energy: 15,
    popularity: 15,
    quality: 5,
  };

  const scores = {
    genre: scoreGenreMatch(movie.genre_ids, moodProfile.genres, prefs.genre),
    anime: scoreAnimeOnly(movie.genre_ids, prefs.animeOnly),
    runtime: scoreRuntime(movie.runtime, prefs.time),
    energy: scoreEnergy(movie.vote_average, movie.runtime, prefs.energy),
    popularity: scorePopularity(movie, prefs.popularity),
    quality: scoreQuality(movie.vote_average, movie.vote_count),
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightedScore =
    scores.genre * weights.genre +
    scores.anime * weights.anime +
    scores.runtime * weights.runtime +
    scores.energy * weights.energy +
    scores.popularity * weights.popularity +
    scores.quality * weights.quality;

  // Random jitter (±15%) so regenerating with the same filters surfaces different movies
  const jitter = (Math.random() - 0.5) * 0.3;
  const normalizedScore = Math.max(0, Math.min(1, weightedScore / totalWeight + jitter));
  const matchPercentage = Math.round((weightedScore / totalWeight) * 100);

  const matchReason = buildMatchReason(movie, prefs, scores);

  return {
    ...movie,
    score: normalizedScore,
    matchPercentage: Math.min(matchPercentage, 98),
    matchReason,
  };
}

function buildMatchReason(
  movie: Movie,
  prefs: UserPreferences,
  scores: Record<string, number>
): string {
  const moodProfile = MOOD_MAP[prefs.mood];
  const reasons: string[] = [];

  const genreNames = getGenreNames(movie.genre_ids);
  const matchedMoodGenres = movie.genre_ids.filter((g) => moodProfile.genres.includes(g));

  if (matchedMoodGenres.length > 0) {
    reasons.push(`Its ${getGenreNames(matchedMoodGenres).join("/")} tone fits your ${moodProfile.description} mood`);
  }

  if (scores.runtime > 0.8 && movie.runtime) {
    const timeLabel = TIME_RANGES[prefs.time].label;
    reasons.push(`At ${movie.runtime} min, it's perfect for ${timeLabel}`);
  } else if (scores.runtime > 0.5 && movie.runtime) {
    reasons.push(`${movie.runtime} min runtime is a reasonable fit for your time`);
  }

  if (scores.quality > 0.7) {
    reasons.push(`Highly rated at ${movie.vote_average.toFixed(1)}/10`);
  }

  if (prefs.popularity === "hidden-gem" && movie.popularity < 40) {
    reasons.push("A lesser-known gem worth discovering");
  } else if (prefs.popularity === "popular" && movie.popularity > 60) {
    reasons.push("A crowd favorite that delivers");
  }

  if (prefs.genre && movie.genre_ids.includes(prefs.genre)) {
    const name = getGenreName(prefs.genre);
    if (name) reasons.push(`Matches your ${name} preference`);
  }

  if (prefs.animeOnly && movie.genre_ids.includes(16)) {
    reasons.push("Fits your anime-only pick");
  }

  if (prefs.region) {
    const regionData = getRegionById(prefs.region);
    if (regionData) {
      reasons.push(`From ${regionData.label} cinema`);
    }
  }

  if (reasons.length === 0) {
    reasons.push(`A strong ${genreNames[0] ?? "film"} pick for your current vibe`);
  }

  return reasons.slice(0, 3).join(". ") + ".";
}

export function rankMovies(movies: Movie[], prefs: UserPreferences, count = 3): ScoredMovie[] {
  const scored = movies.map((m) => scoreMovie(m, prefs));
  scored.sort((a, b) => b.score - a.score);

  const seen = new Set<number>();
  const unique: ScoredMovie[] = [];
  for (const m of scored) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      unique.push(m);
    }
    if (unique.length >= count) break;
  }

  return unique;
}

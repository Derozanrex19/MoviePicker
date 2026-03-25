import type { Movie, UserPreferences, ScoredMovie, TimePreference } from "../types";
import { isApiAvailable, discoverMovies, getMovieDetails } from "./tmdb";
import type { DiscoverParams } from "./tmdb";
import { MOOD_MAP } from "../data/moodMap";
import { FALLBACK_MOVIES } from "../data/fallbackMovies";
import { getRegionById } from "../data/regions";
import { rankMovies } from "./recommend";

const TIME_RUNTIME_LIMITS: Record<TimePreference, { max: number; min: number }> = {
  short: { max: 100, min: 0 },
  medium: { max: 150, min: 75 },
  long: { max: 999, min: 120 },
};

const SORT_OPTIONS = [
  "popularity.desc",
  "vote_average.desc",
  "revenue.desc",
  "primary_release_date.desc",
  "vote_count.desc",
];

const DECADE_RANGES = [
  { gte: "2020-01-01", lte: "2026-12-31" },
  { gte: "2010-01-01", lte: "2019-12-31" },
  { gte: "2000-01-01", lte: "2009-12-31" },
  { gte: "1990-01-01", lte: "1999-12-31" },
  { gte: "1970-01-01", lte: "1989-12-31" },
  { gte: "1920-01-01", lte: "1969-12-31" },
];

const shownMovieIds = new Set<number>();

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPage(max: number): number {
  return Math.floor(Math.random() * Math.min(max, 500)) + 1;
}

/**
 * Build diverse query variations to reach deep into TMDB's catalog.
 * Each query varies sort order, date range, genre combo, language, and page
 * so successive calls pull from entirely different slices.
 */
function buildQueries(prefs: UserPreferences): DiscoverParams[] {
  const moodProfile = MOOD_MAP[prefs.mood];
  const timeRange = TIME_RUNTIME_LIMITS[prefs.time];

  const moodGenres = [...moodProfile.genres];
  const userGenre = prefs.genre;

  // Resolve region to TMDB language codes
  const regionData = prefs.region ? getRegionById(prefs.region) : null;
  const languages = regionData?.languages ?? [];

  // When a region is selected, lower vote thresholds so non-English cinema surfaces
  const isNonEnglish = languages.length > 0 && !languages.includes("en");
  const prestigeMode = prefs.awards === "major-awards";

  const baseVoteCount = prestigeMode
    ? (isNonEnglish ? 120 : 1500)
    : isNonEnglish ? 5
      : prefs.popularity === "hidden-gem" ? 20
        : prefs.popularity === "popular" ? 300
          : 50;

  const baseMinRating = prestigeMode
    ? (isNonEnglish ? 6.6 : 7.2)
    : isNonEnglish
      ? Math.max(moodProfile.minVoteAverage - 1.5, 4.0)
      : moodProfile.minVoteAverage;

  const queries: DiscoverParams[] = [];

  // Helper: build one query per language (or one with no language filter)
  function addQuery(base: Omit<DiscoverParams, "withOriginalLanguage">) {
    if (languages.length === 0) {
      queries.push(base);
    } else {
      for (const lang of languages) {
        queries.push({ ...base, withOriginalLanguage: lang });
      }
    }
  }

  // Query 1: mood genres, random sort, random decade
  const prestigeSorts = ["vote_average.desc", "vote_count.desc", "revenue.desc"] as const;
  const sort1 = prestigeMode ? pickRandom([...prestigeSorts]) : pickRandom(SORT_OPTIONS);
  const decade1 = pickRandom(DECADE_RANGES);
  addQuery({
    genreIds: moodGenres.slice(0, 2),
    minVoteAverage: baseMinRating,
    minVoteCount: baseVoteCount,
    maxRuntime: timeRange.max,
    minRuntime: timeRange.min,
    sortBy: sort1,
    releaseDateGte: decade1.gte,
    releaseDateLte: decade1.lte,
    page: randomPage(50),
  });

  // Query 2: different genre subset, different sort, different decade
  const sort2 = prestigeMode
    ? pickRandom([...prestigeSorts].filter((s) => s !== sort1))
    : pickRandom(SORT_OPTIONS.filter((s) => s !== sort1));
  const decade2 = pickRandom(DECADE_RANGES.filter((d) => d !== decade1));
  addQuery({
    genreIds: userGenre ? [userGenre] : [pickRandom(moodGenres)],
    minVoteAverage: Math.max(baseMinRating - 1, 4.0),
    minVoteCount: baseVoteCount,
    maxRuntime: timeRange.max,
    minRuntime: timeRange.min,
    sortBy: sort2,
    releaseDateGte: decade2.gte,
    releaseDateLte: decade2.lte,
    page: randomPage(80),
  });

  // Query 3: broad — all mood genres OR'd, no date filter, deep random page
  addQuery({
    genreIds: moodGenres,
    minVoteAverage: baseMinRating,
    minVoteCount: Math.max(baseVoteCount - 5, 3),
    maxRuntime: timeRange.max,
    minRuntime: timeRange.min,
    sortBy: prestigeMode ? "vote_average.desc" : pickRandom(SORT_OPTIONS),
    page: randomPage(200),
  });

  // Query 4: low threshold, deep pages for obscure finds
  addQuery({
    genreIds: userGenre ? [userGenre] : [pickRandom(moodGenres)],
    minVoteAverage: isNonEnglish ? 4.0 : 5.5,
    minVoteCount: isNonEnglish ? 3 : 10,
    maxRuntime: timeRange.max,
    minRuntime: timeRange.min,
    sortBy: prestigeMode ? "vote_count.desc" : pickRandom(SORT_OPTIONS),
    page: randomPage(300),
  });

  // Query 5: popular recent movies
  addQuery({
    genreIds: moodGenres.slice(0, 3),
    minVoteAverage: isNonEnglish ? 4.0 : 5.0,
    minVoteCount: baseVoteCount,
    sortBy: prestigeMode ? "vote_average.desc" : "popularity.desc",
    maxRuntime: timeRange.max,
    minRuntime: timeRange.min,
    releaseDateGte: prestigeMode ? "1950-01-01" : "2020-01-01",
    page: randomPage(30),
  });

  return queries;
}

async function fetchFromAPI(prefs: UserPreferences): Promise<Movie[]> {
  const queries = buildQueries(prefs);

  // Fire all queries in parallel
  const results = await Promise.all(
    queries.map(async (q) => {
      try {
        // First try the random page; if it overshoots total_pages, retry with a valid page
        const { movies, totalPages } = await discoverMovies(q);
        if (movies.length > 0) return movies;

        // The random page was beyond available pages — pick a valid one
        if (totalPages > 0) {
          const validPage = randomPage(totalPages);
          const retry = await discoverMovies({ ...q, page: validPage });
          return retry.movies;
        }
        return [];
      } catch {
        return [] as Movie[];
      }
    })
  );

  const allMovies = results.flat();

  // Deduplicate
  const seen = new Set<number>();
  const unique = allMovies.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  // Filter out previously shown movies
  const fresh = unique.filter((m) => !shownMovieIds.has(m.id));
  const pool = fresh.length >= 10 ? fresh : unique;

  // Shuffle the pool so scoring jitter works on different subsets
  return pool.sort(() => Math.random() - 0.5);
}

/**
 * Fetch runtime only for the final top picks (3 movies instead of 20+).
 * This is much faster and wastes fewer API calls.
 */
async function enrichTopPicks(picks: ScoredMovie[]): Promise<ScoredMovie[]> {
  return Promise.all(
    picks.map(async (movie) => {
      if (movie.runtime && movie.runtime > 0) return movie;
      try {
        const details = await getMovieDetails(movie.id);
        return { ...movie, runtime: details.runtime };
      } catch {
        return movie;
      }
    })
  );
}

function getFromFallback(): Movie[] {
  const shuffled = [...FALLBACK_MOVIES].sort(() => Math.random() - 0.5);
  const fresh = shuffled.filter((m) => !shownMovieIds.has(m.id));
  return fresh.length >= 3 ? fresh : shuffled;
}

export function clearHistory(): void {
  shownMovieIds.clear();
}

export async function getRecommendations(prefs: UserPreferences): Promise<ScoredMovie[]> {
  let movies: Movie[];

  if (isApiAvailable()) {
    try {
      movies = await fetchFromAPI(prefs);
      if (movies.length < 3) {
        movies = [...movies, ...getFromFallback()];
      }
    } catch {
      movies = getFromFallback();
    }
  } else {
    movies = getFromFallback();
  }

  let picks = rankMovies(movies, prefs);

  // Enrich only the final 3 with runtime data
  picks = await enrichTopPicks(picks);

  // Remember what we showed
  for (const m of picks) {
    shownMovieIds.add(m.id);
  }

  return picks;
}

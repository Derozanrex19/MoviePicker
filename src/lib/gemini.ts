import type { Movie, ScoredMovie, UserPreferences } from "../types";
import { getGenreName, getGenreNames } from "../data/genres";
import { getRegionById } from "../data/regions";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const CACHE_PREFIX = "moviepicker:gemini-rerank:";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

type GeminiPick = {
  id: number;
  reason: string;
};

type GeminiRerankResponse = {
  picks: GeminiPick[];
};

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type CachedGeminiPicks = {
  createdAt: number;
  picks: GeminiPick[];
};

function getTimeLabel(time: UserPreferences["time"]): string {
  switch (time) {
    case "short":
      return "a short movie night";
    case "medium":
      return "a standard movie night";
    case "long":
      return "a long watch";
  }
}

function getEnergyLabel(energy: UserPreferences["energy"]): string {
  switch (energy) {
    case "light":
      return "light and easy";
    case "medium":
      return "engaging but not exhausting";
    case "heavy":
      return "deep-focus and absorbing";
  }
}

function getPopularityLabel(popularity: UserPreferences["popularity"]): string {
  switch (popularity) {
    case "popular":
      return "popular crowd-pleasers";
    case "hidden-gem":
      return "hidden gems";
    case "either":
      return "either mainstream or obscure";
  }
}

function buildPrompt(prefs: UserPreferences, candidates: Array<Movie | ScoredMovie>): string {
  const genreName = prefs.genre ? getGenreName(prefs.genre) : null;
  const regionLabel = prefs.region ? getRegionById(prefs.region)?.label : null;
  const candidatePayload = candidates.map((movie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    genres: getGenreNames(movie.genre_ids),
    release_date: movie.release_date,
    runtime: movie.runtime,
    vote_average: movie.vote_average,
    popularity: movie.popularity,
  }));

  return [
    "You are a strict movie recommender for a movie-picker app.",
    "Choose the 3 best candidates for the user's preferences.",
    "Be strict about plot relevance, not just loose thematic overlap.",
    "If a requested genre is present, prefer movies where that genre is central to the story.",
    "If the request implies romance or date-night energy, reject movies where romance is only secondary, incidental, or faintly implied.",
    "Avoid picks that only fit by mood, visual style, or a minor subplot.",
    "Return exactly 3 picks chosen only from the provided candidate IDs.",
    "",
    "User preferences:",
    `- Mood: ${prefs.mood}`,
    `- Time: ${getTimeLabel(prefs.time)}`,
    `- Energy: ${getEnergyLabel(prefs.energy)}`,
    `- Popularity: ${getPopularityLabel(prefs.popularity)}`,
    `- Awards preference: ${prefs.awards}`,
    `- Required genre focus: ${genreName ?? "none"}`,
    `- Anime only: ${prefs.animeOnly ? "yes" : "no"}`,
    `- Preferred decade: ${prefs.decade ?? "any"}`,
    `- Regional preference: ${regionLabel ?? "none"}`,
    "",
    "Candidates:",
    JSON.stringify(candidatePayload, null, 2),
  ].join("\n");
}

export function isGeminiAvailable(): boolean {
  return Boolean(GEMINI_API_KEY);
}

function getCacheKey(prefs: UserPreferences, candidates: ScoredMovie[]): string {
  return `${CACHE_PREFIX}${JSON.stringify({
    prefs,
    candidateIds: candidates.map((candidate) => candidate.id),
  })}`;
}

function readCachedPicks(cacheKey: string): GeminiPick[] | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedGeminiPicks;
    if (!parsed.createdAt || !Array.isArray(parsed.picks)) return null;
    if (Date.now() - parsed.createdAt > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return parsed.picks;
  } catch {
    return null;
  }
}

function writeCachedPicks(cacheKey: string, picks: GeminiPick[]): void {
  if (typeof localStorage === "undefined") return;

  try {
    const payload: CachedGeminiPicks = {
      createdAt: Date.now(),
      picks,
    };
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch {
    // Ignore cache write issues such as storage quota limits.
  }
}

export async function rerankMoviesWithGemini(
  prefs: UserPreferences,
  candidates: ScoredMovie[]
): Promise<GeminiPick[] | null> {
  if (!GEMINI_API_KEY || candidates.length < 3) return null;

  const cacheKey = getCacheKey(prefs, candidates);
  const cached = readCachedPicks(cacheKey);
  if (cached) return cached;

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text:
              "You rank movie candidates for relevance and taste fit. Obey the schema exactly and do not invent IDs.",
          },
        ],
      },
      contents: [
        {
          parts: [{ text: buildPrompt(prefs, candidates) }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            picks: {
              type: "ARRAY",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "NUMBER" },
                  reason: { type: "STRING" },
                },
                required: ["id", "reason"],
              },
            },
          },
          required: ["picks"],
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as GeminiApiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) return null;

  const parsed = JSON.parse(text) as GeminiRerankResponse;
  if (!Array.isArray(parsed.picks)) return null;

  const validIds = new Set(candidates.map((candidate) => candidate.id));
  const unique: GeminiPick[] = [];

  for (const pick of parsed.picks) {
    if (!validIds.has(pick.id)) continue;
    if (unique.some((item) => item.id === pick.id)) continue;

    unique.push({
      id: pick.id,
      reason: pick.reason.trim(),
    });

    if (unique.length === 3) break;
  }

  if (unique.length === 3) {
    writeCachedPicks(cacheKey, unique);
    return unique;
  }

  return null;
}

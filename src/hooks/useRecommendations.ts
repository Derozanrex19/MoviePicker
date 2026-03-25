import { useState, useCallback } from "react";
import type { UserPreferences, ScoredMovie } from "../types";
import { getRecommendations, clearHistory } from "../lib/movieService";

interface UseRecommendationsReturn {
  results: ScoredMovie[];
  loading: boolean;
  error: string | null;
  lastPreferences: UserPreferences | null;
  generate: (prefs: UserPreferences) => Promise<void>;
  regenerate: () => Promise<void>;
  reset: () => void;
}

export function useRecommendations(): UseRecommendationsReturn {
  const [results, setResults] = useState<ScoredMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPreferences, setLastPreferences] = useState<UserPreferences | null>(null);

  const generate = useCallback(async (prefs: UserPreferences) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setLastPreferences(prefs);

    try {
      const recs = await getRecommendations(prefs);
      if (recs.length === 0) {
        setError("No movies matched your criteria. Try adjusting your filters.");
      } else {
        setResults(recs);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerate = useCallback(async () => {
    if (!lastPreferences) return;
    await generate(lastPreferences);
  }, [lastPreferences, generate]);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setLoading(false);
    clearHistory();
  }, []);

  return { results, loading, error, lastPreferences, generate, regenerate, reset };
}

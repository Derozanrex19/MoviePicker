import { useRef, useCallback, useState } from "react";
import type { UserPreferences, ScoredMovie } from "./types";
import { useRecommendations } from "./hooks/useRecommendations";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RecommendationForm from "./components/RecommendationForm";
import Results from "./components/Results";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import Footer from "./components/Footer";
import MovieDetailsModal from "./components/MovieDetailsModal";

export default function App() {
  const { results, loading, error, generate, regenerate, reset } = useRecommendations();
  const formRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [selectedMovie, setSelectedMovie] = useState<ScoredMovie | null>(null);

  const showResults = results.length > 0 && !loading;
  const showError = error !== null && !loading;
  const showForm = !showResults && !loading && !showError;

  const handleSubmit = useCallback(
    async (prefs: UserPreferences) => {
      await generate(prefs);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    [generate]
  );

  const handleTryAgain = useCallback(async () => {
    setSelectedMovie(null);
    await regenerate();
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [regenerate]);

  const handleAdjust = useCallback(() => {
    reset();
    setSelectedMovie(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [reset]);

  const handleOpenDetails = useCallback((movie: ScoredMovie) => {
    setSelectedMovie(movie);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedMovie(null);
  }, []);

  return (
    <div className="film-grain min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Hero />

        <div ref={formRef}>
          {showForm && (
            <RecommendationForm onSubmit={handleSubmit} loading={loading} />
          )}
        </div>

        <div ref={resultsRef}>
          {loading && <LoadingState />}

          {showError && (
            <ErrorState message={error!} onRetry={handleTryAgain} />
          )}

          {showResults && (
            <Results
              results={results}
              onTryAgain={handleTryAgain}
              onAdjust={handleAdjust}
              onOpenDetails={handleOpenDetails}
            />
          )}
        </div>
      </main>

      <Footer />

      <MovieDetailsModal
        movie={selectedMovie}
        open={selectedMovie !== null}
        onClose={handleCloseDetails}
      />
    </div>
  );
}

import { useRef, useCallback } from "react";
import type { UserPreferences } from "./types";
import { useRecommendations } from "./hooks/useRecommendations";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RecommendationForm from "./components/RecommendationForm";
import Results from "./components/Results";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function App() {
  const { results, loading, error, generate, regenerate, reset } = useRecommendations();
  const formRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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
    await regenerate();
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [regenerate]);

  const handleAdjust = useCallback(() => {
    reset();
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [reset]);

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
            />
          )}
        </div>

        {showForm && (
          <>
            <HowItWorks />
            <Features />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

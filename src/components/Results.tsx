import { motion } from "framer-motion";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { ScoredMovie } from "../types";
import MovieCard from "./MovieCard";

interface Props {
  results: ScoredMovie[];
  onTryAgain: () => void;
  onAdjust: () => void;
  onOpenDetails: (movie: ScoredMovie) => void;
}

export default function Results({ results, onTryAgain, onAdjust, onOpenDetails }: Props) {
  return (
    <section className="relative mx-auto max-w-4xl px-5 py-12">
      {/* Glow backdrop */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-accent-gold/[0.03] blur-[100px]" />

      <motion.div
        className="relative mb-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
          Your top picks
        </h2>
        <p className="mt-2 text-text-secondary">
          Three movies tailored to your mood. No endless browsing.
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((movie, i) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            index={i}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>

      {/* Action buttons */}
      <motion.div
        className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          type="button"
          onClick={onTryAgain}
          className="flex items-center gap-2 rounded-xl bg-accent-gold px-6 py-3 text-sm font-semibold text-bg transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <RotateCcw size={16} />
          Generate Again
        </button>
        <button
          type="button"
          onClick={onAdjust}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-text-secondary transition-all hover:border-border-light hover:text-text-primary cursor-pointer"
        >
          <SlidersHorizontal size={16} />
          Adjust Filters
        </button>
      </motion.div>
    </section>
  );
}

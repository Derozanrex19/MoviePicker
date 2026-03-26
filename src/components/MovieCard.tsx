import { useState } from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import type { ScoredMovie } from "../types";
import { getPosterUrl } from "../lib/tmdb";

interface Props {
  movie: ScoredMovie;
  index: number;
  onOpenDetails: (movie: ScoredMovie) => void;
}

function PosterFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface text-text-secondary/30">
      <Film size={48} />
      <span className="text-xs text-text-secondary/40">No poster</span>
    </div>
  );
}

export default function MovieCard({ movie, index, onOpenDetails }: Props) {
  const posterUrl = movie.poster_path ? getPosterUrl(movie.poster_path, "large") : null;
  const [posterError, setPosterError] = useState(false);

  return (
    <motion.article
      className="group cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      onClick={() => onOpenDetails(movie)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails(movie);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_40px_rgba(0,0,0,0.32)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-border-light group-hover:shadow-[0_18px_50px_rgba(0,0,0,0.42)]">
        <div className="aspect-[2/3] w-full overflow-hidden bg-card">
          {posterUrl && !posterError ? (
            <img
              src={posterUrl}
              alt={`${movie.title} poster`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setPosterError(true)}
            />
          ) : (
            <PosterFallback />
          )}
        </div>
      </div>
    </motion.article>
  );
}

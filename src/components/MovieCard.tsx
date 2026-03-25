import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Clock, Calendar, ExternalLink, Film } from "lucide-react";
import type { ScoredMovie } from "../types";
import { getPosterUrl } from "../lib/tmdb";
import { getGenreNames } from "../data/genres";

interface Props {
  movie: ScoredMovie;
  index: number;
}

function PosterFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface text-text-secondary/30">
      <Film size={48} />
      <span className="text-xs text-text-secondary/40">No poster</span>
    </div>
  );
}

export default function MovieCard({ movie, index }: Props) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "—";
  const genres = getGenreNames(movie.genre_ids);
  const posterUrl = movie.poster_path ? getPosterUrl(movie.poster_path, "large") : null;
  const [posterError, setPosterError] = useState(false);

  const matchColor =
    movie.matchPercentage >= 85
      ? "text-green-400"
      : movie.matchPercentage >= 70
        ? "text-accent-gold"
        : "text-text-secondary";

  return (
    <motion.article
      className="group overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur-sm transition-all duration-300 hover:border-border-light hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Poster */}
        <div className="relative w-full shrink-0 sm:w-48 md:w-56">
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
          {/* Match badge */}
          <div className="absolute left-3 top-3 rounded-lg bg-bg/85 px-2.5 py-1 backdrop-blur-md">
            <span className={`text-sm font-bold ${matchColor}`}>
              {movie.matchPercentage}% match
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <h3 className="text-xl font-bold text-text-primary sm:text-2xl">
              {movie.title}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {year}
              </span>
              {movie.runtime && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {movie.runtime} min
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star size={14} className="text-accent-gold" />
                {movie.vote_average.toFixed(1)}
              </span>
            </div>

            {/* Genre tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {genres.slice(0, 4).map((g) => (
                <span
                  key={g}
                  className="rounded-md border border-border bg-card px-2 py-0.5 text-xs text-text-secondary"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Overview */}
            <p className="mt-4 text-sm leading-relaxed text-text-secondary line-clamp-3">
              {movie.overview}
            </p>

            {/* Why this fits */}
            <div className="mt-4 rounded-lg border border-accent-gold/15 bg-glow-gold p-3">
              <p className="text-sm font-medium text-accent-gold/90">
                Why this fits:
              </p>
              <p className="mt-0.5 text-sm text-text-secondary">
                {movie.matchReason}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4">
            <a
              href={`https://www.themoviedb.org/movie/${movie.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-gold transition-colors hover:text-amber-400"
            >
              View on TMDB
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

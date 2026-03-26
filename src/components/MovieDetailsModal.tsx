import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ExternalLink,
  Play,
  Star,
  Tv,
  X,
} from "lucide-react";
import type { ScoredMovie } from "../types";
import {
  getMovieDetailsWithVideos,
  getMovieWatchProviders,
  getPosterUrl,
  POSTER_BASE,
  POSTER_SIZES,
} from "../lib/tmdb";
import { getGenreNames } from "../data/genres";

interface Props {
  movie: ScoredMovie | null;
  open: boolean;
  onClose: () => void;
}

type MovieModalData = {
  runtime: number | null;
  overview: string;
  genres: string[];
  voteAverage: number;
  releaseDate: string;
  trailerKey: string | null;
  providers: {
    regionCode: string;
    link: string | null;
    flatrate: Provider[];
    rent: Provider[];
    buy: Provider[];
  } | null;
};

type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
};

type ProviderTab = "flatrate" | "rent" | "buy";

function detectRegionCode(): string {
  if (typeof navigator === "undefined") return "US";
  const locale = navigator.language || "en-US";
  const parts = locale.split("-");
  return parts[1]?.toUpperCase() ?? "US";
}

function getProviderTabLabel(tab: ProviderTab): string {
  switch (tab) {
    case "flatrate":
      return "Stream";
    case "rent":
      return "Rent";
    case "buy":
      return "Buy";
  }
}

function ProviderGrid({
  providers,
  link,
}: {
  providers: Provider[];
  link: string | null;
}) {
  if (providers.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
      {providers.map((provider) => {
        const logo = provider.logo_path
          ? `${POSTER_BASE}/${POSTER_SIZES.small}${provider.logo_path}`
          : null;

        const content = (
          <div
            className="flex aspect-square items-center justify-center rounded-2xl bg-card transition-all hover:scale-[1.03] hover:bg-card-hover"
            title={provider.provider_name}
            aria-label={provider.provider_name}
          >
            {logo ? (
              <img
                src={logo}
                alt={provider.provider_name}
                className="h-11 w-11 rounded-xl object-cover shadow-[0_6px_16px_rgba(0,0,0,0.28)]"
                loading="lazy"
              />
            ) : (
              <span className="px-2 text-center text-[11px] leading-tight text-text-secondary">
                {provider.provider_name}
              </span>
            )}
          </div>
        );

        return link ? (
          <a
            key={provider.provider_id}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            title={`Verify ${provider.provider_name} availability`}
            aria-label={`Verify ${provider.provider_name} availability`}
          >
            {content}
          </a>
        ) : (
          <div key={provider.provider_id} className="block">
            {content}
          </div>
        );
      })}
    </div>
  );
}

export default function MovieDetailsModal({ movie, open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MovieModalData | null>(null);
  const [activeProviderTab, setActiveProviderTab] = useState<ProviderTab>("flatrate");

  useEffect(() => {
    if (!open || !movie) return;

    let cancelled = false;
    const currentMovie = movie;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const regionCode = detectRegionCode();
        const [details, providers] = await Promise.all([
          getMovieDetailsWithVideos(currentMovie.id),
          getMovieWatchProviders(currentMovie.id, regionCode).catch(() => null),
        ]);

        if (cancelled) return;

        const trailer = details.videos?.results.find(
          (video) =>
            video.site === "YouTube" &&
            (video.type === "Trailer" || video.type === "Teaser")
        );

        setData({
          runtime: details.runtime ?? currentMovie.runtime,
          overview: details.overview || currentMovie.overview,
          genres:
            details.genres?.map((genre) => genre.name) ??
            getGenreNames(currentMovie.genre_ids),
          voteAverage: details.vote_average ?? currentMovie.vote_average,
          releaseDate: details.release_date || currentMovie.release_date,
          trailerKey: trailer?.key ?? null,
          providers: providers
            ? {
                regionCode,
                link: providers.link,
                flatrate: providers.flatrate,
                rent: providers.rent,
                buy: providers.buy,
              }
            : null,
        });
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Could not load movie details right now."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [movie, open]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setData(null);
      setLoading(false);
      setActiveProviderTab("flatrate");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const year = useMemo(() => {
    if (!movie) return "—";
    const date = data?.releaseDate || movie.release_date;
    return date ? new Date(date).getFullYear() : "—";
  }, [data?.releaseDate, movie]);

  const posterUrl = movie?.poster_path ? getPosterUrl(movie.poster_path, "large") : "";
  const genres = data?.genres.length ? data.genres : movie ? getGenreNames(movie.genre_ids) : [];
  const providerTabs = useMemo(() => {
    if (!data?.providers) return [] as ProviderTab[];

    const tabs: ProviderTab[] = [];
    if (data.providers.flatrate.length > 0) tabs.push("flatrate");
    if (data.providers.rent.length > 0) tabs.push("rent");
    if (data.providers.buy.length > 0) tabs.push("buy");
    return tabs;
  }, [data?.providers]);

  useEffect(() => {
    if (providerTabs.length === 0) return;
    if (!providerTabs.includes(activeProviderTab)) {
      setActiveProviderTab(providerTabs[0]);
    }
  }, [activeProviderTab, providerTabs]);

  const activeProviders = useMemo(() => {
    if (!data?.providers) return [] as Provider[];
    return data.providers[activeProviderTab] ?? [];
  }, [activeProviderTab, data?.providers]);

  return (
    <AnimatePresence>
      {open && movie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative z-10 flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">
                  Movie details
                </p>
                <h3 className="mt-1 text-xl font-bold text-text-primary">{movie.title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-text-secondary transition-colors hover:bg-card hover:text-text-primary"
                aria-label="Close movie details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                <div>
                  <div className="overflow-hidden rounded-2xl border border-border bg-card">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={`${movie.title} poster`}
                        className="aspect-[2/3] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[2/3] items-center justify-center text-text-secondary">
                        No poster
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl border border-accent-gold/15 bg-glow-gold p-4">
                    <p className="text-sm font-semibold text-accent-gold">Why this fits</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {movie.matchReason}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                    <span className="rounded-full bg-accent-gold/10 px-3 py-1 font-semibold text-accent-gold">
                      {movie.matchPercentage}% match
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {year}
                    </span>
                    {(data?.runtime || movie.runtime) && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {data?.runtime || movie.runtime} min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star size={14} className="text-accent-gold" />
                      {(data?.voteAverage || movie.vote_average).toFixed(1)}
                    </span>
                  </div>

                  {genres.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full border border-border bg-card px-3 py-1 text-xs text-text-secondary"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Overview
                    </h4>
                    <p className="mt-3 text-sm leading-7 text-text-primary/90">
                      {data?.overview || movie.overview}
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center gap-2">
                      <Play size={16} className="text-accent-gold" />
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        Trailer
                      </h4>
                    </div>
                    <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
                      {loading ? (
                        <div className="shimmer aspect-video w-full" />
                      ) : data?.trailerKey ? (
                        <iframe
                          className="aspect-video w-full"
                          src={`https://www.youtube.com/embed/${data.trailerKey}`}
                          title={`${movie.title} trailer`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-text-secondary">
                          No trailer was available for this movie.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center gap-2">
                      <Tv size={16} className="text-accent-gold" />
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">
                        Streaming
                      </h4>
                    </div>

                    {loading ? (
                      <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="shimmer aspect-square rounded-2xl" />
                        ))}
                      </div>
                    ) : data?.providers && providerTabs.length > 0 ? (
                      <div className="mt-3 rounded-2xl bg-card/35 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-text-secondary">
                            <span className="font-medium text-text-primary">Streaming</span>
                            {" • "}
                            {data.providers.regionCode}
                          </p>
                          <div className="flex items-center gap-1 rounded-full bg-bg/60 p-1">
                            {providerTabs.map((tab) => {
                              const isActive = activeProviderTab === tab;
                              return (
                                <button
                                  key={tab}
                                  type="button"
                                  onClick={() => setActiveProviderTab(tab)}
                                  className={[
                                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                                    isActive
                                      ? "bg-accent-gold text-bg"
                                      : "text-text-secondary hover:text-text-primary",
                                  ].join(" ")}
                                >
                                  {getProviderTabLabel(tab)}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-4">
                          <ProviderGrid
                            providers={activeProviders}
                            link={data.providers.link}
                          />
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-text-secondary">
                          <p>Click a logo to verify availability via TMDB/JustWatch.</p>
                          {data.providers.link && (
                            <a
                              href={data.providers.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-medium text-accent-gold transition-colors hover:text-amber-400"
                            >
                              Open full listing
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </div>
                    ) : data?.providers ? (
                      <div className="mt-3 rounded-2xl bg-card/35 p-4 text-sm text-text-secondary">
                        No provider entries were available for this region.
                      </div>
                    ) : (
                      <div className="mt-3 rounded-2xl bg-card/35 p-4 text-sm text-text-secondary">
                        Streaming provider data was not available for this movie in your detected region.
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <a
                      href={`https://www.themoviedb.org/movie/${movie.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-gold transition-colors hover:text-amber-400"
                    >
                      Open on TMDB
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  {error && (
                    <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

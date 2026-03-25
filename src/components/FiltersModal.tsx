import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { AwardsPreference, PopularityPreference } from "../types";
import { TMDB_GENRES } from "../data/genres";
import { REGIONS } from "../data/regions";

export type FiltersState = {
  genre: number | null;
  region: string | null;
  popularity: PopularityPreference;
  awards: AwardsPreference;
};

interface Props {
  open: boolean;
  onClose: () => void;
  value: FiltersState;
  onChange: (next: FiltersState) => void;
}

const selectClass =
  "w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-gold/40 hover:border-border-light";

export default function FiltersModal({ open, onClose, value, onChange }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-bg/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-base font-bold text-text-primary">Filters</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-card hover:text-text-primary"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Genre
                </span>
                <select
                  className={selectClass}
                  value={value.genre ?? ""}
                  onChange={(e) =>
                    onChange({ ...value, genre: e.target.value ? Number(e.target.value) : null })
                  }
                >
                  <option value="">Any</option>
                  {TMDB_GENRES.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Movie origin
                </span>
                <select
                  className={selectClass}
                  value={value.region ?? ""}
                  onChange={(e) =>
                    onChange({ ...value, region: e.target.value || null })
                  }
                >
                  <option value="">Any country</option>
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Popularity
                </span>
                <select
                  className={selectClass}
                  value={value.popularity}
                  onChange={(e) =>
                    onChange({ ...value, popularity: e.target.value as PopularityPreference })
                  }
                >
                  <option value="either">Either</option>
                  <option value="popular">Popular picks</option>
                  <option value="hidden-gem">Hidden gems</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Awards & Prestige
                </span>
                <select
                  className={selectClass}
                  value={value.awards}
                  onChange={(e) =>
                    onChange({ ...value, awards: e.target.value as AwardsPreference })
                  }
                >
                  <option value="any">Any</option>
                  <option value="major-awards">Award-caliber films</option>
                </select>
              </label>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={() =>
                  onChange({ genre: null, region: null, popularity: "either", awards: "any" })
                }
                className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Reset all
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-accent-gold px-5 py-2.5 text-sm font-semibold text-bg transition-all hover:shadow-[0_0_24px_rgba(245,158,11,0.22)]"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

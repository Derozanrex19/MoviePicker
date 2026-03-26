import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile, Laugh, Heart, Flame, Brain, Skull,
  Sun, HeartHandshake, Lightbulb, Clapperboard,
  Shuffle, SlidersHorizontal, ChevronLeft,
  Wine, Sofa, Atom, Clapperboard as Clapper,
} from "lucide-react";
import type { Mood, TimePreference, EnergyLevel, UserPreferences } from "../types";
import FiltersModal from "./FiltersModal";
import type { FiltersState } from "./FiltersModal";

const MOODS: { value: Mood; label: string; icon: React.ReactNode }[] = [
  { value: "chill", label: "Chill", icon: <Smile size={18} /> },
  { value: "funny", label: "Funny", icon: <Laugh size={18} /> },
  { value: "emotional", label: "Emotional", icon: <Heart size={18} /> },
  { value: "intense", label: "Intense", icon: <Flame size={18} /> },
  { value: "mind-blowing", label: "Mind-bending", icon: <Brain size={18} /> },
  { value: "dark", label: "Dark", icon: <Skull size={18} /> },
  { value: "wholesome", label: "Wholesome", icon: <Sun size={18} /> },
  { value: "romantic", label: "Romantic", icon: <HeartHandshake size={18} /> },
  { value: "thought-provoking", label: "Cerebral", icon: <Lightbulb size={18} /> },
];

const TIME_OPTIONS: { value: TimePreference; label: string; sub: string }[] = [
  { value: "short", label: "Quick", sub: "Under 90 min" },
  { value: "medium", label: "Standard", sub: "~2 hours" },
  { value: "long", label: "Epic", sub: "2.5 h+" },
];

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; sub: string }[] = [
  { value: "light", label: "Light", sub: "Easy watch" },
  { value: "medium", label: "Medium", sub: "Some focus" },
  { value: "heavy", label: "Locked in", sub: "Full attention" },
];

type Preset = {
  label: string;
  icon: React.ReactNode;
  mood: Mood;
  time: TimePreference;
  energy: EnergyLevel;
  filters: Partial<FiltersState>;
};

const PRESETS: Preset[] = [
  {
    label: "Date night",
    icon: <Wine size={14} />,
    mood: "romantic",
    time: "medium",
    energy: "light",
    filters: { genre: 10749 },
  },
  {
    label: "Family night",
    icon: <Sofa size={14} />,
    mood: "wholesome",
    time: "short",
    energy: "light",
    filters: { genre: 10751, popularity: "popular" },
  },
  {
    label: "Brainy sci-fi",
    icon: <Atom size={14} />,
    mood: "thought-provoking",
    time: "long",
    energy: "heavy",
    filters: { genre: 878, awards: "major-awards" },
  },
  {
    label: "A24 vibe",
    icon: <Clapper size={14} />,
    mood: "dark",
    time: "medium",
    energy: "heavy",
    filters: { genre: 18, popularity: "hidden-gem", awards: "major-awards" },
  },
];

const DEFAULT_FILTERS: FiltersState = {
  genre: null,
  animeOnly: false,
  decade: null,
  region: null,
  popularity: "either",
  awards: "any",
};

const stepAnim = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.25, ease: "easeInOut" as const },
};

interface Props {
  onSubmit: (prefs: UserPreferences) => void;
  loading: boolean;
}

export default function RecommendationForm({ onSubmit, loading }: Props) {
  const [mood, setMood] = useState<Mood | null>(null);
  const [time, setTime] = useState<TimePreference | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({ ...DEFAULT_FILTERS });
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const canSubmit = mood !== null && time !== null && energy !== null && !loading;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      mood, time, energy,
      genre: filters.genre,
      animeOnly: filters.animeOnly,
      decade: filters.decade,
      popularity: filters.popularity,
      region: filters.region,
      awards: filters.awards,
    });
  }

  function handleSurprise() {
    const rm = MOODS[Math.floor(Math.random() * MOODS.length)].value;
    const rt = TIME_OPTIONS[Math.floor(Math.random() * TIME_OPTIONS.length)].value;
    const re = ENERGY_OPTIONS[Math.floor(Math.random() * ENERGY_OPTIONS.length)].value;
    setMood(rm);
    setTime(rt);
    setEnergy(re);
    setFilters({ ...DEFAULT_FILTERS });
    setStep(3);
    onSubmit({
      mood: rm,
      time: rt,
      energy: re,
      genre: null,
      animeOnly: false,
      decade: null,
      region: null,
      popularity: "either",
      awards: "any",
    });
  }

  function applyPreset(p: Preset) {
    setMood(p.mood);
    setTime(p.time);
    setEnergy(p.energy);
    setFilters({ ...DEFAULT_FILTERS, ...p.filters });
    setStep(3);
  }

  function goBack() {
    if (step > 0) setStep((s) => (s - 1) as 0 | 1 | 2 | 3);
  }

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.genre) c++;
    if (filters.animeOnly) c++;
    if (filters.decade) c++;
    if (filters.region) c++;
    if (filters.popularity !== "either") c++;
    if (filters.awards !== "any") c++;
    return c;
  }, [filters]);

  const moodLabel = MOODS.find((m) => m.value === mood)?.label;
  const timeLabel = TIME_OPTIONS.find((t) => t.value === time)?.sub;
  const energyLabel = ENERGY_OPTIONS.find((e) => e.value === energy)?.label;

  return (
    <motion.section
      id="pick"
      className="relative mx-auto max-w-2xl px-5 py-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="px-6 pt-7 pb-5 text-center sm:px-8">
          <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
            What are you in the mood for?
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            Pick a vibe or use a quick preset.
          </p>
        </div>

        {/* Presets — compact pill row */}
        <div className="flex items-center gap-2 overflow-x-auto px-6 pb-5 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-text-secondary transition-all hover:border-accent-gold/30 hover:bg-accent-gold/5 hover:text-accent-gold"
            >
              {p.icon}
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleSurprise}
            disabled={loading}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-text-secondary transition-all hover:border-accent-gold/30 hover:bg-accent-gold/5 hover:text-accent-gold disabled:opacity-40"
          >
            <Shuffle size={14} />
            Surprise me
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-border sm:mx-8" />

        {/* Progress bar */}
        <div className="flex items-center gap-3 px-6 pt-5 sm:px-8">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-card hover:text-text-primary"
              aria-label="Go back"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="flex flex-1 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? "bg-accent-gold" : "bg-border"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-text-secondary">
            {step < 3 ? `${step + 1} of 3` : "Ready"}
          </span>
        </div>

        {/* Steps */}
        <div className="min-h-[200px] px-6 py-5 sm:px-8">
          <AnimatePresence mode="wait">
            {/* STEP 0: Mood */}
            {step === 0 && (
              <motion.div key="mood" {...stepAnim}>
                <p className="mb-4 text-sm font-medium text-text-secondary">
                  How are you feeling right now?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {MOODS.map((m) => {
                    const sel = mood === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => { setMood(m.value); setStep(1); }}
                        className={[
                          "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all",
                          sel
                            ? "border-accent-gold/50 bg-accent-gold/10 text-accent-gold"
                            : "border-border bg-card text-text-secondary hover:border-border-light hover:bg-card-hover hover:text-text-primary",
                        ].join(" ")}
                      >
                        {m.icon}
                        <span className="text-xs font-medium">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 1: Time */}
            {step === 1 && (
              <motion.div key="time" {...stepAnim}>
                <p className="mb-4 text-sm font-medium text-text-secondary">
                  How much time do you have?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_OPTIONS.map((t) => {
                    const sel = time === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => { setTime(t.value); setStep(2); }}
                        className={[
                          "flex flex-col items-center gap-1 rounded-xl border p-4 text-center transition-all",
                          sel
                            ? "border-accent-gold/50 bg-accent-gold/10 text-accent-gold"
                            : "border-border bg-card text-text-secondary hover:border-border-light hover:bg-card-hover hover:text-text-primary",
                        ].join(" ")}
                      >
                        <span className="text-sm font-semibold">{t.label}</span>
                        <span className="text-xs opacity-70">{t.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Energy */}
            {step === 2 && (
              <motion.div key="energy" {...stepAnim}>
                <p className="mb-4 text-sm font-medium text-text-secondary">
                  What's your energy level?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {ENERGY_OPTIONS.map((e) => {
                    const sel = energy === e.value;
                    return (
                      <button
                        key={e.value}
                        type="button"
                        onClick={() => { setEnergy(e.value); setStep(3); }}
                        className={[
                          "flex flex-col items-center gap-1 rounded-xl border p-4 text-center transition-all",
                          sel
                            ? "border-accent-gold/50 bg-accent-gold/10 text-accent-gold"
                            : "border-border bg-card text-text-secondary hover:border-border-light hover:bg-card-hover hover:text-text-primary",
                        ].join(" ")}
                      >
                        <span className="text-sm font-semibold">{e.label}</span>
                        <span className="text-xs opacity-70">{e.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Summary + Go */}
            {step === 3 && (
              <motion.div key="go" {...stepAnim}>
                {/* Summary strip */}
                <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
                  {[moodLabel, timeLabel, energyLabel].filter(Boolean).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-accent-gold/20 bg-accent-gold/5 px-3 py-1 text-xs font-medium text-accent-gold"
                    >
                      {tag}
                    </span>
                  ))}
                  {activeFilterCount > 0 && (
                    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-text-secondary">
                      +{activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Filters + Actions */}
                <div className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-border-light hover:bg-card-hover hover:text-text-primary"
                  >
                    <SlidersHorizontal size={15} />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-gold/15 px-1.5 text-[11px] font-bold text-accent-gold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={[
                      "flex w-full max-w-xs items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all duration-300",
                      canSubmit
                        ? "bg-accent-gold text-bg shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.35)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        : "bg-card text-text-secondary/50 cursor-not-allowed",
                    ].join(" ")}
                  >
                    <Clapperboard size={18} />
                    {loading ? "Finding movies..." : "Get My Picks"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <FiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onChange={setFilters}
      />
    </motion.section>
  );
}

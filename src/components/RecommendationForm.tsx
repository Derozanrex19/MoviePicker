import { useState } from "react";
import { motion } from "framer-motion";
import {
  Smile, Laugh, Heart, Flame, Brain, Skull,
  Sun, HeartHandshake, Lightbulb, Clapperboard,
  Shuffle, Globe,
} from "lucide-react";
import type { Mood, TimePreference, EnergyLevel, PopularityPreference, UserPreferences } from "../types";
import { TMDB_GENRES } from "../data/genres";
import { REGIONS } from "../data/regions";
import OptionButton from "./OptionButton";

const MOODS: { value: Mood; label: string; icon: React.ReactNode }[] = [
  { value: "chill", label: "Chill", icon: <Smile size={16} /> },
  { value: "funny", label: "Funny", icon: <Laugh size={16} /> },
  { value: "emotional", label: "Emotional", icon: <Heart size={16} /> },
  { value: "intense", label: "Intense", icon: <Flame size={16} /> },
  { value: "mind-blowing", label: "Mind-blowing", icon: <Brain size={16} /> },
  { value: "dark", label: "Dark", icon: <Skull size={16} /> },
  { value: "wholesome", label: "Wholesome", icon: <Sun size={16} /> },
  { value: "romantic", label: "Romantic", icon: <HeartHandshake size={16} /> },
  { value: "thought-provoking", label: "Thought-provoking", icon: <Lightbulb size={16} /> },
];

const TIME_OPTIONS: { value: TimePreference; label: string }[] = [
  { value: "short", label: "Under 90 min" },
  { value: "medium", label: "Around 2 hours" },
  { value: "long", label: "Long watch (2.5h+)" },
];

const ENERGY_OPTIONS: { value: EnergyLevel; label: string }[] = [
  { value: "light", label: "Light watch" },
  { value: "medium", label: "Medium focus" },
  { value: "heavy", label: "Heavy / locked in" },
];

const POPULARITY_OPTIONS: { value: PopularityPreference; label: string }[] = [
  { value: "popular", label: "Popular picks" },
  { value: "hidden-gem", label: "Hidden gems" },
  { value: "either", label: "Either" },
];

interface Props {
  onSubmit: (prefs: UserPreferences) => void;
  loading: boolean;
}

export default function RecommendationForm({ onSubmit, loading }: Props) {
  const [mood, setMood] = useState<Mood | null>(null);
  const [time, setTime] = useState<TimePreference>("medium");
  const [energy, setEnergy] = useState<EnergyLevel>("medium");
  const [genre, setGenre] = useState<number | null>(null);
  const [popularity, setPopularity] = useState<PopularityPreference>("either");
  const [region, setRegion] = useState<string | null>(null);

  const canSubmit = mood !== null && !loading;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({ mood, time, energy, genre, popularity, region });
  }

  function handleSurprise() {
    const randomMood = MOODS[Math.floor(Math.random() * MOODS.length)].value;
    const randomTime = TIME_OPTIONS[Math.floor(Math.random() * TIME_OPTIONS.length)].value;
    const randomEnergy = ENERGY_OPTIONS[Math.floor(Math.random() * ENERGY_OPTIONS.length)].value;
    onSubmit({
      mood: randomMood,
      time: randomTime,
      energy: randomEnergy,
      genre: null,
      popularity: "either",
      region: null,
    });
  }

  return (
    <motion.section
      id="pick"
      className="relative mx-auto max-w-3xl px-5 py-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="rounded-2xl border border-border bg-surface/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
            What are you in the mood for?
          </h2>
          <p className="mt-2 text-text-secondary">
            Pick your vibe and we'll handle the rest.
          </p>
        </div>

        {/* Mood */}
        <fieldset className="mb-8">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Mood <span className="text-accent-red">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <OptionButton
                key={m.value}
                selected={mood === m.value}
                onClick={() => setMood(m.value)}
                icon={m.icon}
              >
                {m.label}
              </OptionButton>
            ))}
          </div>
        </fieldset>

        {/* Time */}
        <fieldset className="mb-8">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Available time
          </legend>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((t) => (
              <OptionButton
                key={t.value}
                selected={time === t.value}
                onClick={() => setTime(t.value)}
              >
                {t.label}
              </OptionButton>
            ))}
          </div>
        </fieldset>

        {/* Energy */}
        <fieldset className="mb-8">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Energy level
          </legend>
          <div className="flex flex-wrap gap-2">
            {ENERGY_OPTIONS.map((e) => (
              <OptionButton
                key={e.value}
                selected={energy === e.value}
                onClick={() => setEnergy(e.value)}
              >
                {e.label}
              </OptionButton>
            ))}
          </div>
        </fieldset>

        {/* Genre (optional) */}
        <fieldset className="mb-8">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Genre <span className="text-text-secondary/60 font-normal normal-case">(optional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            <OptionButton
              selected={genre === null}
              onClick={() => setGenre(null)}
            >
              Any
            </OptionButton>
            {TMDB_GENRES.map((g) => (
              <OptionButton
                key={g.id}
                selected={genre === g.id}
                onClick={() => setGenre(g.id)}
              >
                {g.name}
              </OptionButton>
            ))}
          </div>
        </fieldset>

        {/* Popularity */}
        <fieldset className="mb-8">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Popularity preference
          </legend>
          <div className="flex flex-wrap gap-2">
            {POPULARITY_OPTIONS.map((p) => (
              <OptionButton
                key={p.value}
                selected={popularity === p.value}
                onClick={() => setPopularity(p.value)}
              >
                {p.label}
              </OptionButton>
            ))}
          </div>
        </fieldset>

        {/* Region / Origin */}
        <fieldset className="mb-10">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Globe size={14} />
              Movie origin
            </span>
            {" "}
            <span className="text-text-secondary/60 font-normal normal-case">(optional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            <OptionButton
              selected={region === null}
              onClick={() => setRegion(null)}
            >
              Any country
            </OptionButton>
            {REGIONS.map((r) => (
              <OptionButton
                key={r.id}
                selected={region === r.id}
                onClick={() => setRegion(r.id)}
              >
                {r.label}
              </OptionButton>
            ))}
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              relative flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold
              transition-all duration-300 cursor-pointer
              ${
                canSubmit
                  ? "bg-accent-gold text-bg shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.35)] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-card text-text-secondary/50 cursor-not-allowed"
              }
            `}
          >
            <Clapperboard size={18} />
            {loading ? "Finding movies..." : "Get My Picks"}
          </button>

          <button
            type="button"
            onClick={handleSurprise}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-medium text-text-secondary transition-all hover:border-border-light hover:text-text-primary cursor-pointer disabled:opacity-40"
          >
            <Shuffle size={16} />
            Surprise Me
          </button>
        </div>
      </div>
    </motion.section>
  );
}

import { motion } from "framer-motion";
import { Sparkles, Shield, Smartphone, Zap, Globe, RefreshCw } from "lucide-react";

const FEATURES = [
  {
    icon: <Sparkles size={20} />,
    title: "Mood-aware scoring",
    description: "Each mood maps to genres, tone, and intensity preferences for intelligent results.",
  },
  {
    icon: <Zap size={20} />,
    title: "Instant results",
    description: "No waiting. Get curated picks in seconds, not minutes of scrolling.",
  },
  {
    icon: <Shield size={20} />,
    title: "No account needed",
    description: "No login, no signup, no tracking. Just open and pick.",
  },
  {
    icon: <Smartphone size={20} />,
    title: "Works everywhere",
    description: "Fully responsive. Use it on your phone, tablet, or laptop.",
  },
  {
    icon: <Globe size={20} />,
    title: "Real movie data",
    description: "Powered by The Movie Database (TMDB) with thousands of films.",
  },
  {
    icon: <RefreshCw size={20} />,
    title: "Regenerate anytime",
    description: "Don't like the picks? One click to get a fresh set of recommendations.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
          Built for nights when you want the right movie fast
        </h2>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feat, i) => (
          <motion.div
            key={feat.title}
            className="rounded-xl border border-border bg-card p-5 transition-all hover:border-border-light hover:bg-card-hover"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gold/10 text-accent-gold">
              {feat.icon}
            </div>
            <h3 className="mb-1 text-sm font-bold text-text-primary">
              {feat.title}
            </h3>
            <p className="text-sm text-text-secondary">{feat.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

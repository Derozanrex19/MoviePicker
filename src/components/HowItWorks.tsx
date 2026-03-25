import { motion } from "framer-motion";
import { Sliders, Cpu, Popcorn } from "lucide-react";

const STEPS = [
  {
    icon: <Sliders size={24} />,
    title: "Set your preferences",
    description: "Pick your mood, available time, energy level, and optional genre. Takes 10 seconds.",
  },
  {
    icon: <Cpu size={24} />,
    title: "Smart matching runs",
    description: "Our engine scores hundreds of movies against your preferences using genre fit, runtime, and popularity.",
  },
  {
    icon: <Popcorn size={24} />,
    title: "Get 3 perfect picks",
    description: "Each recommendation tells you exactly why it fits. No endless scrolling, just the right movie.",
  },
];

export default function HowItWorks() {
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
          How it works
        </h2>
        <p className="mt-2 text-text-secondary">
          Three steps. One perfect movie night.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            className="group rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-border-light hover:bg-card-hover"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-gold/10 text-accent-gold transition-colors group-hover:bg-accent-gold/20">
              {step.icon}
            </div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent-gold">
              Step {i + 1}
            </div>
            <h3 className="mb-2 text-lg font-bold text-text-primary">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

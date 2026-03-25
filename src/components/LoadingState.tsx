import { motion } from "framer-motion";
import { Film } from "lucide-react";

export default function LoadingState() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-20">
      <motion.div
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Animated film icon */}
        <motion.div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-gold/15 text-accent-gold"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Film size={28} />
        </motion.div>

        <h3 className="text-xl font-bold text-text-primary">
          Finding your perfect movies...
        </h3>
        <p className="mt-2 text-text-secondary">
          Analyzing mood, matching genres, scoring results.
        </p>

        {/* Skeleton cards */}
        <div className="mt-10 w-full max-w-3xl space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex overflow-hidden rounded-2xl border border-border bg-surface/40"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div className="hidden w-48 shrink-0 sm:block">
                <div className="aspect-[2/3] shimmer" />
              </div>
              <div className="flex-1 p-6 space-y-3">
                <div className="h-6 w-48 rounded shimmer" />
                <div className="h-4 w-32 rounded shimmer" />
                <div className="h-4 w-full rounded shimmer" />
                <div className="h-4 w-3/4 rounded shimmer" />
                <div className="h-16 w-full rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

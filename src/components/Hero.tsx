import { motion } from "framer-motion";
import { Sparkles, Clock, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-12 md:pt-40 md:pb-16">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-accent-gold/[0.04] blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-accent-purple/[0.05] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <Sparkles size={14} className="text-accent-gold" />
            <span className="text-xs font-medium text-text-secondary">
              Smart recommendations powered by your mood
            </span>
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl font-black leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Stop scrolling.
          <br />
          <span className="bg-gradient-to-r from-accent-gold to-amber-400 bg-clip-text text-transparent">
            Start watching.
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg text-text-secondary md:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Tell us your mood, how much time you have, and your energy level.
          We'll find the perfect movie in seconds.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-gold" />
            <span>3 curated picks</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-accent-gold" />
            <span>Under 10 seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-accent-gold" />
            <span>No signup needed</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

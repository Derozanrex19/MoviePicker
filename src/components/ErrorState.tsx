import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <section className="mx-auto max-w-2xl px-5 py-20">
      <motion.div
        className="flex flex-col items-center rounded-2xl border border-accent-red/20 bg-accent-red/5 p-10 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-red/15 text-accent-red">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-xl font-bold text-text-primary">
          Something went wrong
        </h3>
        <p className="mt-2 text-text-secondary">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 flex items-center gap-2 rounded-xl bg-accent-red/15 px-5 py-2.5 text-sm font-medium text-accent-red transition-all hover:bg-accent-red/25 cursor-pointer"
        >
          <RotateCcw size={16} />
          Try Again
        </button>
      </motion.div>
    </section>
  );
}

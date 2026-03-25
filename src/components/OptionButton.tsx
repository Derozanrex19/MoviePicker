import type { ReactNode } from "react";

interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}

export default function OptionButton({ selected, onClick, children, icon }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium
        transition-all duration-200 cursor-pointer
        ${
          selected
            ? "border-accent-gold/50 bg-accent-gold/10 text-accent-gold shadow-[0_0_20px_rgba(245,158,11,0.08)]"
            : "border-border bg-card text-text-secondary hover:border-border-light hover:bg-card-hover hover:text-text-primary"
        }
      `}
    >
      {icon}
      {children}
    </button>
  );
}

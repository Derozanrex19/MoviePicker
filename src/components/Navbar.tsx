import { Film } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gold/15 text-accent-gold transition-colors group-hover:bg-accent-gold/25">
            <Film size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Smart Movie Picker
          </span>
        </a>

        <a
          href="#pick"
          className="rounded-full bg-accent-gold/15 px-4 py-1.5 text-sm font-medium text-accent-gold transition-all hover:bg-accent-gold/25 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
        >
          Get Picks
        </a>
      </div>
    </nav>
  );
}

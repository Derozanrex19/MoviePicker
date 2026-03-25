import { Film, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-text-secondary">
          <Film size={16} className="text-accent-gold" />
          <span className="text-sm font-medium">Smart Movie Picker</span>
        </div>

        <p className="flex items-center gap-1 text-xs text-text-secondary/60">
          Made with <Heart size={12} className="text-accent-red" /> for movie lovers
          <span className="mx-1">·</span>
          Powered by
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-0.5 text-text-secondary transition-colors hover:text-text-primary"
          >
            TMDB
          </a>
        </p>

        <p className="text-xs text-text-secondary/40">
          &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

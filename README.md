# Smart Movie Picker

A cinematic, polished web app that helps you decide what movie to watch based on your **mood**, **available time**, **energy level**, and optional **genre preference**.

No login. No signup. No endless scrolling. Just 3 perfect movie picks.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## API Setup (Optional)

The app uses [TMDB](https://www.themoviedb.org/) for real movie data. To enable it:

1. Sign up at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to Settings → API → Request an API key
3. Create a `.env` file in the project root:

```env
VITE_TMDB_API_KEY=your_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
```

**Without an API key**, the app runs using a curated fallback dataset of 30 well-known movies so the full experience is still demoable.

## How the Recommendation Engine Works

The engine uses a **weighted scoring system** with 5 factors:

| Factor | Weight | How it works |
|---|---|---|
| **Genre fit** | 30% | Each mood maps to preferred TMDB genres. Movies matching those genres score higher. User's optional genre pick adds a bonus. |
| **Runtime fit** | 25% | "Under 90 min" / "Around 2 hours" / "Long watch" maps to runtime ranges. Movies within range get full marks; distance penalizes. |
| **Energy match** | 15% | Light / Medium / Heavy maps to a complexity score derived from rating + runtime. Low-complexity films favor "light watch", high-complexity favors "heavy". |
| **Popularity** | 15% | "Popular picks" favors high-popularity films. "Hidden gems" favors lower-popularity. "Either" is neutral. |
| **Quality** | 15% | Higher TMDB ratings and vote counts produce higher quality scores. |

The top 3 movies by combined weighted score are returned, each with a human-readable explanation of why it fits.

## Tech Stack

- **React** + **TypeScript** — UI framework
- **Vite** — Build tool
- **Tailwind CSS v4** — Styling
- **Framer Motion** — Animations
- **Lucide React** — Icons
- **TMDB API** — Movie data

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── RecommendationForm.tsx
│   ├── OptionButton.tsx
│   ├── MovieCard.tsx
│   ├── Results.tsx
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   ├── HowItWorks.tsx
│   ├── Features.tsx
│   └── Footer.tsx
├── data/
│   ├── fallbackMovies.ts
│   ├── genres.ts
│   └── moodMap.ts
├── hooks/
│   └── useRecommendations.ts
├── lib/
│   ├── tmdb.ts
│   ├── recommend.ts
│   └── movieService.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
├── index.css
└── vite-env.d.ts
```

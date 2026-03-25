import type { RegionOption } from "../types";

/**
 * TMDB uses ISO 639-1 language codes for `with_original_language`.
 * Grouped by continent for a clean UI, with Filipino broken out separately.
 */
export const REGIONS: RegionOption[] = [
  { id: "hollywood",     label: "Hollywood",        languages: ["en"] },
  { id: "filipino",      label: "Filipino / Pinoy", languages: ["tl"] },
  { id: "asian",         label: "Asian",            languages: ["ko", "ja", "zh", "hi", "ta", "th", "id", "ml"] },
  { id: "european",      label: "European",         languages: ["fr", "de", "es", "it", "sv", "da", "no", "ru", "tr", "pt"] },
  { id: "latin-american",label: "Latin American",   languages: ["es", "pt"] },
  { id: "african",       label: "African",          languages: ["yo", "zu", "sw", "am", "fr"] },
  { id: "middle-eastern",label: "Middle Eastern",   languages: ["ar", "fa", "he", "tr"] },
];

export function getRegionById(id: string): RegionOption | undefined {
  return REGIONS.find((r) => r.id === id);
}

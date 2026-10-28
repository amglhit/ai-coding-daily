/** Reader measure. Stored on the document element; default is standard. */
export const COMFORT_KEY = "ai-coding-reader-comfort";

export const COMFORT_TIERS = ["tight", "standard", "loose"];

export const DEFAULT_COMFORT = "standard";

export function normalizeComfort(value) {
  return COMFORT_TIERS.includes(value) ? value : DEFAULT_COMFORT;
}

/** Pure helpers for the "recently viewed" list (task 137). Only slugs are stored in the browser. */

export const RECENTLY_VIEWED_KEY = "robonautsshop:recently-viewed";
export const RECENTLY_VIEWED_MAX = 8;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isProductSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 120 && SLUG_PATTERN.test(value);
}

/** Parses the stored JSON; anything malformed becomes an empty list. */
export function parseRecentSlugs(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isProductSlug).slice(0, RECENTLY_VIEWED_MAX) : [];
  } catch {
    // Corrupt or tampered storage is expected input here — start fresh.
    return [];
  }
}

/** Puts `slug` first, removing any earlier occurrence, capped at the max. */
export function addRecentSlug(list: string[], slug: string): string[] {
  return [slug, ...list.filter((entry) => entry !== slug)].slice(0, RECENTLY_VIEWED_MAX);
}

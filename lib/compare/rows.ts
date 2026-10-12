import { isProductSlug } from "@/lib/catalog/recently-viewed";

/** Pure helpers for the product compare feature (task 139). */

export const COMPARE_KEY = "robonautsshop:compare";
export const COMPARE_MAX = 4;

/** Parses stored JSON; malformed or invalid entries are dropped. */
export function parseCompareSlugs(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter(isProductSlug))].slice(0, COMPARE_MAX)
      : [];
  } catch {
    // Corrupt or tampered storage is expected input here — start fresh.
    return [];
  }
}

export type ToggleCompareResult = { slugs: string[]; full: boolean };

/** Adds or removes `slug`; refuses to go past COMPARE_MAX. */
export function toggleCompareSlug(slugs: string[], slug: string): ToggleCompareResult {
  if (slugs.includes(slug)) {
    return { slugs: slugs.filter((entry) => entry !== slug), full: false };
  }
  if (slugs.length >= COMPARE_MAX) {
    return { slugs, full: true };
  }
  return { slugs: [...slugs, slug], full: false };
}

export type CompareSpecRow = {
  label: string;
  /** One value per product, in product order; null where a product has no value. */
  values: Array<string | null>;
  /** True when at least two products have a value and they are not all equal. */
  differs: boolean;
};

/**
 * One row per specification key found on any product (first-seen order),
 * so "RPM" and "Voltage" line up across products.
 */
export function buildCompareRows(
  specifications: Array<Record<string, string>>,
): CompareSpecRow[] {
  const labels: string[] = [];
  for (const specs of specifications) {
    for (const key of Object.keys(specs)) {
      if (!labels.includes(key)) labels.push(key);
    }
  }

  return labels.map((label) => {
    const values = specifications.map((specs) => specs[label] ?? null);
    const present = values.filter((value): value is string => value !== null);
    return {
      label,
      values,
      differs: present.length > 1 && new Set(present).size > 1,
    };
  });
}

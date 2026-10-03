/**
 * Absolute site origin for SEO helpers (sitemap, robots).
 * Prefer NEXT_PUBLIC_SITE_URL; fall back to a local default for development.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

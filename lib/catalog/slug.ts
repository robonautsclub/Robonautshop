/** URL slug from a display name: "Arduino Nano V3" → "arduino-nano-v3". One implementation for seed data and admin forms. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Pure return / warranty rules (task 145). */

export const DEFAULT_RETURN_WINDOW_DAYS = 7;

/** Days after delivery a request may be made. Configure with RETURN_WINDOW_DAYS. */
export function getReturnWindowDays(env: string | undefined = process.env.RETURN_WINDOW_DAYS): number {
  const parsed = Number.parseInt(env ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 365 ? parsed : DEFAULT_RETURN_WINDOW_DAYS;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** True while `now` is no later than `windowDays` after delivery. */
export function isWithinReturnWindow(deliveredAtIso: string, now: Date, windowDays: number): boolean {
  // SQLite's current_timestamp has no zone marker; treat it as UTC.
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(deliveredAtIso)
    ? deliveredAtIso
    : `${deliveredAtIso.replace(" ", "T")}Z`;
  const delivered = new Date(normalized).getTime();
  if (Number.isNaN(delivered)) return false;
  return now.getTime() - delivered <= windowDays * DAY_MS;
}

/** Units of a line still open for a new request (rejected requests free their units). */
export function remainingRequestableQuantity(
  orderedQuantity: number,
  activeRequestedQuantities: number[],
): number {
  return Math.max(0, orderedQuantity - activeRequestedQuantities.reduce((sum, qty) => sum + qty, 0));
}

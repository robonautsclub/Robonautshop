/**
 * Format integer BDT taka for display.
 * Prices in the catalog are whole ৳ amounts (no poisha).
 */
export function formatBdt(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

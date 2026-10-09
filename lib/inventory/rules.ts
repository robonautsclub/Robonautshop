import { getAvailableQuantity, type InventorySummary } from "@/lib/catalog/types";

/**
 * Pure inventory rules shared by order validation, reservation, and tests
 * (tasks/phase-18-hardening/104). One authoritative implementation — do not
 * re-derive which row a line draws from anywhere else (AGENTS.md §34).
 */

/**
 * The inventory row an order line draws stock from: the variant's own row,
 * or for a product-level line the product-level row (falling back to the
 * first row when a product only tracks stock per variant).
 */
export function pickInventoryRow<T extends Pick<InventorySummary, "variantId">>(
  rows: T[],
  variantId: string | null,
): T | null {
  if (variantId) {
    return rows.find((row) => row.variantId === variantId) ?? null;
  }
  return rows.find((row) => row.variantId === null) ?? rows[0] ?? null;
}

/** Units a line can still take from `rows` (0 when no row tracks it). */
export function getLineAvailableQuantity(
  rows: InventorySummary[],
  variantId: string | null,
): number {
  const row = pickInventoryRow(rows, variantId);
  return row ? getAvailableQuantity(row) : 0;
}

/** Whether `quantity` more units can be reserved without overselling. */
export function canReserve(
  row: Pick<InventorySummary, "stockQuantity" | "reservedQuantity">,
  quantity: number,
): boolean {
  return quantity > 0 && row.stockQuantity - row.reservedQuantity >= quantity;
}

/** Reserved quantity after releasing `quantity` — never below 0. */
export function releasedQuantity(reservedQuantity: number, quantity: number): number {
  return Math.max(0, reservedQuantity - quantity);
}

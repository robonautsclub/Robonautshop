import { and, eq, isNull, sql } from "drizzle-orm";

import { getAvailableQuantity } from "@/lib/catalog/types";
import type { Database } from "@/lib/db";
import { inventory } from "@/lib/db/schema/inventory";

export type LowStockAlert = {
  sku: string;
  productName: string;
  availableQuantity: number;
  lowStockThreshold: number;
};

/**
 * Reserves stock for newly-placed order lines by incrementing
 * `reservedQuantity` (AGENTS.md "Inventory": "Available Stock = Total Stock
 * - Reserved Stock" / "Prevent overselling") — this was a gap: orders were
 * validated against static stock but never actually claimed it, so two
 * orders could both pass validation against the same units. Fixing it here,
 * at the one place every order-creation path funnels through
 * (insertOrderWithItems), is the smallest correct fix
 * (tasks/phase-14-advanced/93-inventory-alerts.md needs real stock changes
 * to alert on in the first place).
 *
 * Releasing a reservation on order cancellation is a separate, not-yet-built
 * concern — not implemented here.
 *
 * Returns the lines that are now at or below their low-stock threshold.
 */
export async function reserveStockForOrderLines(
  db: Database,
  lines: Array<{ productId: string; variantId: string | null; quantity: number; productName: string }>,
): Promise<LowStockAlert[]> {
  const alerts: LowStockAlert[] = [];

  for (const line of lines) {
    const condition = line.variantId
      ? and(eq(inventory.productId, line.productId), eq(inventory.variantId, line.variantId))
      : and(eq(inventory.productId, line.productId), isNull(inventory.variantId));

    await db
      .update(inventory)
      .set({
        reservedQuantity: sql`${inventory.reservedQuantity} + ${line.quantity}`,
        updatedAt: new Date().toISOString(),
      })
      .where(condition);

    const rows = await db.select().from(inventory).where(condition);
    for (const row of rows) {
      const availableQuantity = getAvailableQuantity(row);
      if (availableQuantity <= row.lowStockThreshold) {
        alerts.push({
          sku: row.sku,
          productName: line.productName,
          availableQuantity,
          lowStockThreshold: row.lowStockThreshold,
        });
      }
    }
  }

  return alerts;
}

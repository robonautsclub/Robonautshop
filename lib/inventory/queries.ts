import { and, eq, gte, sql } from "drizzle-orm";

import { getAvailableQuantity } from "@/lib/catalog/types";
import type { Database } from "@/lib/db";
import { inventory } from "@/lib/db/schema/inventory";
import { recordStockMovement } from "@/lib/inventory/adjustments";
import { pickInventoryRow } from "@/lib/inventory/rules";

export type LowStockAlert = {
  sku: string;
  productName: string;
  availableQuantity: number;
  lowStockThreshold: number;
};

export type StockLine = {
  productId: string;
  variantId: string | null;
  quantity: number;
  productName: string;
};

/** Order lines whose product was deleted (productId null) hold no stock. */
export function toStockLines(
  lines: Array<{
    productId: string | null;
    variantId: string | null;
    quantity: number;
    productName: string;
  }>,
): StockLine[] {
  return lines.flatMap((line) =>
    line.productId
      ? [
          {
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
            productName: line.productName,
          },
        ]
      : [],
  );
}

export type ReserveStockResult =
  | { ok: true; alerts: LowStockAlert[] }
  | { ok: false; error: string };

type InventoryRow = typeof inventory.$inferSelect;

async function findInventoryRow(
  db: Database,
  line: Pick<StockLine, "productId" | "variantId">,
): Promise<InventoryRow | null> {
  const rows = await db
    .select()
    .from(inventory)
    .where(eq(inventory.productId, line.productId));
  return pickInventoryRow(rows, line.variantId);
}

/**
 * Reserves stock for order lines by incrementing `reservedQuantity`
 * (AGENTS.md "Inventory": "Available Stock = Total Stock - Reserved Stock" /
 * "Prevent overselling").
 *
 * Each UPDATE carries its own `stock - reserved >= qty` guard, so two
 * concurrent orders can never both claim the same units
 * (tasks/phase-18-hardening/104). D1 has no interactive transactions, so if
 * a later line fails, the lines already reserved by this call are released
 * again before returning.
 *
 * On success, returns the lines now at or below their low-stock threshold.
 */
export async function reserveStockForOrderLines(
  db: Database,
  lines: StockLine[],
): Promise<ReserveStockResult> {
  const alerts: LowStockAlert[] = [];
  const reserved: StockLine[] = [];

  for (const line of lines) {
    const row = await findInventoryRow(db, line);
    const updated = row
      ? await db
          .update(inventory)
          .set({
            reservedQuantity: sql`${inventory.reservedQuantity} + ${line.quantity}`,
            updatedAt: new Date().toISOString(),
          })
          .where(
            and(
              eq(inventory.id, row.id),
              gte(
                sql`${inventory.stockQuantity} - ${inventory.reservedQuantity}`,
                line.quantity,
              ),
            ),
          )
          .returning()
      : [];

    const after = updated[0];
    if (!after) {
      await releaseStockForOrderLines(db, reserved);
      return {
        ok: false,
        error: `Sorry, “${line.productName}” no longer has enough stock. Please update your cart and try again.`,
      };
    }

    reserved.push(line);
    const availableQuantity = getAvailableQuantity(after);
    if (availableQuantity <= after.lowStockThreshold) {
      alerts.push({
        sku: after.sku,
        productName: line.productName,
        availableQuantity,
        lowStockThreshold: after.lowStockThreshold,
      });
    }
  }

  return { ok: true, alerts };
}

/**
 * Gives reserved units back (tasks/phase-18-hardening/105) — never takes
 * `reservedQuantity` below 0. Callers track whether an order actually holds
 * a reservation (`orders.stock_state`) so this runs at most once per order.
 */
export async function releaseStockForOrderLines(
  db: Database,
  lines: StockLine[],
): Promise<void> {
  for (const line of lines) {
    const row = await findInventoryRow(db, line);
    if (!row) {
      continue;
    }
    await db
      .update(inventory)
      .set({
        reservedQuantity: sql`max(0, ${inventory.reservedQuantity} - ${line.quantity})`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(inventory.id, row.id));
  }
}

/**
 * On ship (tasks/phase-18-hardening/109): units physically leave stock.
 * When the order held a reservation it is consumed at the same time;
 * otherwise only `stockQuantity` drops. Neither goes below 0. Each change
 * is written to the stock movement history (tasks/phase-19-admin-catalog/122).
 */
export async function deductStockForOrderLines(
  db: Database,
  lines: StockLine[],
  { consumeReservation, orderId = null }: { consumeReservation: boolean; orderId?: string | null },
): Promise<void> {
  for (const line of lines) {
    const row = await findInventoryRow(db, line);
    if (!row) {
      continue;
    }
    const updated = await db
      .update(inventory)
      .set({
        stockQuantity: sql`max(0, ${inventory.stockQuantity} - ${line.quantity})`,
        ...(consumeReservation
          ? {
              reservedQuantity: sql`max(0, ${inventory.reservedQuantity} - ${line.quantity})`,
            }
          : {}),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(inventory.id, row.id))
      .returning();
    const after = updated[0];
    if (after && after.stockQuantity !== row.stockQuantity) {
      await recordStockMovement(db, {
        inventoryId: row.id,
        sku: row.sku,
        delta: after.stockQuantity - row.stockQuantity,
        stockAfter: after.stockQuantity,
        reason: "ORDER_SHIPPED",
        note: null,
        actorUserId: null,
        orderId,
      });
    }
  }
}

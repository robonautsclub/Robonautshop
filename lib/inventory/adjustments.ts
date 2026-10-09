import { and, desc, eq, gte, sql } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { inventory } from "@/lib/db/schema/inventory";
import type { StockMovementReason } from "@/lib/db/schema/shared";
import { stockMovements } from "@/lib/db/schema/stock-movements";
import { users } from "@/lib/db/schema/users";

/**
 * Manual stock changes with a recorded reason
 * (tasks/phase-19-admin-catalog/122). Callers check the admin role first.
 */

export type StockAdjustment = {
  inventoryId: string;
  delta: number;
  reason: StockMovementReason;
  note: string | null;
  actorUserId: string | null;
  orderId?: string | null;
};

export type StockAdjustmentResult =
  | { ok: true; stockAfter: number }
  | { ok: false; error: string };

/** Writes one history row; `stockAfter` is the stock level right after the change. */
export async function recordStockMovement(
  db: Database,
  movement: StockAdjustment & { sku: string; stockAfter: number },
): Promise<void> {
  await db.insert(stockMovements).values({
    id: crypto.randomUUID(),
    inventoryId: movement.inventoryId,
    sku: movement.sku,
    delta: movement.delta,
    stockAfter: movement.stockAfter,
    reason: movement.reason,
    note: movement.note,
    actorUserId: movement.actorUserId,
    orderId: movement.orderId ?? null,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Adds or removes units. The UPDATE itself guards `stock + delta >=
 * reserved`, so an adjustment can never strand units already promised to
 * open orders (and stock never drops below 0), even with concurrent orders.
 */
export async function adjustStock(
  db: Database,
  adjustment: StockAdjustment,
): Promise<StockAdjustmentResult> {
  const updated = await db
    .update(inventory)
    .set({
      stockQuantity: sql`${inventory.stockQuantity} + ${adjustment.delta}`,
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(inventory.id, adjustment.inventoryId),
        gte(sql`${inventory.stockQuantity} + ${adjustment.delta}`, inventory.reservedQuantity),
        gte(sql`${inventory.stockQuantity} + ${adjustment.delta}`, 0),
      ),
    )
    .returning();

  const row = updated[0];
  if (!row) {
    const current = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, adjustment.inventoryId))
      .limit(1);
    if (!current[0]) {
      return { ok: false, error: "Inventory row not found." };
    }
    return {
      ok: false,
      error: `Stock can't go below the ${current[0].reservedQuantity} unit(s) reserved for open orders (currently ${current[0].stockQuantity} in stock).`,
    };
  }

  await recordStockMovement(db, { ...adjustment, sku: row.sku, stockAfter: row.stockQuantity });
  return { ok: true, stockAfter: row.stockQuantity };
}

export async function setLowStockThreshold(
  db: Database,
  inventoryId: string,
  lowStockThreshold: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const updated = await db
    .update(inventory)
    .set({ lowStockThreshold, updatedAt: new Date().toISOString() })
    .where(eq(inventory.id, inventoryId))
    .returning({ id: inventory.id });
  return updated[0] ? { ok: true } : { ok: false, error: "Inventory row not found." };
}

export type StockMovementRow = {
  id: string;
  delta: number;
  stockAfter: number;
  reason: StockMovementReason;
  note: string | null;
  orderId: string | null;
  actorName: string | null;
  createdAt: string;
};

export async function listStockMovements(
  db: Database,
  inventoryId: string,
  limit = 50,
): Promise<StockMovementRow[]> {
  return db
    .select({
      id: stockMovements.id,
      delta: stockMovements.delta,
      stockAfter: stockMovements.stockAfter,
      reason: stockMovements.reason,
      note: stockMovements.note,
      orderId: stockMovements.orderId,
      actorName: users.name,
      createdAt: stockMovements.createdAt,
    })
    .from(stockMovements)
    .leftJoin(users, eq(users.id, stockMovements.actorUserId))
    .where(eq(stockMovements.inventoryId, inventoryId))
    // rowid breaks ties between movements written in the same millisecond.
    .orderBy(desc(stockMovements.createdAt), desc(sql`${stockMovements}.rowid`))
    .limit(limit);
}

import { and, desc, eq, ne } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { inventory } from "@/lib/db/schema/inventory";
import { orderItems } from "@/lib/db/schema/order-items";
import { orders } from "@/lib/db/schema/orders";
import {
  returnRequests,
  type ReturnReason,
  type ReturnStatus,
  type ReturnType,
} from "@/lib/db/schema/return-requests";
import { users } from "@/lib/db/schema/users";
import { adjustStock } from "@/lib/inventory/adjustments";
import { pickInventoryRow } from "@/lib/inventory/rules";
import {
  getReturnWindowDays,
  isWithinReturnWindow,
  remainingRequestableQuantity,
} from "@/lib/returns/rules";

export type ReturnRequestRecord = typeof returnRequests.$inferSelect;

export type CreateReturnResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Creates a request for a line of the user's own DELIVERED order, inside the
 * return window and within the units not already requested.
 */
export async function createReturnRequest(
  db: Database,
  userId: string,
  input: {
    orderItemId: string;
    type: ReturnType;
    reason: ReturnReason;
    quantity: number;
    note: string | null;
  },
  now: Date = new Date(),
  windowDays: number = getReturnWindowDays(),
): Promise<CreateReturnResult> {
  const row = (
    await db
      .select({
        orderId: orders.id,
        orderStatus: orders.status,
        deliveredAt: orders.updatedAt,
        orderedQuantity: orderItems.quantity,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(eq(orderItems.id, input.orderItemId), eq(orders.userId, userId)))
      .limit(1)
  )[0];
  if (!row) {
    return { ok: false, error: "Order item not found." };
  }
  if (row.orderStatus !== "DELIVERED") {
    return { ok: false, error: "Returns and warranty claims are only available for delivered orders." };
  }
  // A DELIVERED order is terminal, so its updatedAt is when it was delivered.
  if (!isWithinReturnWindow(row.deliveredAt, now, windowDays)) {
    return { ok: false, error: `The ${windowDays}-day window for requests on this order has passed.` };
  }

  const existing = await db
    .select({ quantity: returnRequests.quantity })
    .from(returnRequests)
    .where(and(eq(returnRequests.orderItemId, input.orderItemId), ne(returnRequests.status, "REJECTED")));
  const remaining = remainingRequestableQuantity(
    row.orderedQuantity,
    existing.map((entry) => entry.quantity),
  );
  if (input.quantity > remaining) {
    return {
      ok: false,
      error: remaining === 0 ? "You already have requests covering every unit of this item." : `You can request at most ${remaining} more unit(s) of this item.`,
    };
  }

  const id = crypto.randomUUID();
  await db.insert(returnRequests).values({
    id,
    orderId: row.orderId,
    orderItemId: input.orderItemId,
    userId,
    type: input.type,
    reason: input.reason,
    quantity: input.quantity,
    note: input.note,
  });
  return { ok: true, id };
}

export async function listReturnRequestsForOrder(
  db: Database,
  userId: string,
  orderId: string,
): Promise<Array<ReturnRequestRecord & { productName: string }>> {
  return db
    .select({
      id: returnRequests.id,
      orderId: returnRequests.orderId,
      orderItemId: returnRequests.orderItemId,
      userId: returnRequests.userId,
      type: returnRequests.type,
      reason: returnRequests.reason,
      quantity: returnRequests.quantity,
      note: returnRequests.note,
      status: returnRequests.status,
      adminNote: returnRequests.adminNote,
      decidedAt: returnRequests.decidedAt,
      createdAt: returnRequests.createdAt,
      updatedAt: returnRequests.updatedAt,
      productName: orderItems.productName,
    })
    .from(returnRequests)
    .innerJoin(orderItems, eq(orderItems.id, returnRequests.orderItemId))
    .where(and(eq(returnRequests.orderId, orderId), eq(returnRequests.userId, userId)))
    .orderBy(desc(returnRequests.createdAt));
}

export type AdminReturnRequest = {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  sku: string;
  type: ReturnType;
  reason: ReturnReason;
  quantity: number;
  note: string | null;
  status: ReturnStatus;
  adminNote: string | null;
  createdAt: string;
};

export async function listReturnRequestsForAdmin(db: Database): Promise<AdminReturnRequest[]> {
  return db
    .select({
      id: returnRequests.id,
      orderId: returnRequests.orderId,
      customerName: users.name,
      productName: orderItems.productName,
      sku: orderItems.sku,
      type: returnRequests.type,
      reason: returnRequests.reason,
      quantity: returnRequests.quantity,
      note: returnRequests.note,
      status: returnRequests.status,
      adminNote: returnRequests.adminNote,
      createdAt: returnRequests.createdAt,
    })
    .from(returnRequests)
    .innerJoin(orderItems, eq(orderItems.id, returnRequests.orderItemId))
    .innerJoin(users, eq(users.id, returnRequests.userId))
    .orderBy(desc(returnRequests.createdAt));
}

export type DecideReturnResult = { ok: true; restocked: boolean } | { ok: false; error: string };

/**
 * Records the admin's decision (compare-and-set on PENDING so it can only be
 * decided once). Approving a RETURN puts the units back in stock as a
 * RETURNED stock movement; warranty approvals and rejections leave stock
 * alone. Refunds / replacements are handled manually.
 */
export async function decideReturnRequest(
  db: Database,
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  adminNote: string | null,
  actorUserId: string | null,
): Promise<DecideReturnResult> {
  const request = (
    await db.select().from(returnRequests).where(eq(returnRequests.id, requestId)).limit(1)
  )[0];
  if (!request) {
    return { ok: false, error: "Request not found." };
  }

  const now = new Date().toISOString();
  const updated = await db
    .update(returnRequests)
    .set({ status: decision, adminNote, decidedAt: now, updatedAt: now })
    .where(and(eq(returnRequests.id, requestId), eq(returnRequests.status, "PENDING")))
    .returning({ id: returnRequests.id });
  if (!updated[0]) {
    return { ok: false, error: "This request was already decided." };
  }

  if (decision !== "APPROVED" || request.type !== "RETURN") {
    return { ok: true, restocked: false };
  }

  const line = (
    await db.select().from(orderItems).where(eq(orderItems.id, request.orderItemId)).limit(1)
  )[0];
  if (!line?.productId) {
    return { ok: true, restocked: false }; // product was deleted — nothing to restock
  }
  const rows = await db.select().from(inventory).where(eq(inventory.productId, line.productId));
  const row = pickInventoryRow(rows, line.variantId);
  if (!row) {
    return { ok: true, restocked: false };
  }

  const result = await adjustStock(db, {
    inventoryId: row.id,
    delta: request.quantity,
    reason: "RETURNED",
    note: `Return approved for order ${request.orderId.slice(0, 8)}`,
    actorUserId,
    orderId: request.orderId,
  });
  if (!result.ok) {
    console.error("[returns] restock failed after approval:", result.error);
  }
  return { ok: true, restocked: result.ok };
}

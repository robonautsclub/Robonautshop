import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Database } from "@/lib/db";
import { categories } from "@/lib/db/schema/categories";
import { inventory } from "@/lib/db/schema/inventory";
import { orderItems } from "@/lib/db/schema/order-items";
import { orders } from "@/lib/db/schema/orders";
import { products } from "@/lib/db/schema/products";
import { returnRequests } from "@/lib/db/schema/return-requests";
import type { OrderStatus } from "@/lib/db/schema/shared";
import { stockMovements } from "@/lib/db/schema/stock-movements";
import { users } from "@/lib/db/schema/users";
import { createReturnRequest, decideReturnRequest } from "@/lib/returns/queries";
import { getReturnWindowDays, isWithinReturnWindow } from "@/lib/returns/rules";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

const input = { orderItemId: "l1", type: "RETURN" as const, reason: "DEFECTIVE" as const, quantity: 1, note: null };

async function seedOrder(status: OrderStatus) {
  await db.delete(returnRequests);
  await db.delete(stockMovements);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(inventory);
  await db.insert(inventory).values({
    id: "i1", productId: "p1", variantId: null, sku: "N20", stockQuantity: 5, reservedQuantity: 0,
  });
  await db.insert(orders).values({
    id: "o1", userId: "u1", status, paymentStatus: "PAID", paymentMethod: "BKASH",
    subtotal: 600, shippingTotal: 60, total: 660, shippingFullName: "B", shippingPhone: "01700000000",
    shippingAddressLine1: "House 1", shippingCity: "Dhaka",
    updatedAt: new Date().toISOString(),
  });
  await db.insert(orderItems).values({
    id: "l1", orderId: "o1", productId: "p1", variantId: null, productName: "N20", sku: "N20",
    quantity: 2, unitPrice: 300, lineTotal: 600,
  });
}

async function stock() {
  return (await db.select().from(inventory).where(eq(inventory.id, "i1")))[0].stockQuantity;
}

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  const now = new Date();
  await db.insert(users).values([
    { id: "u1", name: "Buyer", email: "b@example.com", createdAt: now, updatedAt: now },
    { id: "u2", name: "Other", email: "o@example.com", createdAt: now, updatedAt: now },
  ]);
  await db.insert(categories).values({ id: "c1", name: "Parts", slug: "parts" });
  await db.insert(products).values({
    id: "p1", name: "N20", slug: "n20", sku: "N20", description: "", shortDescription: "",
    categoryId: "c1", price: 300, status: "PUBLISHED",
  });
});

beforeEach(async () => {
  await seedOrder("DELIVERED");
});

afterAll(async () => {
  await dispose();
});

describe("return window rules", () => {
  it("accepts requests inside the window only", () => {
    const delivered = "2026-01-10 00:00:00";
    expect(isWithinReturnWindow(delivered, new Date("2026-01-16T00:00:00Z"), 7)).toBe(true);
    expect(isWithinReturnWindow(delivered, new Date("2026-01-18T00:00:00Z"), 7)).toBe(false);
  });

  it("reads a configurable window with a safe default", () => {
    expect(getReturnWindowDays("14")).toBe(14);
    expect(getReturnWindowDays("nope")).toBe(7);
    expect(getReturnWindowDays(undefined)).toBe(7);
  });
});

describe("createReturnRequest", () => {
  it("accepts a request on a delivered order and caps total units", async () => {
    expect(await createReturnRequest(db, "u1", input)).toMatchObject({ ok: true });
    expect(await createReturnRequest(db, "u1", { ...input, quantity: 2 })).toMatchObject({ ok: false });
    expect(await createReturnRequest(db, "u1", input)).toMatchObject({ ok: true });
    expect(await createReturnRequest(db, "u1", input)).toMatchObject({ ok: false });
  });

  it("refuses undelivered orders, other users' orders and late requests", async () => {
    await seedOrder("SHIPPED");
    expect(await createReturnRequest(db, "u1", input)).toMatchObject({ ok: false });
    await seedOrder("DELIVERED");
    expect(await createReturnRequest(db, "u2", input)).toMatchObject({ ok: false, error: "Order item not found." });
    const later = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    expect(await createReturnRequest(db, "u1", input, later)).toMatchObject({ ok: false });
  });
});

describe("decideReturnRequest", () => {
  it("restocks an approved return once, with a RETURNED movement", async () => {
    const created = await createReturnRequest(db, "u1", input);
    if (!created.ok) throw new Error("setup failed");

    expect(await decideReturnRequest(db, created.id, "APPROVED", "Thanks", null)).toEqual({ ok: true, restocked: true });
    expect(await stock()).toBe(6);
    expect((await db.select().from(stockMovements))[0]).toMatchObject({ reason: "RETURNED", delta: 1 });

    expect(await decideReturnRequest(db, created.id, "APPROVED", null, null)).toMatchObject({ ok: false });
    expect(await stock()).toBe(6);
  });

  it("does not restock rejections or warranty approvals", async () => {
    const rejected = await createReturnRequest(db, "u1", input);
    const warranty = await createReturnRequest(db, "u1", { ...input, type: "WARRANTY" });
    if (!rejected.ok || !warranty.ok) throw new Error("setup failed");

    expect(await decideReturnRequest(db, rejected.id, "REJECTED", "No", null)).toEqual({ ok: true, restocked: false });
    expect(await decideReturnRequest(db, warranty.id, "APPROVED", null, null)).toEqual({ ok: true, restocked: false });
    expect(await stock()).toBe(5);
  });

  it("frees the units of a rejected request for a new one", async () => {
    const first = await createReturnRequest(db, "u1", { ...input, quantity: 2 });
    if (!first.ok) throw new Error("setup failed");
    await decideReturnRequest(db, first.id, "REJECTED", null, null);
    expect(await createReturnRequest(db, "u1", { ...input, quantity: 2 })).toMatchObject({ ok: true });
  });
});

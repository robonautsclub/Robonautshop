import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Database } from "@/lib/db";
import { categories } from "@/lib/db/schema/categories";
import { inventory } from "@/lib/db/schema/inventory";
import { orderItems } from "@/lib/db/schema/order-items";
import { orders } from "@/lib/db/schema/orders";
import { products } from "@/lib/db/schema/products";
import type { OrderPaymentStatus, OrderStatus, OrderStockState } from "@/lib/db/schema/shared";
import { users } from "@/lib/db/schema/users";
import { updateOrderStatus } from "@/lib/orders/status-queries";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

async function stock() {
  const rows = await db.select().from(inventory).where(eq(inventory.id, "i1"));
  return { stock: rows[0].stockQuantity, reserved: rows[0].reservedQuantity };
}

async function orderRow() {
  return (await db.select().from(orders).where(eq(orders.id, "o1")))[0];
}

async function placeOrder(
  status: OrderStatus,
  paymentStatus: OrderPaymentStatus,
  stockState: OrderStockState,
) {
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(inventory);
  await db.insert(inventory).values({
    id: "i1",
    productId: "p1",
    variantId: null,
    sku: "NANO",
    stockQuantity: 10,
    reservedQuantity: stockState === "RESERVED" ? 2 : 0,
  });
  await db.insert(orders).values({
    id: "o1",
    userId: "u1",
    status,
    paymentStatus,
    stockState,
    paymentMethod: "BKASH",
    subtotal: 1300,
    shippingTotal: 60,
    total: 1360,
    shippingFullName: "Test Customer",
    shippingPhone: "01700000000",
    shippingAddressLine1: "House 1, Road 1",
    shippingCity: "Dhaka",
  });
  await db.insert(orderItems).values({
    id: "oi1",
    orderId: "o1",
    productId: "p1",
    variantId: null,
    productName: "Arduino Nano",
    sku: "NANO",
    quantity: 2,
    unitPrice: 650,
    lineTotal: 1300,
  });
}

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  const now = new Date();
  await db.insert(users).values({ id: "u1", name: "Test", email: "t@example.com", createdAt: now, updatedAt: now });
  await db.insert(categories).values({ id: "c1", name: "Parts", slug: "parts" });
  await db.insert(products).values({
    id: "p1",
    name: "Arduino Nano",
    slug: "arduino-nano",
    sku: "NANO",
    description: "",
    shortDescription: "",
    categoryId: "c1",
    price: 650,
  });
});

beforeEach(async () => {
  await placeOrder("PAID", "PAID", "RESERVED");
});

afterAll(async () => {
  await dispose();
});

describe("updateOrderStatus", () => {
  it("moves a paid order forward without touching stock until it ships", async () => {
    expect(await updateOrderStatus(db, "o1", "PROCESSING")).toEqual({ ok: true, status: "PROCESSING" });
    expect(await updateOrderStatus(db, "o1", "PACKED")).toMatchObject({ ok: true });
    expect(await stock()).toEqual({ stock: 10, reserved: 2 });
  });

  it("deducts stock and consumes the reservation on ship, once", async () => {
    await updateOrderStatus(db, "o1", "PROCESSING");
    await updateOrderStatus(db, "o1", "PACKED");
    await updateOrderStatus(db, "o1", "SHIPPED");
    expect(await stock()).toEqual({ stock: 8, reserved: 0 });
    expect((await orderRow()).stockState).toBe("DEDUCTED");

    await updateOrderStatus(db, "o1", "DELIVERED");
    expect(await stock()).toEqual({ stock: 8, reserved: 0 });
  });

  it("releases the reservation on cancel", async () => {
    expect(await updateOrderStatus(db, "o1", "CANCELLED")).toMatchObject({ ok: true });
    expect(await stock()).toEqual({ stock: 10, reserved: 0 });
    expect((await orderRow()).stockState).toBe("NONE");
  });

  it("ships an order that held no reservation by lowering stock only", async () => {
    await placeOrder("PACKED", "PAID", "NONE");
    await updateOrderStatus(db, "o1", "SHIPPED");
    expect(await stock()).toEqual({ stock: 8, reserved: 0 });
  });

  it("rejects invalid moves and leaves the order alone", async () => {
    expect(await updateOrderStatus(db, "o1", "SHIPPED")).toMatchObject({ ok: false });
    expect((await orderRow()).status).toBe("PAID");
  });

  it("never changes payment status", async () => {
    await updateOrderStatus(db, "o1", "CANCELLED");
    expect((await orderRow()).paymentStatus).toBe("PAID");
  });

  it("refuses to fulfil an unpaid order", async () => {
    await placeOrder("PAYMENT_PENDING", "FAILED", "NONE");
    expect(await updateOrderStatus(db, "o1", "PROCESSING")).toMatchObject({ ok: false });
  });

  it("applies a concurrent double cancel only once", async () => {
    // Another order also holds 2 units — a double release would free them too.
    await db.update(inventory).set({ reservedQuantity: 4 }).where(eq(inventory.id, "i1"));
    const results = await Promise.all([
      updateOrderStatus(db, "o1", "CANCELLED"),
      updateOrderStatus(db, "o1", "CANCELLED"),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(await stock()).toEqual({ stock: 10, reserved: 2 });
  });

  it("reports a missing order", async () => {
    expect(await updateOrderStatus(db, "nope", "CANCELLED")).toEqual({
      ok: false,
      error: "Order not found.",
    });
  });
});

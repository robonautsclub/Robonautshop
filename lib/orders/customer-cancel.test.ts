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
import { cancelOrderForCustomer } from "@/lib/orders/customer-cancel";
import { canCustomerCancelOrder } from "@/lib/orders/status-rules";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

async function stock() {
  const rows = await db.select().from(inventory).where(eq(inventory.id, "i1"));
  return { stock: rows[0].stockQuantity, reserved: rows[0].reservedQuantity };
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
  await db.insert(users).values([
    { id: "u1", name: "Test", email: "t@example.com", createdAt: now, updatedAt: now },
    { id: "u2", name: "Other", email: "o@example.com", createdAt: now, updatedAt: now },
  ]);
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

describe("canCustomerCancelOrder", () => {
  it("allows only statuses before packing", () => {
    expect(canCustomerCancelOrder("PENDING")).toBe(true);
    expect(canCustomerCancelOrder("PAID")).toBe(true);
    expect(canCustomerCancelOrder("PACKED")).toBe(false);
    expect(canCustomerCancelOrder("SHIPPED")).toBe(false);
    expect(canCustomerCancelOrder("CANCELLED")).toBe(false);
  });
});

describe("cancelOrderForCustomer", () => {
  it("cancels a paid order, releases stock and flags a manual refund", async () => {
    expect(await cancelOrderForCustomer(db, "u1", "o1")).toEqual({
      ok: true,
      orderId: "o1",
      refundPending: true,
    });
    expect(await stock()).toEqual({ stock: 10, reserved: 0 });
  });

  it("needs no refund for an unpaid order", async () => {
    await placeOrder("PAYMENT_PENDING", "PENDING", "RESERVED");
    expect(await cancelOrderForCustomer(db, "u1", "o1")).toMatchObject({
      ok: true,
      refundPending: false,
    });
    expect(await stock()).toEqual({ stock: 10, reserved: 0 });
  });

  it("refuses a packed or shipped order", async () => {
    await placeOrder("SHIPPED", "PAID", "NONE");
    expect(await cancelOrderForCustomer(db, "u1", "o1")).toMatchObject({ ok: false });
    await placeOrder("PACKED", "PAID", "RESERVED");
    expect(await cancelOrderForCustomer(db, "u1", "o1")).toMatchObject({ ok: false });
    expect(await stock()).toEqual({ stock: 10, reserved: 2 });
  });

  it("does not let another user cancel the order", async () => {
    expect(await cancelOrderForCustomer(db, "u2", "o1")).toEqual({
      ok: false,
      error: "Order not found.",
    });
    expect(await stock()).toEqual({ stock: 10, reserved: 2 });
  });
});

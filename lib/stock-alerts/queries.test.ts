import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const sendBackInStockEmail = vi.hoisted(() => vi.fn(async () => true));
vi.mock("@/lib/email/send", () => ({ sendBackInStockEmail }));

import { adjustStock } from "@/lib/inventory/adjustments";
import type { Database } from "@/lib/db";
import { backInStockSubscriptions } from "@/lib/db/schema/back-in-stock";
import { categories } from "@/lib/db/schema/categories";
import { inventory } from "@/lib/db/schema/inventory";
import { productVariants } from "@/lib/db/schema/product-variants";
import { products } from "@/lib/db/schema/products";
import { notifyBackInStock, subscribeBackInStock } from "@/lib/stock-alerts/queries";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

async function setStock(stock: number, reserved = 0) {
  await db.update(inventory).set({ stockQuantity: stock, reservedQuantity: reserved }).where(eq(inventory.id, "i1"));
}

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  await db.insert(categories).values({ id: "c1", name: "Parts", slug: "parts" });
  await db.insert(products).values({
    id: "p1",
    name: "N20 Motor",
    slug: "n20-motor",
    sku: "N20",
    description: "",
    shortDescription: "",
    categoryId: "c1",
    price: 300,
    status: "PUBLISHED",
  });
  await db.insert(productVariants).values({ id: "v1", productId: "p1", name: "300 RPM", sku: "N20-300", price: 320 });
  await db.insert(inventory).values({
    id: "i1",
    productId: "p1",
    variantId: "v1",
    sku: "N20-300",
    stockQuantity: 0,
    reservedQuantity: 0,
  });
});

beforeEach(async () => {
  sendBackInStockEmail.mockClear();
  await db.delete(backInStockSubscriptions);
  await setStock(0);
});

afterAll(async () => {
  await dispose();
});

describe("subscribeBackInStock", () => {
  it("keeps one subscription per email per variant", async () => {
    const input = { productId: "p1", variantId: "v1", email: "a@example.com" };
    expect(await subscribeBackInStock(db, input)).toEqual({ ok: true });
    expect(await subscribeBackInStock(db, input)).toEqual({ ok: true });
    expect(await db.select().from(backInStockSubscriptions)).toHaveLength(1);
  });

  it("refuses when the item is in stock or the variant is wrong", async () => {
    await setStock(5);
    expect(await subscribeBackInStock(db, { productId: "p1", variantId: "v1", email: "a@example.com" })).toMatchObject({ ok: false });
    await setStock(0);
    expect(await subscribeBackInStock(db, { productId: "p1", variantId: "nope", email: "a@example.com" })).toMatchObject({ ok: false });
  });
});

describe("notifyBackInStock", () => {
  it("emails each subscriber once when stock returns", async () => {
    await subscribeBackInStock(db, { productId: "p1", variantId: "v1", email: "a@example.com" });
    await subscribeBackInStock(db, { productId: "p1", variantId: "v1", email: "b@example.com" });

    await setStock(3);
    expect(await notifyBackInStock(db, "i1")).toBe(2);
    expect(await notifyBackInStock(db, "i1")).toBe(0);
    expect(sendBackInStockEmail).toHaveBeenCalledTimes(2);
  });

  it("does nothing while all units are still reserved", async () => {
    await subscribeBackInStock(db, { productId: "p1", variantId: "v1", email: "a@example.com" });
    await setStock(2, 2);
    expect(await notifyBackInStock(db, "i1")).toBe(0);
    expect(sendBackInStockEmail).not.toHaveBeenCalled();
  });

  it("releases a subscription whose email failed so a later restock retries it", async () => {
    await subscribeBackInStock(db, { productId: "p1", variantId: "v1", email: "a@example.com" });
    await setStock(3);
    expect(await notifyBackInStock(db, "i1", async () => false)).toBe(0);
    expect(await notifyBackInStock(db, "i1")).toBe(1);
  });
});

describe("restocking through adjustStock", () => {
  it("emails subscribers once", async () => {
    await subscribeBackInStock(db, { productId: "p1", variantId: "v1", email: "a@example.com" });

    expect(await adjustStock(db, { inventoryId: "i1", delta: 4, reason: "RECEIVED", note: null, actorUserId: null })).toMatchObject({ ok: true });
    expect(sendBackInStockEmail).toHaveBeenCalledTimes(1);

    await adjustStock(db, { inventoryId: "i1", delta: 4, reason: "RECEIVED", note: null, actorUserId: null });
    expect(sendBackInStockEmail).toHaveBeenCalledTimes(1);
  });
});

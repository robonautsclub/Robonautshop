import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/lib/db";
import { categories } from "@/lib/db/schema/categories";
import { inventory } from "@/lib/db/schema/inventory";
import { products } from "@/lib/db/schema/products";
import { adjustStock, listStockMovements } from "@/lib/inventory/adjustments";
import { deductStockForOrderLines } from "@/lib/inventory/queries";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  await db.insert(categories).values({ id: "c1", name: "Parts", slug: "parts" });
  await db.insert(products).values({
    id: "p1",
    name: "IR Sensor",
    slug: "ir",
    sku: "IR",
    description: "",
    shortDescription: "",
    categoryId: "c1",
    price: 120,
  });
  await db.insert(inventory).values({
    id: "i1",
    productId: "p1",
    sku: "IR",
    stockQuantity: 10,
    reservedQuantity: 4,
  });
});

afterAll(async () => {
  await dispose();
});

describe("adjustStock", () => {
  it("adds received stock and records the movement", async () => {
    const result = await adjustStock(db, {
      inventoryId: "i1",
      delta: 5,
      reason: "RECEIVED",
      note: "Supplier batch",
      actorUserId: null,
    });
    expect(result).toEqual({ ok: true, stockAfter: 15 });
    const history = await listStockMovements(db, "i1");
    expect(history[0]).toMatchObject({ delta: 5, stockAfter: 15, reason: "RECEIVED", note: "Supplier batch" });
  });

  it("refuses to drop stock below the reserved quantity", async () => {
    const result = await adjustStock(db, {
      inventoryId: "i1",
      delta: -12,
      reason: "DAMAGED",
      note: null,
      actorUserId: null,
    });
    expect(result.ok).toBe(false);
    const [row] = await db.select().from(inventory).where(eq(inventory.id, "i1"));
    expect(row.stockQuantity).toBe(15);
    expect(await listStockMovements(db, "i1")).toHaveLength(1);
  });

  it("allows removing down to exactly the reserved quantity", async () => {
    const result = await adjustStock(db, {
      inventoryId: "i1",
      delta: -11,
      reason: "RECOUNT",
      note: null,
      actorUserId: null,
    });
    expect(result).toEqual({ ok: true, stockAfter: 4 });
  });

  it("records shipped deductions in the same history", async () => {
    await deductStockForOrderLines(
      db,
      [{ productId: "p1", variantId: null, quantity: 2, productName: "IR Sensor" }],
      { consumeReservation: true },
    );
    const [latest] = await listStockMovements(db, "i1");
    expect(latest).toMatchObject({ delta: -2, stockAfter: 2, reason: "ORDER_SHIPPED" });
  });
});

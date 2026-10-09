import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Database } from "@/lib/db";
import { categories } from "@/lib/db/schema/categories";
import { inventory } from "@/lib/db/schema/inventory";
import { productVariants } from "@/lib/db/schema/product-variants";
import { products } from "@/lib/db/schema/products";
import {
  deductStockForOrderLines,
  releaseStockForOrderLines,
  reserveStockForOrderLines,
  type StockLine,
} from "@/lib/inventory/queries";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

const nano: StockLine = {
  productId: "p-nano",
  variantId: null,
  quantity: 1,
  productName: "Arduino Nano",
};
const n20Rpm300: StockLine = {
  productId: "p-n20",
  variantId: "v-n20-300",
  quantity: 1,
  productName: "N20 Gear Motor · 300 RPM",
};

async function stockOf(id: string) {
  const rows = await db.select().from(inventory).where(eq(inventory.id, id));
  return { stock: rows[0].stockQuantity, reserved: rows[0].reservedQuantity };
}

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  await db.insert(categories).values({ id: "c1", name: "Parts", slug: "parts" });
  await db.insert(products).values([
    {
      id: "p-nano",
      name: "Arduino Nano",
      slug: "arduino-nano",
      sku: "NANO",
      description: "",
      shortDescription: "",
      categoryId: "c1",
      price: 650,
    },
    {
      id: "p-n20",
      name: "N20 Gear Motor",
      slug: "n20",
      sku: "N20",
      description: "",
      shortDescription: "",
      categoryId: "c1",
      price: 350,
    },
  ]);
  await db.insert(productVariants).values([
    { id: "v-n20-100", productId: "p-n20", name: "100 RPM", sku: "N20-100" },
    { id: "v-n20-300", productId: "p-n20", name: "300 RPM", sku: "N20-300" },
  ]);
});

beforeEach(async () => {
  await db.delete(inventory);
  await db.insert(inventory).values([
    { id: "i-nano", productId: "p-nano", variantId: null, sku: "NANO", stockQuantity: 5, reservedQuantity: 2, lowStockThreshold: 1 },
    { id: "i-n20-100", productId: "p-n20", variantId: "v-n20-100", sku: "N20-100", stockQuantity: 10, reservedQuantity: 0, lowStockThreshold: 2 },
    { id: "i-n20-300", productId: "p-n20", variantId: "v-n20-300", sku: "N20-300", stockQuantity: 4, reservedQuantity: 0, lowStockThreshold: 2 },
  ]);
});

afterAll(async () => {
  await dispose();
});

describe("reserveStockForOrderLines", () => {
  it("reserves from the matching product-level and variant rows", async () => {
    const result = await reserveStockForOrderLines(db, [
      { ...nano, quantity: 2 },
      { ...n20Rpm300, quantity: 3 },
    ]);
    expect(result.ok).toBe(true);
    expect(await stockOf("i-nano")).toEqual({ stock: 5, reserved: 4 });
    expect(await stockOf("i-n20-300")).toEqual({ stock: 4, reserved: 3 });
    expect(await stockOf("i-n20-100")).toEqual({ stock: 10, reserved: 0 });
  });

  it("allows reserving exactly the available quantity", async () => {
    expect((await reserveStockForOrderLines(db, [{ ...nano, quantity: 3 }])).ok).toBe(true);
    expect(await stockOf("i-nano")).toEqual({ stock: 5, reserved: 5 });
  });

  it("refuses to oversell and leaves stock untouched", async () => {
    const result = await reserveStockForOrderLines(db, [{ ...nano, quantity: 4 }]);
    expect(result).toMatchObject({ ok: false });
    expect(await stockOf("i-nano")).toEqual({ stock: 5, reserved: 2 });
  });

  it("rolls back earlier lines when a later line cannot be reserved", async () => {
    const result = await reserveStockForOrderLines(db, [
      { ...n20Rpm300, quantity: 2 },
      { ...nano, quantity: 10 },
    ]);
    expect(result.ok).toBe(false);
    expect(await stockOf("i-n20-300")).toEqual({ stock: 4, reserved: 0 });
    expect(await stockOf("i-nano")).toEqual({ stock: 5, reserved: 2 });
  });

  it("never lets two orders claim the same last units", async () => {
    const [first, second] = await Promise.all([
      reserveStockForOrderLines(db, [{ ...n20Rpm300, quantity: 3 }]),
      reserveStockForOrderLines(db, [{ ...n20Rpm300, quantity: 3 }]),
    ]);
    expect([first.ok, second.ok].filter(Boolean)).toHaveLength(1);
    expect(await stockOf("i-n20-300")).toEqual({ stock: 4, reserved: 3 });
  });

  it("reports low-stock lines", async () => {
    const result = await reserveStockForOrderLines(db, [{ ...n20Rpm300, quantity: 2 }]);
    expect(result).toMatchObject({
      ok: true,
      alerts: [{ sku: "N20-300", availableQuantity: 2, lowStockThreshold: 2 }],
    });
  });

  it("fails for a product with no inventory row", async () => {
    const result = await reserveStockForOrderLines(db, [
      { ...nano, productId: "missing" },
    ]);
    expect(result.ok).toBe(false);
  });
});

describe("releaseStockForOrderLines", () => {
  it("gives reserved units back", async () => {
    await releaseStockForOrderLines(db, [{ ...nano, quantity: 2 }]);
    expect(await stockOf("i-nano")).toEqual({ stock: 5, reserved: 0 });
  });

  it("never takes reserved below zero", async () => {
    await releaseStockForOrderLines(db, [{ ...nano, quantity: 9 }]);
    expect(await stockOf("i-nano")).toEqual({ stock: 5, reserved: 0 });
  });
});

describe("deductStockForOrderLines", () => {
  it("consumes the reservation when shipping a reserved order", async () => {
    await deductStockForOrderLines(db, [{ ...nano, quantity: 2 }], { consumeReservation: true });
    expect(await stockOf("i-nano")).toEqual({ stock: 3, reserved: 0 });
  });

  it("only lowers stock when the order held no reservation", async () => {
    await deductStockForOrderLines(db, [{ ...nano, quantity: 2 }], { consumeReservation: false });
    expect(await stockOf("i-nano")).toEqual({ stock: 3, reserved: 2 });
  });
});

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getProducts, getProductsPage } from "@/lib/catalog/queries";
import type { Database } from "@/lib/db";
import { categories } from "@/lib/db/schema/categories";
import { inventory } from "@/lib/db/schema/inventory";
import { products } from "@/lib/db/schema/products";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  await db.insert(categories).values([
    { id: "c1", name: "Sensors", slug: "sensors" },
    { id: "c2", name: "Motors", slug: "motors" },
  ]);
  // p01..p05 sensors (newest = p05), p06..p07 motors; p03 is out of stock, p07 is a draft.
  const rows = Array.from({ length: 7 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: `p${n}`,
      name: i === 0 ? "Arduino Nano" : `Part ${n}`,
      slug: `part-${n}`,
      sku: `SKU-${n}`,
      description: "",
      shortDescription: "",
      brand: i < 2 ? "Acme" : "Other",
      categoryId: i < 5 ? "c1" : "c2",
      price: 100 * (i + 1),
      status: i === 6 ? ("DRAFT" as const) : ("PUBLISHED" as const),
      createdAt: `2026-01-0${i + 1} 00:00:00`,
    };
  });
  await db.insert(products).values(rows);
  await db.insert(inventory).values(
    rows.map((row, i) => ({
      id: `i${i}`,
      productId: row.id,
      variantId: null,
      sku: row.sku,
      stockQuantity: row.id === "p03" ? 2 : 10,
      reservedQuantity: row.id === "p03" ? 2 : 0,
    })),
  );
});

afterAll(async () => {
  await dispose();
});

describe("getProductsPage", () => {
  it("returns the requested page with the total, excluding unpublished products", async () => {
    const first = await getProductsPage(db, { pageSize: 4, page: 1 });
    expect(first.total).toBe(6);
    expect(first.totalPages).toBe(2);
    expect(first.products.map((p) => p.id)).toEqual(["p06", "p05", "p04", "p03"]);

    const second = await getProductsPage(db, { pageSize: 4, page: 2 });
    expect(second.products.map((p) => p.id)).toEqual(["p02", "p01"]);
  });

  it("clamps an out-of-range page to the last page", async () => {
    const result = await getProductsPage(db, { pageSize: 4, page: 99 });
    expect(result.page).toBe(2);
    expect(result.products).toHaveLength(2);
  });

  it("keeps category, in-stock and sort filters across pages", async () => {
    const result = await getProductsPage(db, {
      categorySlug: "sensors",
      inStock: true,
      sort: "price-desc",
      pageSize: 2,
      page: 2,
    });
    // sensors in stock: p01, p02, p04, p05 (p03 fully reserved) → price desc p05,p04 | p02,p01
    expect(result.total).toBe(4);
    expect(result.products.map((p) => p.id)).toEqual(["p02", "p01"]);
  });

  it("paginates search results and matches wildcards literally", async () => {
    const nano = await getProductsPage(db, { query: "nano", pageSize: 5 });
    expect(nano.products.map((p) => p.id)).toEqual(["p01"]);

    const percent = await getProductsPage(db, { query: "100%", pageSize: 5 });
    expect(percent.total).toBe(0);
  });

  it("returns nothing for an unknown category", async () => {
    const result = await getProductsPage(db, { categorySlug: "nope" });
    expect(result).toMatchObject({ total: 0, products: [] });
  });
});

describe("getProducts", () => {
  it("still returns every matching product unpaged", async () => {
    expect(await getProducts(db)).toHaveLength(6);
  });
});

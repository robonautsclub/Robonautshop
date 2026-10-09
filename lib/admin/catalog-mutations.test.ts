import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  createCategory,
  createProduct,
  deleteCategory,
  saveKit,
  setCatalogStatus,
  updateProduct,
} from "@/lib/admin/catalog-mutations";
import {
  categoryInputSchema,
  kitInputSchema,
  parseSpecificationLines,
  productInputSchema,
  type ProductInput,
} from "@/lib/admin/catalog-schemas";
import { getProducts } from "@/lib/catalog/queries";
import type { Database } from "@/lib/db";
import { inventory } from "@/lib/db/schema/inventory";
import { kitComponents } from "@/lib/db/schema/kit-components";
import { productVariants } from "@/lib/db/schema/product-variants";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;
let categoryId: string;

function product(overrides: Partial<ProductInput> = {}) {
  return productInputSchema.parse({
    name: "Arduino Nano",
    sku: "nano-v3",
    categoryId,
    price: 650,
    status: "PUBLISHED",
    shortDescription: "Small board",
    description: "ATmega328P board",
    ...overrides,
  });
}

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  const created = await createCategory(db, categoryInputSchema.parse({ name: "Micro Controllers" }));
  if (!created.ok) throw new Error(created.error);
  categoryId = created.id;
});

afterAll(async () => {
  await dispose();
});

describe("product schema", () => {
  it("rejects a compare-at price that isn't higher than the price", () => {
    const result = productInputSchema.safeParse({
      name: "X",
      sku: "X1",
      categoryId: "c",
      price: 500,
      compareAtPrice: 400,
      status: "DRAFT",
      shortDescription: "s",
      description: "d",
    });
    expect(result.success).toBe(false);
  });

  it("parses Key: Value specification lines", () => {
    expect(parseSpecificationLines("Voltage: 5V\n\nbad line\nInterface: I2C: fast")).toEqual({
      Voltage: "5V",
      Interface: "I2C: fast",
    });
  });
});

describe("createProduct / updateProduct", () => {
  it("creates a product with a slug, uppercased SKU and a 0-stock inventory row", async () => {
    const result = await createProduct(db, product());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const rows = await db.select().from(inventory).where(eq(inventory.productId, result.id));
    expect(rows).toMatchObject([{ sku: "NANO-V3", variantId: null, stockQuantity: 0 }]);
    const live = await getProducts(db);
    expect(live.find((row) => row.id === result.id)?.slug).toBe("arduino-nano");
  });

  it("refuses a duplicate SKU with a clear message", async () => {
    const result = await createProduct(db, product({ name: "Another", sku: "NANO-V3" }));
    expect(result).toEqual({ ok: false, error: "Another product already uses that SKU." });
  });

  it("adds variants with their own inventory rows and keeps SKUs in sync", async () => {
    const created = await createProduct(db, product({ name: "N20 Motor", sku: "N20" }));
    if (!created.ok) throw new Error(created.error);
    const first = await updateProduct(
      db,
      created.id,
      product({ name: "N20 Motor", sku: "N20", variants: [{ name: "100 RPM", sku: "N20-100" }] }),
    );
    expect(first.ok).toBe(true);
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.productId, created.id));
    await updateProduct(
      db,
      created.id,
      product({ name: "N20 Motor", sku: "N20", variants: [{ id: variant.id, name: "100 RPM", sku: "N20-100X", price: 400 }] }),
    );
    const rows = await db.select().from(inventory).where(eq(inventory.variantId, variant.id));
    expect(rows[0]?.sku).toBe("N20-100X");
  });

  it("refuses a variant id from another product", async () => {
    const other = await createProduct(db, product({ name: "Uno", sku: "UNO" }));
    if (!other.ok) throw new Error(other.error);
    const [variant] = await db.select().from(productVariants).limit(1);
    const result = await updateProduct(
      db,
      other.id,
      product({ name: "Uno", sku: "UNO", variants: [{ id: variant.id, name: "Hijack", sku: "HIJACK" }] }),
    );
    expect(result.ok).toBe(false);
  });

  it("archiving hides a product from the storefront", async () => {
    const created = await createProduct(db, product({ name: "Old Board", sku: "OLD" }));
    if (!created.ok) throw new Error(created.error);
    await setCatalogStatus(db, "products", created.id, "ARCHIVED");
    const live = await getProducts(db);
    expect(live.some((row) => row.id === created.id)).toBe(false);
  });
});

describe("deleteCategory", () => {
  it("refuses while products use the category", async () => {
    const result = await deleteCategory(db, categoryId);
    expect(result.ok).toBe(false);
  });

  it("deletes an unused category", async () => {
    const created = await createCategory(db, categoryInputSchema.parse({ name: "Empty" }));
    if (!created.ok) throw new Error(created.error);
    expect((await deleteCategory(db, created.id)).ok).toBe(true);
  });
});

describe("saveKit", () => {
  const kit = (components: Array<{ productId: string; quantity: number }>) =>
    kitInputSchema.parse({
      name: "LFR Starter Kit",
      shortDescription: "s",
      description: "d",
      price: 2500,
      status: "PUBLISHED",
      imageUrl: "https://picsum.photos/400",
      imageAlt: "Kit",
      components,
    });

  it("refuses components that are not real products", async () => {
    const result = await saveKit(db, null, kit([{ productId: "missing", quantity: 1 }]));
    expect(result.ok).toBe(false);
  });

  it("replaces the BOM on edit", async () => {
    const [p1, p2] = await getProducts(db);
    const created = await saveKit(db, null, kit([{ productId: p1.id, quantity: 2 }]));
    if (!created.ok) throw new Error(created.error);
    await saveKit(db, created.id, kit([{ productId: p2.id, quantity: 1 }]));
    const lines = await db.select().from(kitComponents).where(eq(kitComponents.kitId, created.id));
    expect(lines).toMatchObject([{ productId: p2.id, quantity: 1 }]);
  });
});

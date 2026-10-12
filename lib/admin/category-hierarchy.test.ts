import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createCategory, deleteCategory, updateCategory } from "@/lib/admin/catalog-mutations";
import type { CategoryData } from "@/lib/admin/catalog-schemas";
import { getProductsPage, getSubcategories } from "@/lib/catalog/queries";
import type { Database } from "@/lib/db";
import { products } from "@/lib/db/schema/products";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

function data(name: string, parentId: string | null = null): CategoryData {
  return { name, slug: "", description: null, parentId, sortOrder: 0 };
}

async function idOf(result: Promise<{ ok: boolean; id?: string }>): Promise<string> {
  const awaited = await result;
  if (!awaited.ok || !awaited.id) throw new Error("expected ok result");
  return awaited.id;
}

let sensors: string;
let irSensors: string;
let motors: string;

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  sensors = await idOf(createCategory(db, data("Sensors")));
  motors = await idOf(createCategory(db, data("Motors")));
  irSensors = await idOf(createCategory(db, data("IR Sensors", sensors)));
  await db.insert(products).values([
    { id: "p1", name: "Ultrasonic", slug: "ultrasonic", sku: "U1", description: "", shortDescription: "", categoryId: sensors, price: 100, status: "PUBLISHED" },
    { id: "p2", name: "IR Array", slug: "ir-array", sku: "I1", description: "", shortDescription: "", categoryId: irSensors, price: 200, status: "PUBLISHED" },
    { id: "p3", name: "N20", slug: "n20", sku: "N1", description: "", shortDescription: "", categoryId: motors, price: 300, status: "PUBLISHED" },
  ]);
});

afterAll(async () => {
  await dispose();
});

describe("category hierarchy", () => {
  it("lists subcategories and includes their products on the parent page", async () => {
    expect((await getSubcategories(db, sensors)).map((c) => c.name)).toEqual(["IR Sensors"]);

    const parent = await getProductsPage(db, { categorySlug: "sensors" });
    expect(parent.products.map((p) => p.id).sort()).toEqual(["p1", "p2"]);

    const child = await getProductsPage(db, { categorySlug: "ir-sensors" });
    expect(child.products.map((p) => p.id)).toEqual(["p2"]);
  });

  it("allows only one nesting level", async () => {
    expect(await createCategory(db, data("Deep", irSensors))).toMatchObject({ ok: false });
    // A category that has subcategories can't become a subcategory.
    expect(await updateCategory(db, sensors, data("Sensors", motors))).toMatchObject({ ok: false });
    expect(await updateCategory(db, motors, data("Motors", motors))).toMatchObject({ ok: false });
    expect(await createCategory(db, data("Ghost", "missing"))).toMatchObject({ ok: false });
  });

  it("refuses to delete a category that still has subcategories", async () => {
    expect(await deleteCategory(db, sensors)).toMatchObject({ ok: false });
  });
});

/**
 * Admin catalog writes to D1 (tasks/phase-19-admin-catalog/119–125).
 *
 * These take already-validated data (lib/admin/catalog-schemas.ts) and never
 * check the role themselves — the server actions in
 * lib/admin/catalog-actions.ts call requireAdminSession() first. Kept apart
 * from the actions so the rules can be tested against a real local D1.
 *
 * D1 has no interactive transactions; multi-row saves go through
 * `db.batch()`, which D1 runs as one atomic unit.
 */

import { and, count, eq, inArray, isNull } from "drizzle-orm";

import type {
  CategoryData,
  KitData,
  ProductData,
  ProjectData,
} from "@/lib/admin/catalog-schemas";
import { slugify } from "@/lib/catalog/slug";
import type { ProductStatus } from "@/lib/catalog/types";
import type { Database } from "@/lib/db";
import { runBatch, type BatchStatement } from "@/lib/db/batch";
import { getUniqueConstraintColumn } from "@/lib/db/errors";
import { categories } from "@/lib/db/schema/categories";
import { inventory } from "@/lib/db/schema/inventory";
import { kitComponents } from "@/lib/db/schema/kit-components";
import { kits } from "@/lib/db/schema/kits";
import { productVariants } from "@/lib/db/schema/product-variants";
import { products } from "@/lib/db/schema/products";
import { projectComponents } from "@/lib/db/schema/project-components";
import { robotProjects } from "@/lib/db/schema/robot-projects";

export type CatalogWriteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function now(): string {
  return new Date().toISOString();
}

function newId(): string {
  return crypto.randomUUID();
}

/** Turns a unique-index failure into a message an admin can act on; rethrows anything else. */
function uniqueConflict(error: unknown, noun: string): CatalogWriteResult {
  const column = getUniqueConstraintColumn(error);
  if (!column) {
    throw error;
  }
  const field = column === "sku" ? "SKU" : column;
  return { ok: false, error: `Another ${noun} already uses that ${field}.` };
}

// ---------------------------------------------------------------- products

async function categoryExists(db: Database, categoryId: string): Promise<boolean> {
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);
  return rows.length > 0;
}

function productValues(data: ProductData) {
  return {
    name: data.name,
    slug: data.slug || slugify(data.name),
    sku: data.sku,
    brand: data.brand,
    categoryId: data.categoryId,
    price: data.price,
    compareAtPrice: data.compareAtPrice,
    weightGrams: data.weightGrams,
    status: data.status,
    featured: data.featured,
    shortDescription: data.shortDescription,
    description: data.description,
    specifications: data.specifications,
  };
}

/**
 * Creates the product, its variants, and one inventory row per thing sold
 * (each variant, or the product itself when it has none) at 0 stock —
 * stock is then added through an adjustment (task 122), so it has history.
 */
export async function createProduct(
  db: Database,
  data: ProductData,
): Promise<CatalogWriteResult> {
  if (!(await categoryExists(db, data.categoryId))) {
    return { ok: false, error: "That category no longer exists." };
  }

  const productId = newId();
  const statements: BatchStatement[] = [
    db.insert(products).values({ id: productId, ...productValues(data) }),
  ];

  if (data.variants.length === 0) {
    statements.push(
      db.insert(inventory).values({ id: newId(), productId, variantId: null, sku: data.sku }),
    );
  }
  data.variants.forEach((variant, index) => {
    const variantId = newId();
    statements.push(
      db.insert(productVariants).values({
        id: variantId,
        productId,
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        sortOrder: index,
      }),
      db.insert(inventory).values({ id: newId(), productId, variantId, sku: variant.sku }),
    );
  });

  try {
    await runBatch(db, statements);
  } catch (error) {
    return uniqueConflict(error, "product");
  }
  return { ok: true, id: productId };
}

/**
 * Updates the product and its variants. Variants are added or edited, never
 * removed here: a variant may be referenced by carts, kits and order history,
 * so dropping one is a separate, deliberate decision (archive the product
 * instead). SKU renames are mirrored onto the matching inventory row.
 */
export async function updateProduct(
  db: Database,
  productId: string,
  data: ProductData,
): Promise<CatalogWriteResult> {
  const [existingRows, existingVariants] = await Promise.all([
    db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1),
    db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.productId, productId)),
  ]);
  if (existingRows.length === 0) {
    return { ok: false, error: "Product not found." };
  }
  if (!(await categoryExists(db, data.categoryId))) {
    return { ok: false, error: "That category no longer exists." };
  }

  const ownVariantIds = new Set(existingVariants.map((variant) => variant.id));
  if (data.variants.some((variant) => variant.id && !ownVariantIds.has(variant.id))) {
    return { ok: false, error: "A variant doesn't belong to this product." };
  }

  const statements: BatchStatement[] = [
    db
      .update(products)
      .set({ ...productValues(data), updatedAt: now() })
      .where(eq(products.id, productId)),
    db
      .update(inventory)
      .set({ sku: data.sku, updatedAt: now() })
      .where(and(eq(inventory.productId, productId), isNull(inventory.variantId))),
  ];

  data.variants.forEach((variant, index) => {
    if (variant.id) {
      statements.push(
        db
          .update(productVariants)
          .set({ name: variant.name, sku: variant.sku, price: variant.price, sortOrder: index, updatedAt: now() })
          .where(eq(productVariants.id, variant.id)),
        db
          .update(inventory)
          .set({ sku: variant.sku, updatedAt: now() })
          .where(eq(inventory.variantId, variant.id)),
      );
      return;
    }
    const variantId = newId();
    statements.push(
      db.insert(productVariants).values({
        id: variantId,
        productId,
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        sortOrder: index,
      }),
      db.insert(inventory).values({ id: newId(), productId, variantId, sku: variant.sku }),
    );
  });

  try {
    await runBatch(db, statements);
  } catch (error) {
    return uniqueConflict(error, "product or variant");
  }
  return { ok: true, id: productId };
}

type StatusTable = "products" | "kits" | "robot_projects";

/**
 * Draft / published / archived for products, kits and projects
 * (tasks/phase-19-admin-catalog/120). Archiving replaces hard delete:
 * order lines, kits and project BOMs keep pointing at the row, while every
 * storefront query only ever reads PUBLISHED rows.
 */
export async function setCatalogStatus(
  db: Database,
  table: StatusTable,
  id: string,
  status: ProductStatus,
): Promise<CatalogWriteResult> {
  const target = table === "products" ? products : table === "kits" ? kits : robotProjects;
  const updated = await db
    .update(target)
    .set({ status, updatedAt: now() })
    .where(eq(target.id, id))
    .returning({ id: target.id });
  return updated[0] ? { ok: true, id } : { ok: false, error: "Not found." };
}

// -------------------------------------------------------------- categories

export async function createCategory(
  db: Database,
  data: CategoryData,
): Promise<CatalogWriteResult> {
  const id = newId();
  try {
    await db.insert(categories).values({
      id,
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description,
      sortOrder: data.sortOrder,
    });
  } catch (error) {
    return uniqueConflict(error, "category");
  }
  return { ok: true, id };
}

export async function updateCategory(
  db: Database,
  id: string,
  data: CategoryData,
): Promise<CatalogWriteResult> {
  try {
    const updated = await db
      .update(categories)
      .set({
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description,
        sortOrder: data.sortOrder,
        updatedAt: now(),
      })
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    if (!updated[0]) {
      return { ok: false, error: "Category not found." };
    }
  } catch (error) {
    return uniqueConflict(error, "category");
  }
  return { ok: true, id };
}

/** Refuses while any product (of any status) still uses the category. */
export async function deleteCategory(db: Database, id: string): Promise<CatalogWriteResult> {
  const [usage] = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.categoryId, id));
  const inUse = usage?.value ?? 0;
  if (inUse > 0) {
    return {
      ok: false,
      error: `${inUse} product${inUse === 1 ? "" : "s"} still use this category. Move them to another category first.`,
    };
  }
  const deleted = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning({ id: categories.id });
  return deleted[0] ? { ok: true, id } : { ok: false, error: "Category not found." };
}

// ------------------------------------------------------- kits and projects

/** Every BOM line must point at a real product (AGENTS.md "Robot Builder must use actual products"). */
async function findMissingProducts(
  db: Database,
  productIds: string[],
): Promise<string[]> {
  const rows = await db
    .select({ id: products.id })
    .from(products)
    .where(inArray(products.id, productIds));
  const found = new Set(rows.map((row) => row.id));
  return productIds.filter((id) => !found.has(id));
}

function kitValues(data: KitData) {
  return {
    name: data.name,
    slug: data.slug || slugify(data.name),
    shortDescription: data.shortDescription,
    description: data.description,
    price: data.price,
    compareAtPrice: data.compareAtPrice,
    status: data.status,
    featured: data.featured,
    projectId: data.projectId,
    imageUrl: data.imageUrl,
    imageAlt: data.imageAlt,
  };
}

/** Creates (kitId null) or replaces a kit and its whole BOM in one atomic batch. */
export async function saveKit(
  db: Database,
  kitId: string | null,
  data: KitData,
): Promise<CatalogWriteResult> {
  const missing = await findMissingProducts(
    db,
    data.components.map((line) => line.productId),
  );
  if (missing.length > 0) {
    return { ok: false, error: "A component product no longer exists. Remove it and try again." };
  }
  if (data.projectId) {
    const project = await db
      .select({ id: robotProjects.id })
      .from(robotProjects)
      .where(eq(robotProjects.id, data.projectId))
      .limit(1);
    if (project.length === 0) {
      return { ok: false, error: "The linked project no longer exists." };
    }
  }

  const id = kitId ?? newId();
  if (kitId) {
    const existing = await db.select({ id: kits.id }).from(kits).where(eq(kits.id, kitId)).limit(1);
    if (existing.length === 0) {
      return { ok: false, error: "Kit not found." };
    }
  }

  const statements: BatchStatement[] = kitId
    ? [
        db.update(kits).set({ ...kitValues(data), updatedAt: now() }).where(eq(kits.id, id)),
        db.delete(kitComponents).where(eq(kitComponents.kitId, id)),
      ]
    : [db.insert(kits).values({ id, ...kitValues(data) })];

  statements.push(
    db.insert(kitComponents).values(
      data.components.map((line) => ({
        id: newId(),
        kitId: id,
        productId: line.productId,
        variantId: null,
        quantity: line.quantity,
      })),
    ),
  );

  try {
    await runBatch(db, statements);
  } catch (error) {
    return uniqueConflict(error, "kit");
  }
  return { ok: true, id };
}

function projectValues(data: ProjectData) {
  return {
    name: data.name,
    slug: data.slug || slugify(data.name),
    shortDescription: data.shortDescription,
    description: data.description,
    skillLevel: data.skillLevel,
    status: data.status,
    featured: data.featured,
    imageUrl: data.imageUrl,
    imageAlt: data.imageAlt,
  };
}

/** Creates (projectId null) or replaces a robot project and its components in one atomic batch. */
export async function saveProject(
  db: Database,
  projectId: string | null,
  data: ProjectData,
): Promise<CatalogWriteResult> {
  const missing = await findMissingProducts(
    db,
    data.components.map((line) => line.productId),
  );
  if (missing.length > 0) {
    return { ok: false, error: "A component product no longer exists. Remove it and try again." };
  }

  const id = projectId ?? newId();
  if (projectId) {
    const existing = await db
      .select({ id: robotProjects.id })
      .from(robotProjects)
      .where(eq(robotProjects.id, projectId))
      .limit(1);
    if (existing.length === 0) {
      return { ok: false, error: "Project not found." };
    }
  }

  const statements: BatchStatement[] = projectId
    ? [
        db
          .update(robotProjects)
          .set({ ...projectValues(data), updatedAt: now() })
          .where(eq(robotProjects.id, id)),
        db.delete(projectComponents).where(eq(projectComponents.projectId, id)),
      ]
    : [db.insert(robotProjects).values({ id, ...projectValues(data) })];

  statements.push(
    db.insert(projectComponents).values(
      data.components.map((line) => ({
        id: newId(),
        projectId: id,
        productId: line.productId,
        variantId: null,
        quantity: line.quantity,
        optional: line.optional,
      })),
    ),
  );

  try {
    await runBatch(db, statements);
  } catch (error) {
    return uniqueConflict(error, "project");
  }
  return { ok: true, id };
}

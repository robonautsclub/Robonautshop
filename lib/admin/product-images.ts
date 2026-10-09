import { asc, eq, max } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { runBatch } from "@/lib/db/batch";
import { productImages } from "@/lib/db/schema/product-images";
import { products } from "@/lib/db/schema/products";

/**
 * product_images metadata (tasks/phase-19-admin-catalog/123). Bytes live in
 * R2; D1 only stores the URL/key, alt text and order (AGENTS.md §36).
 * Callers check the admin role first.
 */

export async function productExists(db: Database, productId: string): Promise<boolean> {
  const rows = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
  return rows.length > 0;
}

export async function addProductImage(
  db: Database,
  input: { productId: string; url: string; alt: string },
) {
  const [last] = await db
    .select({ value: max(productImages.sortOrder) })
    .from(productImages)
    .where(eq(productImages.productId, input.productId));
  const image = {
    id: crypto.randomUUID(),
    productId: input.productId,
    url: input.url,
    alt: input.alt,
    sortOrder: (last?.value ?? -1) + 1,
  };
  await db.insert(productImages).values(image);
  return image;
}

export async function updateProductImageAlt(db: Database, imageId: string, alt: string): Promise<boolean> {
  const updated = await db
    .update(productImages)
    .set({ alt })
    .where(eq(productImages.id, imageId))
    .returning({ id: productImages.id });
  return updated.length > 0;
}

/** Swaps the image with its neighbour; the first image is the product's main image. */
export async function moveProductImage(
  db: Database,
  imageId: string,
  direction: "up" | "down",
): Promise<boolean> {
  const [image] = await db.select().from(productImages).where(eq(productImages.id, imageId)).limit(1);
  if (!image) return false;
  const siblings = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, image.productId))
    .orderBy(asc(productImages.sortOrder), asc(productImages.createdAt));
  const index = siblings.findIndex((row) => row.id === imageId);
  const target = siblings[direction === "up" ? index - 1 : index + 1];
  if (!target) return true;

  // Re-number everything so duplicate sort orders from seed data can't stick.
  const reordered = [...siblings];
  reordered[index] = target;
  reordered[siblings.indexOf(target)] = image;
  await runBatch(
    db,
    reordered.map((row, position) =>
      db.update(productImages).set({ sortOrder: position }).where(eq(productImages.id, row.id)),
    ),
  );
  return true;
}

/** Deletes the row and returns its URL so the caller can remove the R2 object. */
export async function deleteProductImage(db: Database, imageId: string): Promise<string | null> {
  const deleted = await db
    .delete(productImages)
    .where(eq(productImages.id, imageId))
    .returning({ url: productImages.url });
  return deleted[0]?.url ?? null;
}

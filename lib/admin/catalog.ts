/**
 * Admin-facing catalog reads from D1.
 * Unlike storefront helpers (lib/catalog/queries.ts), these include DRAFT
 * and ARCHIVED rows — admins manage the whole catalog, not just what's live.
 */

import { inArray } from "drizzle-orm";

import { getAvailableQuantity, type Category, type Kit, type Product, type RobotProject } from "@/lib/catalog/types";
import type { Database } from "@/lib/db";
import { categories } from "@/lib/db/schema/categories";
import { inventory } from "@/lib/db/schema/inventory";
import { kits } from "@/lib/db/schema/kits";
import { productImages } from "@/lib/db/schema/product-images";
import { products } from "@/lib/db/schema/products";
import { robotProjects } from "@/lib/db/schema/robot-projects";

export async function listAdminProducts(db: Database): Promise<Product[]> {
  const rows = await db.select().from(products);
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listAdminCategories(db: Database): Promise<Category[]> {
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function getAdminCategoryName(
  db: Database,
  categoryId: string,
): Promise<string> {
  const all = await listAdminCategories(db);
  return all.find((category) => category.id === categoryId)?.name ?? "Unknown";
}

export type AdminInventoryRow = {
  productId: string;
  variantId: string | null;
  sku: string;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  productName: string;
  availableQuantity: number;
};

export async function listAdminInventory(
  db: Database,
): Promise<AdminInventoryRow[]> {
  const [inventoryRows, productRows] = await Promise.all([
    db.select().from(inventory),
    db.select().from(products),
  ]);
  const productNameById = new Map(
    productRows.map((product) => [product.id, product.name]),
  );

  return inventoryRows
    .map((row) => ({
      productId: row.productId,
      variantId: row.variantId,
      sku: row.sku,
      stockQuantity: row.stockQuantity,
      reservedQuantity: row.reservedQuantity,
      lowStockThreshold: row.lowStockThreshold,
      productName: productNameById.get(row.productId) ?? "Unknown product",
      availableQuantity: getAvailableQuantity(row),
    }))
    .sort((a, b) => a.productName.localeCompare(b.productName));
}

export async function listAdminKits(db: Database): Promise<Kit[]> {
  const rows = await db.select().from(kits);
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listAdminProjects(db: Database): Promise<RobotProject[]> {
  const rows = await db.select().from(robotProjects);
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Product list shaped for the admin "add a stock product to this BOM"
 * picker (AdminBomEditor) — includes each product's primary image so the
 * client component doesn't need to fetch it itself. One batched images
 * query, not one per product (AGENTS.md "Avoid N+1 query patterns").
 */
export type AdminProductOption = {
  id: string;
  name: string;
  sku: string;
  price: number;
  imageUrl: string | null;
  imageAlt: string;
};

export async function listAdminProductOptions(
  db: Database,
): Promise<AdminProductOption[]> {
  const productRows = await listAdminProducts(db);
  if (productRows.length === 0) {
    return [];
  }

  const ids = productRows.map((product) => product.id);
  const images = await db
    .select()
    .from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(productImages.sortOrder);

  const primaryImageByProduct = new Map<string, { url: string; alt: string }>();
  for (const image of images) {
    if (!primaryImageByProduct.has(image.productId)) {
      primaryImageByProduct.set(image.productId, { url: image.url, alt: image.alt });
    }
  }

  return productRows.map((product) => {
    const image = primaryImageByProduct.get(product.id) ?? null;
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? product.name,
    };
  });
}

export async function getAdminDashboardStats(db: Database) {
  const [productRows, inventoryRows, categoryRows, kitRows, projectRows] =
    await Promise.all([
      listAdminProducts(db),
      listAdminInventory(db),
      listAdminCategories(db),
      listAdminKits(db),
      listAdminProjects(db),
    ]);

  const lowStock = inventoryRows.filter(
    (row) => row.availableQuantity <= row.lowStockThreshold,
  ).length;

  return {
    productCount: productRows.length,
    publishedProductCount: productRows.filter((p) => p.status === "PUBLISHED")
      .length,
    categoryCount: categoryRows.length,
    kitCount: kitRows.length,
    projectCount: projectRows.length,
    inventorySkuCount: inventoryRows.length,
    lowStockCount: lowStock,
  };
}

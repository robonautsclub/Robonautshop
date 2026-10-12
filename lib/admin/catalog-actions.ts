"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  categoryInputSchema,
  kitInputSchema,
  lowStockThresholdInputSchema,
  productInputSchema,
  productStatusInputSchema,
  projectInputSchema,
  stockAdjustmentInputSchema,
} from "@/lib/admin/catalog-schemas";
import {
  createCategory,
  createProduct,
  deleteCategory,
  saveKit,
  saveProject,
  setCatalogStatus,
  updateCategory,
  updateProduct,
  type CatalogWriteResult,
} from "@/lib/admin/catalog-mutations";
import {
  deleteProductImage,
  moveProductImage,
  updateProductImageAlt,
} from "@/lib/admin/product-images";
import { recordAudit } from "@/lib/audit/log";
import { catalogStatusSnapshot, productSnapshot } from "@/lib/audit/snapshots";
import { requirePermission } from "@/lib/auth/session";
import type { ProductStatus } from "@/lib/catalog/types";
import { getRequestDb } from "@/lib/db/request";
import {
  adjustStock,
  listStockMovements,
  setLowStockThreshold,
  type StockAdjustmentResult,
  type StockMovementRow,
} from "@/lib/inventory/adjustments";
import { keyFromMediaUrl } from "@/lib/media/images";
import { getProductImagesBucket } from "@/lib/media/r2";

/**
 * Admin catalog server actions (tasks/phase-19-admin-catalog/119–125).
 * Every action calls requirePermission("catalog.manage") first — it redirects signed-out
 * users and 403s non-admins — and re-validates input with Zod; nothing
 * from the browser is trusted, so inputs are typed `unknown` on purpose.
 */

type SimpleResult = { ok: true } | { ok: false; error: string };

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form.";
}

/** Catalog changes show up across the storefront (lists, detail pages, sitemap). */
function revalidateCatalog(adminPath: string) {
  revalidatePath(adminPath);
  revalidatePath("/", "layout");
}

export async function saveProductAction(
  productId: string | null,
  input: unknown,
): Promise<CatalogWriteResult> {
  const session = await requirePermission("catalog.manage");
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const db = await getRequestDb();
  const before = productId ? await productSnapshot(db, productId) : null;
  const result = productId
    ? await updateProduct(db, productId, parsed.data)
    : await createProduct(db, parsed.data);
  if (result.ok) {
    revalidateCatalog("/admin/products");
    await recordAudit(db, {
      actor: session.user,
      action: productId ? "product.update" : "product.create",
      entityType: "product",
      entityId: result.id,
      before,
      after: await productSnapshot(db, result.id),
    });
  }
  return result;
}

async function setStatus(
  table: "products" | "kits" | "robot_projects",
  adminPath: string,
  id: string,
  status: ProductStatus,
): Promise<CatalogWriteResult> {
  const session = await requirePermission("catalog.manage");
  const parsed = productStatusInputSchema.safeParse({ productId: id, status });
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const db = await getRequestDb();
  const before = await catalogStatusSnapshot(db, table, parsed.data.productId);
  const result = await setCatalogStatus(db, table, parsed.data.productId, parsed.data.status);
  if (result.ok) {
    revalidateCatalog(adminPath);
    await recordAudit(db, {
      actor: session.user,
      action: `${table === "robot_projects" ? "project" : table.slice(0, -1)}.status`,
      entityType: table === "robot_projects" ? "project" : table.slice(0, -1),
      entityId: parsed.data.productId,
      before,
      after: { status: parsed.data.status },
    });
  }
  return result;
}

export async function setProductStatusAction(id: string, status: ProductStatus) {
  return setStatus("products", "/admin/products", id, status);
}

export async function setKitStatusAction(id: string, status: ProductStatus) {
  return setStatus("kits", "/admin/kits", id, status);
}

export async function setProjectStatusAction(id: string, status: ProductStatus) {
  return setStatus("robot_projects", "/admin/projects", id, status);
}

export async function saveCategoryAction(
  categoryId: string | null,
  input: unknown,
): Promise<CatalogWriteResult> {
  const session = await requirePermission("catalog.manage");
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const db = await getRequestDb();
  const result = categoryId
    ? await updateCategory(db, categoryId, parsed.data)
    : await createCategory(db, parsed.data);
  if (result.ok) {
    revalidateCatalog("/admin/categories");
    await recordAudit(db, {
      actor: session.user,
      action: categoryId ? "category.update" : "category.create",
      entityType: "category",
      entityId: result.id,
      after: { name: parsed.data.name, parentId: parsed.data.parentId },
    });
  }
  return result;
}

export async function deleteCategoryAction(categoryId: string): Promise<CatalogWriteResult> {
  const session = await requirePermission("catalog.manage");
  const db = await getRequestDb();
  const result = await deleteCategory(db, categoryId);
  if (result.ok) {
    revalidateCatalog("/admin/categories");
    await recordAudit(db, { actor: session.user, action: "category.delete", entityType: "category", entityId: categoryId });
  }
  return result;
}

export async function saveKitAction(
  kitId: string | null,
  input: unknown,
): Promise<CatalogWriteResult> {
  const session = await requirePermission("catalog.manage");
  const parsed = kitInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const db = await getRequestDb();
  const result = await saveKit(db, kitId, parsed.data);
  if (result.ok) {
    revalidateCatalog("/admin/kits");
    await recordAudit(db, {
      actor: session.user,
      action: kitId ? "kit.update" : "kit.create",
      entityType: "kit",
      entityId: result.id,
      after: { name: parsed.data.name },
    });
  }
  return result;
}

export async function saveProjectAction(
  projectId: string | null,
  input: unknown,
): Promise<CatalogWriteResult> {
  const session = await requirePermission("catalog.manage");
  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const db = await getRequestDb();
  const result = await saveProject(db, projectId, parsed.data);
  if (result.ok) {
    revalidateCatalog("/admin/projects");
    await recordAudit(db, {
      actor: session.user,
      action: projectId ? "project.update" : "project.create",
      entityType: "project",
      entityId: result.id,
      after: { name: parsed.data.name },
    });
  }
  return result;
}

export async function adjustStockAction(
  input: unknown,
): Promise<StockAdjustmentResult> {
  const session = await requirePermission("inventory.manage");
  const parsed = stockAdjustmentInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const db = await getRequestDb();
  const result = await adjustStock(db, { ...parsed.data, actorUserId: session.user.id });
  if (result.ok) {
    revalidateCatalog("/admin/inventory");
    await recordAudit(db, {
      actor: session.user,
      action: "stock.adjust",
      entityType: "inventory",
      entityId: parsed.data.inventoryId,
      before: { stock: result.stockAfter - parsed.data.delta },
      after: { stock: result.stockAfter, reason: parsed.data.reason },
    });
  }
  return result;
}

export async function setLowStockThresholdAction(
  inventoryId: string,
  lowStockThreshold: number,
): Promise<SimpleResult> {
  await requirePermission("inventory.manage");
  const parsed = lowStockThresholdInputSchema.safeParse({ inventoryId, lowStockThreshold });
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const db = await getRequestDb();
  const result = await setLowStockThreshold(db, parsed.data.inventoryId, parsed.data.lowStockThreshold);
  if (result.ok) revalidatePath("/admin/inventory");
  return result;
}

export async function listStockMovementsAction(inventoryId: string): Promise<StockMovementRow[]> {
  await requirePermission("inventory.manage");
  const db = await getRequestDb();
  return listStockMovements(db, inventoryId);
}

// ------------------------------------------------------------- product images

const imageAltSchema = z.object({
  imageId: z.string().trim().min(1),
  alt: z.string().trim().min(1, "Add alt text.").max(200),
});

export async function updateProductImageAltAction(imageId: string, alt: string): Promise<SimpleResult> {
  await requirePermission("catalog.manage");
  const parsed = imageAltSchema.safeParse({ imageId, alt });
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error) };
  }
  const db = await getRequestDb();
  const updated = await updateProductImageAlt(db, parsed.data.imageId, parsed.data.alt);
  if (!updated) return { ok: false, error: "Image not found." };
  revalidateCatalog("/admin/products");
  return { ok: true };
}

export async function moveProductImageAction(
  imageId: string,
  direction: "up" | "down",
): Promise<SimpleResult> {
  await requirePermission("catalog.manage");
  if (direction !== "up" && direction !== "down") {
    return { ok: false, error: "Invalid direction." };
  }
  const db = await getRequestDb();
  const moved = await moveProductImage(db, imageId, direction);
  if (!moved) return { ok: false, error: "Image not found." };
  revalidateCatalog("/admin/products");
  return { ok: true };
}

/** Removes the row, then the R2 object when the image was uploaded here (seed URLs live elsewhere). */
export async function deleteProductImageAction(imageId: string): Promise<SimpleResult> {
  await requirePermission("catalog.manage");
  const db = await getRequestDb();
  const url = await deleteProductImage(db, imageId);
  if (url === null) return { ok: false, error: "Image not found." };
  const key = keyFromMediaUrl(url);
  if (key) {
    const bucket = await getProductImagesBucket();
    await bucket.delete(key);
  }
  revalidateCatalog("/admin/products");
  return { ok: true };
}

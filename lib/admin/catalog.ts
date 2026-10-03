/**
 * Admin-facing catalog reads over the mock fixture.
 * Unlike storefront helpers, these include DRAFT and ARCHIVED rows.
 */

import {
  mockCategories,
  mockInventory,
  mockKits,
  mockProducts,
  mockProjects,
} from "@/lib/catalog/mock-data";
import {
  getAvailableQuantity,
  type Category,
  type InventorySummary,
  type Kit,
  type Product,
  type RobotProject,
} from "@/lib/catalog/types";

export function listAdminProducts(): Product[] {
  return [...mockProducts].sort((a, b) => a.name.localeCompare(b.name));
}

export function listAdminCategories(): Category[] {
  return [...mockCategories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getAdminCategoryName(categoryId: string): string {
  return (
    mockCategories.find((category) => category.id === categoryId)?.name ??
    "Unknown"
  );
}

export type AdminInventoryRow = InventorySummary & {
  productName: string;
  availableQuantity: number;
};

export function listAdminInventory(): AdminInventoryRow[] {
  const productNameById = new Map(
    mockProducts.map((product) => [product.id, product.name]),
  );

  return [...mockInventory]
    .map((row) => ({
      ...row,
      productName: productNameById.get(row.productId) ?? "Unknown product",
      availableQuantity: getAvailableQuantity(row),
    }))
    .sort((a, b) => a.productName.localeCompare(b.productName));
}

export function listAdminKits(): Kit[] {
  return [...mockKits].sort((a, b) => a.name.localeCompare(b.name));
}

export function listAdminProjects(): RobotProject[] {
  return [...mockProjects].sort((a, b) => a.name.localeCompare(b.name));
}

export function getAdminDashboardStats() {
  const products = listAdminProducts();
  const inventory = listAdminInventory();
  const lowStock = inventory.filter(
    (row) => row.availableQuantity <= row.lowStockThreshold,
  ).length;

  return {
    productCount: products.length,
    publishedProductCount: products.filter((p) => p.status === "PUBLISHED")
      .length,
    categoryCount: listAdminCategories().length,
    kitCount: listAdminKits().length,
    projectCount: listAdminProjects().length,
    inventorySkuCount: inventory.length,
    lowStockCount: lowStock,
  };
}

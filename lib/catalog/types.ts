/**
 * Shared catalog domain types.
 *
 * These mirror the intended future D1/Drizzle shape so the UI can swap
 * mock helpers for database queries without rewriting pages.
 *
 * Pricing: all money fields are integer BDT taka (৳), whole numbers only.
 * Example: 450 means ৳450. Do not store fractional taka.
 */

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ProjectSkillLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "COMPETITION";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  brand: string | null;
  categoryId: string;
  /** Integer BDT taka (৳). */
  price: number;
  /** Integer BDT taka (৳), or null when there is no compare-at price. */
  compareAtPrice: number | null;
  weightGrams: number | null;
  status: ProductStatus;
  featured: boolean;
  /** Flexible technical specs; not separate DB columns. */
  specifications: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  /** Integer BDT taka (৳), or null to inherit the parent product price. */
  price: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  /** Image URL or future R2 object key/URL. */
  url: string;
  alt: string;
  sortOrder: number;
}

export interface InventorySummary {
  productId: string;
  /** Null when stock is tracked at the product (non-variant) level. */
  variantId: string | null;
  sku: string;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
}

export interface Kit {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  /** Integer BDT taka (৳) for the kit as sold. */
  price: number;
  compareAtPrice: number | null;
  status: ProductStatus;
  /** Optional link to a robot project this kit builds. */
  projectId: string | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KitComponent {
  id: string;
  kitId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
}

export interface RobotProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  skillLevel: ProjectSkillLevel;
  status: ProductStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectComponent {
  id: string;
  projectId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  optional: boolean;
}

/** Available stock = stockQuantity - reservedQuantity (never trust the client). */
export function getAvailableQuantity(inventory: InventorySummary): number {
  return Math.max(0, inventory.stockQuantity - inventory.reservedQuantity);
}

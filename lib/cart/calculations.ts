import {
  mockImages,
  mockInventory,
  mockProducts,
  mockVariants,
} from "@/lib/catalog/mock-data";
import { getAvailableQuantity, type Product, type ProductVariant } from "@/lib/catalog/types";
import type { CartLineInput } from "@/lib/cart/types";

/**
 * This module intentionally does NOT use `@/lib/catalog` (D1-backed as of
 * tasks/phase-12-wire-up/75-replace-mock-catalog.md). The client-side cart
 * (components/cart/cart-provider.tsx) needs synchronous pricing for instant
 * UI feedback, which a real D1 query can't give it from the browser.
 *
 * Moving cart pricing onto real server-authoritative data is exactly what
 * tasks/phase-12-wire-up/78-real-cart-orders.md does. Until then, this stays
 * on the mock catalog snapshot — one isolated, clearly-labeled exception
 * rather than silently drifting from the real catalog's prices/stock.
 */
function findProductById(id: string): Product | null {
  return mockProducts.find((item) => item.id === id) ?? null;
}

function findInventoryForProduct(productId: string) {
  return mockInventory.filter((row) => row.productId === productId);
}

function findImagesForProduct(productId: string) {
  return mockImages
    .filter((image) => image.productId === productId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export type ResolvedCartLine = {
  key: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  product: Product;
  variant: ProductVariant | null;
  name: string;
  sku: string;
  imageUrl: string | null;
  imageAlt: string;
  unitPrice: number;
  lineTotal: number;
  availableQuantity: number;
  lowStockThreshold: number;
};

export function cartLineKey(
  productId: string,
  variantId: string | null,
): string {
  return `${productId}::${variantId ?? "base"}`;
}

export function resolveCartLine(
  line: CartLineInput,
): ResolvedCartLine | null {
  const product = findProductById(line.productId);

  if (!product) {
    return null;
  }

  const variant = line.variantId
    ? (mockVariants.find(
        (item) => item.id === line.variantId && item.productId === product.id,
      ) ?? null)
    : null;

  if (line.variantId && !variant) {
    return null;
  }

  const inventoryRows = findInventoryForProduct(product.id);
  const inventoryRow = variant
    ? (inventoryRows.find((row) => row.variantId === variant.id) ?? null)
    : (inventoryRows.find((row) => row.variantId === null) ??
      inventoryRows[0] ??
      null);

  const availableQuantity = inventoryRow
    ? getAvailableQuantity(inventoryRow)
    : inventoryRows.reduce((sum, row) => sum + getAvailableQuantity(row), 0);

  const unitPrice = variant?.price ?? product.price;
  const quantity = Math.max(0, line.quantity);
  const images = findImagesForProduct(product.id);
  const primaryImage = images[0];

  return {
    key: cartLineKey(product.id, variant?.id ?? null),
    productId: product.id,
    variantId: variant?.id ?? null,
    quantity,
    product,
    variant,
    name: variant ? `${product.name} · ${variant.name}` : product.name,
    sku: variant?.sku ?? product.sku,
    imageUrl: primaryImage?.url ?? null,
    imageAlt: primaryImage?.alt ?? product.name,
    unitPrice,
    lineTotal: unitPrice * quantity,
    availableQuantity,
    lowStockThreshold: inventoryRow?.lowStockThreshold ?? 5,
  };
}

export function resolveCartLines(lines: CartLineInput[]): ResolvedCartLine[] {
  return lines
    .map(resolveCartLine)
    .filter((line): line is ResolvedCartLine => line !== null && line.quantity > 0);
}

/**
 * The one guest → signed-in-user cart merge rule (AGENTS.md "Business logic
 * should not be duplicated"): same product + variant sums quantities,
 * otherwise the line is added as-is. Order of `userLines` first, then any
 * guest-only lines appended, matches "merge guest into user" rather than
 * the reverse.
 *
 * Pure and storage-agnostic on purpose — tasks/phase-12-wire-up/78b uses it
 * against localStorage buckets (lib/cart/cart-identity.ts); task 78's real
 * server cart reuses this same function against D1 rows instead of
 * reimplementing the merge.
 */
export function mergeCartLines(
  userLines: CartLineInput[],
  guestLines: CartLineInput[],
): CartLineInput[] {
  const merged = [...userLines];

  for (const guestLine of guestLines) {
    const key = cartLineKey(guestLine.productId, guestLine.variantId);
    const index = merged.findIndex(
      (line) => cartLineKey(line.productId, line.variantId) === key,
    );

    if (index === -1) {
      merged.push(guestLine);
      continue;
    }

    merged[index] = {
      ...merged[index],
      quantity: merged[index].quantity + guestLine.quantity,
    };
  }

  return merged;
}

/** Authoritative cart money math — use this instead of recalculating in UI. */
export function calculateCartSubtotal(lines: ResolvedCartLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}

export function calculateCartItemCount(lines: CartLineInput[]): number {
  return lines.reduce((sum, line) => sum + Math.max(0, line.quantity), 0);
}

export function clampQuantityToStock(
  quantity: number,
  availableQuantity: number,
): number {
  if (quantity < 1) {
    return 0;
  }

  if (availableQuantity <= 0) {
    return 0;
  }

  return Math.min(quantity, availableQuantity);
}

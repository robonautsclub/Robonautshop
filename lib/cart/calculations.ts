import {
  getAvailableQuantity,
  getImagesForProduct,
  getInventoryForProduct,
  getProductById,
  type Product,
  type ProductVariant,
} from "@/lib/catalog";
import type { CartLineInput } from "@/lib/cart/types";

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
  const product = getProductById(line.productId);

  if (!product) {
    return null;
  }

  const variant = line.variantId
    ? (product.variants.find((item) => item.id === line.variantId) ?? null)
    : null;

  if (line.variantId && !variant) {
    return null;
  }

  const inventoryRows = getInventoryForProduct(product.id);
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
  const images = getImagesForProduct(product.id);
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

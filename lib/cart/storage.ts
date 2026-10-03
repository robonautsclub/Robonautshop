import {
  CART_STORAGE_KEY,
  type CartLineInput,
  type StoredCart,
} from "@/lib/cart/types";

function isCartLineInput(value: unknown): value is CartLineInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const line = value as Record<string, unknown>;
  return (
    typeof line.productId === "string" &&
    (line.variantId === null || typeof line.variantId === "string") &&
    typeof line.quantity === "number" &&
    Number.isFinite(line.quantity)
  );
}

export function readStoredCart(): CartLineInput[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as StoredCart;
    if (parsed?.version !== 1 || !Array.isArray(parsed.lines)) {
      return [];
    }

    return parsed.lines.filter(isCartLineInput).map((line) => ({
      productId: line.productId,
      variantId: line.variantId,
      quantity: Math.max(0, Math.floor(line.quantity)),
    }));
  } catch {
    return [];
  }
}

export function writeStoredCart(lines: CartLineInput[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredCart = {
    version: 1,
    lines: lines.map((line) => ({
      productId: line.productId,
      variantId: line.variantId,
      quantity: Math.max(0, Math.floor(line.quantity)),
    })),
  };

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
}

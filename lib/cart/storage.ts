import type { CartLineInput, StoredCart } from "@/lib/cart/types";

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

/**
 * `storageKey` picks which cart bucket to read/write — see
 * lib/cart/cart-identity.ts for the guest vs. per-user keys
 * (tasks/phase-12-wire-up/78b-checkout-login-cart-merge.md).
 */
export function readStoredCart(storageKey: string): CartLineInput[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
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

export function writeStoredCart(lines: CartLineInput[], storageKey: string): void {
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

  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  calculateCartItemCount,
  calculateCartSubtotal,
  cartLineKey,
  clampQuantityToStock,
  resolveCartLine,
  resolveCartLines,
  type ResolvedCartLine,
} from "@/lib/cart/calculations";
import { readStoredCart, writeStoredCart } from "@/lib/cart/storage";
import type { CartLineInput } from "@/lib/cart/types";

type CartContextValue = {
  hydrated: boolean;
  lines: CartLineInput[];
  resolvedLines: ResolvedCartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (input: {
    productId: string;
    variantId?: string | null;
    quantity?: number;
  }) => boolean;
  addItems: (
    inputs: Array<{
      productId: string;
      variantId?: string | null;
      quantity?: number;
    }>,
  ) => number;
  removeItem: (productId: string, variantId?: string | null) => void;
  setQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number,
  ) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function mergeLine(
  lines: CartLineInput[],
  productId: string,
  variantId: string | null,
  quantityToAdd: number,
): CartLineInput[] | null {
  const resolved = resolveCartLine({
    productId,
    variantId,
    quantity: 1,
  });

  if (!resolved || resolved.availableQuantity <= 0) {
    return null;
  }

  const key = cartLineKey(productId, variantId);
  const existing = lines.find(
    (line) => cartLineKey(line.productId, line.variantId) === key,
  );
  const nextQuantity = clampQuantityToStock(
    (existing?.quantity ?? 0) + quantityToAdd,
    resolved.availableQuantity,
  );

  if (nextQuantity < 1) {
    return null;
  }

  if (!existing) {
    return [...lines, { productId, variantId, quantity: nextQuantity }];
  }

  return lines.map((line) =>
    cartLineKey(line.productId, line.variantId) === key
      ? { ...line, quantity: nextQuantity }
      : line,
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLineInput[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = readStoredCart();
      const cleaned = resolveCartLines(stored)
        .map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          quantity: clampQuantityToStock(
            line.quantity,
            line.availableQuantity,
          ),
        }))
        .filter((line) => line.quantity > 0);

      setLines(cleaned);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writeStoredCart(lines);
  }, [hydrated, lines]);

  const resolvedLines = useMemo(() => resolveCartLines(lines), [lines]);
  const itemCount = useMemo(() => calculateCartItemCount(lines), [lines]);
  const subtotal = useMemo(
    () => calculateCartSubtotal(resolvedLines),
    [resolvedLines],
  );

  const addItem = useCallback(
    (input: {
      productId: string;
      variantId?: string | null;
      quantity?: number;
    }) => {
      const quantity = Math.max(1, Math.floor(input.quantity ?? 1));
      let added = false;

      setLines((current) => {
        const next = mergeLine(
          current,
          input.productId,
          input.variantId ?? null,
          quantity,
        );

        if (!next) {
          return current;
        }

        added = true;
        return next;
      });

      return added;
    },
    [],
  );

  const addItems = useCallback(
    (
      inputs: Array<{
        productId: string;
        variantId?: string | null;
        quantity?: number;
      }>,
    ) => {
      let addedCount = 0;

      setLines((current) => {
        let next = current;

        for (const input of inputs) {
          const quantity = Math.max(1, Math.floor(input.quantity ?? 1));
          const merged = mergeLine(
            next,
            input.productId,
            input.variantId ?? null,
            quantity,
          );

          if (merged) {
            next = merged;
            addedCount += 1;
          }
        }

        return next;
      });

      return addedCount;
    },
    [],
  );

  const removeItem = useCallback(
    (productId: string, variantId: string | null = null) => {
      const key = cartLineKey(productId, variantId);
      setLines((current) =>
        current.filter(
          (line) => cartLineKey(line.productId, line.variantId) !== key,
        ),
      );
    },
    [],
  );

  const setQuantity = useCallback(
    (productId: string, variantId: string | null, quantity: number) => {
      const key = cartLineKey(productId, variantId);
      const resolved = resolveCartLine({ productId, variantId, quantity: 1 });

      if (!resolved) {
        setLines((current) =>
          current.filter(
            (line) => cartLineKey(line.productId, line.variantId) !== key,
          ),
        );
        return;
      }

      const nextQuantity = clampQuantityToStock(
        Math.floor(quantity),
        resolved.availableQuantity,
      );

      if (nextQuantity < 1) {
        setLines((current) =>
          current.filter(
            (line) => cartLineKey(line.productId, line.variantId) !== key,
          ),
        );
        return;
      }

      setLines((current) =>
        current.map((line) =>
          cartLineKey(line.productId, line.variantId) === key
            ? { ...line, quantity: nextQuantity }
            : line,
        ),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      hydrated,
      lines,
      resolvedLines,
      itemCount,
      subtotal,
      addItem,
      addItems,
      removeItem,
      setQuantity,
      clearCart,
    }),
    [
      hydrated,
      lines,
      resolvedLines,
      itemCount,
      subtotal,
      addItem,
      addItems,
      removeItem,
      setQuantity,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

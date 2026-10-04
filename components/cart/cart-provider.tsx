"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  calculateCartItemCount,
  calculateCartSubtotal,
  cartLineKey,
  clampQuantityToStock,
  resolveCartLine,
  resolveCartLines,
  type ResolvedCartLine,
} from "@/lib/cart/calculations";
import {
  type CartIdentity,
  GUEST_CART_STORAGE_KEY,
  resolveCartIdentity,
} from "@/lib/cart/cart-identity";
import { readStoredCart, writeStoredCart } from "@/lib/cart/storage";
import type { CartLineInput } from "@/lib/cart/types";
import {
  getMyCartAction,
  mergeGuestCartAction,
  syncMyCartAction,
} from "@/lib/server-cart/actions";

/**
 * Guests: the lines live in localStorage. Signed-in customers: the lines
 * live server-side (lib/server-cart/), loaded/saved through Server Actions
 * — see tasks/phase-12-wire-up/78-real-cart-orders.md.
 */
async function loadPersistedLines(identity: CartIdentity): Promise<CartLineInput[]> {
  if (identity.kind === "user") {
    return getMyCartAction();
  }

  return readStoredCart(GUEST_CART_STORAGE_KEY);
}

function savePersistedLines(identity: CartIdentity, lines: CartLineInput[]): void {
  if (identity.kind === "user") {
    void syncMyCartAction(lines).catch((error: unknown) => {
      console.error("Failed to sync cart to the server", error);
    });
    return;
  }

  writeStoredCart(lines, GUEST_CART_STORAGE_KEY);
}

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
  const { user, hydrated: authHydrated } = useAuth();
  const identity = useMemo(
    () => resolveCartIdentity(user ? { id: user.id, role: user.role } : null),
    [user],
  );
  const [lines, setLines] = useState<CartLineInput[]>([]);
  const [hydrated, setHydrated] = useState(false);
  // Tracks which identity `lines` currently reflects, so the write-effect
  // below never saves stale lines into the *new* identity's cart during the
  // single render between a sign-in/out and the load effect resolving.
  const [loadedIdentity, setLoadedIdentity] = useState<CartIdentity | null>(null);
  // null means "haven't loaded a cart yet" — distinguishes a genuine guest →
  // user sign-in (merge) from simply reloading the page while already
  // signed in (no merge; AGENTS.md "Avoid duplicate data").
  const previousIdentityRef = useRef<CartIdentity | null>(null);

  useEffect(() => {
    if (!authHydrated) {
      return;
    }

    let cancelled = false;

    async function load() {
      const previous = previousIdentityRef.current;
      const isNewSignIn =
        previous !== null && previous.kind === "guest" && identity.kind === "user";

      const rawLines = isNewSignIn
        ? await mergeGuestCartAction(readStoredCart(GUEST_CART_STORAGE_KEY))
        : await loadPersistedLines(identity);

      if (isNewSignIn) {
        writeStoredCart([], GUEST_CART_STORAGE_KEY);
      }

      if (cancelled) {
        return;
      }

      const cleaned = resolveCartLines(rawLines)
        .map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          quantity: clampQuantityToStock(
            line.quantity,
            line.availableQuantity,
          ),
        }))
        .filter((line) => line.quantity > 0);

      previousIdentityRef.current = identity;
      setLoadedIdentity(identity);
      setLines(cleaned);
      setHydrated(true);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [authHydrated, identity]);

  useEffect(() => {
    if (!hydrated || !loadedIdentity) {
      return;
    }

    if (
      loadedIdentity.kind !== identity.kind ||
      (loadedIdentity.kind === "user" &&
        identity.kind === "user" &&
        loadedIdentity.userId !== identity.userId)
    ) {
      return;
    }

    savePersistedLines(identity, lines);
  }, [hydrated, lines, loadedIdentity, identity]);

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

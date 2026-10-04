/**
 * Which cart a guest vs. a signed-in customer is using
 * (tasks/phase-12-wire-up/78b-checkout-login-cart-merge.md and
 * tasks/phase-12-wire-up/78-real-cart-orders.md).
 *
 * Guests: localStorage only (GUEST_CART_STORAGE_KEY).
 * Signed-in CUSTOMERs: the server cart (lib/server-cart/), persisted
 * against their userId in D1 — see components/cart/cart-provider.tsx for
 * how it loads/saves through lib/server-cart/actions.ts.
 *
 * Admins never get a cart of their own — "Admin login at /login must not
 * merge the storefront guest cart into an admin session" — so an ADMIN
 * session is treated as "guest" here too: nothing is attributed to their
 * account, and the guest bucket stays whatever it was.
 */

export type CartIdentity = { kind: "guest" } | { kind: "user"; userId: string };

export const GUEST_CART_STORAGE_KEY = "robonautshop.cart.guest.v1";

export function resolveCartIdentity(
  user: { id: string; role: "CUSTOMER" | "ADMIN" } | null,
): CartIdentity {
  if (user && user.role === "CUSTOMER") {
    return { kind: "user", userId: user.id };
  }

  return { kind: "guest" };
}

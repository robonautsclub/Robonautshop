import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getServerSession } from "@/lib/auth/session";

/**
 * Server-side guard for /checkout and /checkout/confirmation — no guest
 * checkout (tasks/phase-12-wire-up/78b-checkout-login-cart-merge.md).
 * Guests may still browse and use /cart freely; only checkout itself
 * requires a session.
 *
 * Placing an order is still a client-only demo (lib/checkout/demo-order-
 * storage.ts, phase 8) with no server endpoint yet — real order creation
 * with its own independent session check is
 * tasks/phase-12-wire-up/78-real-cart-orders.md. Until then, gating this
 * route is the enforcement point.
 */
export default async function CheckoutLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/user/login?callbackUrl=/checkout");
  }

  return <>{children}</>;
}

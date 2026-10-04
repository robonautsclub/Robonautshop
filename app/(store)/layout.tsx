import type { ReactNode } from "react";

import { AuthProvider } from "@/components/auth/auth-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

// Every store page reads the catalog from D1 (tasks/phase-12-wire-up/75),
// which is only reachable at request time, not during `next build`'s static
// prerendering. Forcing the whole (store) subtree dynamic here (rather than
// per-page) keeps that one decision in one place.
export const dynamic = "force-dynamic";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex min-h-svh flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

import type { ReactNode } from "react";

import { AuthProvider } from "@/components/auth/auth-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

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

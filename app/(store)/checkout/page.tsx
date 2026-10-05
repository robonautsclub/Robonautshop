import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutPageContent } from "@/components/checkout/checkout-page-content";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}

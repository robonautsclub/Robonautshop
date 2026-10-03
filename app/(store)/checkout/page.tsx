import type { Metadata } from "next";

import { CheckoutPageContent } from "@/components/checkout/checkout-page-content";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}

import type { Metadata } from "next";

import { OrderConfirmationContent } from "@/components/checkout/order-confirmation-content";

export const metadata: Metadata = {
  title: "Order confirmation",
};

export default function OrderConfirmationPage() {
  return <OrderConfirmationContent />;
}

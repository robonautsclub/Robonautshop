import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <PlaceholderPage
      title="Cart"
      description="This section is not available yet."
    />
  );
}

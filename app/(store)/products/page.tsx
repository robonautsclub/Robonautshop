import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return (
    <PlaceholderPage
      title="Products"
      description="This section is not available yet."
    />
  );
}

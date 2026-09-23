import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = {
  title: { absolute: "Robonautshop" },
};

export default function HomePage() {
  return (
    <PlaceholderPage
      title="Robonautshop"
      description="The storefront is being set up. Product browsing is not available yet."
    />
  );
}

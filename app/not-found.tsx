import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { StatusPage } from "@/components/shared/status-page";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <PageContainer as="section" className="py-16 sm:py-24">
      <StatusPage
        code="404"
        title="Page not found"
        description="That page does not exist or the product may have been moved. Try the store homepage or browse products."
        primaryAction={{ href: "/", label: "Go home" }}
        secondaryAction={{ href: "/products", label: "Browse products" }}
      />
    </PageContainer>
  );
}

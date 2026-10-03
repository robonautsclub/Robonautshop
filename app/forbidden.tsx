import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { StatusPage } from "@/components/shared/status-page";

export const metadata: Metadata = {
  title: "Forbidden",
};

/**
 * UI shell for Next.js `forbidden()`.
 * Call sites for real ADMIN/role checks belong in Phase 12 auth wiring.
 */
export default function Forbidden() {
  return (
    <PageContainer as="section" className="py-16 sm:py-24">
      <StatusPage
        code="403"
        title="Access denied"
        description="You do not have permission to view this page."
        primaryAction={{ href: "/", label: "Go home" }}
        secondaryAction={{ href: "/account", label: "Account" }}
      />
    </PageContainer>
  );
}

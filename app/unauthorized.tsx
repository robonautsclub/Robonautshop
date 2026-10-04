import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { StatusPage } from "@/components/shared/status-page";

export const metadata: Metadata = {
  title: "Sign in required",
};

/**
 * UI shell for Next.js `unauthorized()`.
 * Call sites for real session checks belong in Phase 12 auth wiring.
 */
export default function Unauthorized() {
  return (
    <PageContainer as="section" className="py-16 sm:py-24">
      <StatusPage
        code="401"
        title="Sign in required"
        description="You need to sign in before you can view this page."
        primaryAction={{ href: "/user/login", label: "Sign in" }}
        secondaryAction={{ href: "/", label: "Go home" }}
      />
    </PageContainer>
  );
}

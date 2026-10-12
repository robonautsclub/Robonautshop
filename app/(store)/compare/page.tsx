import type { Metadata } from "next";

import { CompareView } from "@/components/compare/compare-view";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Compare products",
  robots: { index: false },
};

export default function ComparePage() {
  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Compare products</h1>
        <p className="mt-2 text-muted-foreground">
          Specifications side by side. Rows that differ are highlighted.
        </p>
      </div>
      <CompareView />
    </PageContainer>
  );
}

import type { Metadata } from "next";

import { ContentCard } from "@/components/content/content-card";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState } from "@/components/product";
import { getDocPagesGrouped } from "@/lib/content";

export const metadata: Metadata = {
  title: "Help & docs",
};

export default function DocsIndexPage() {
  const groups = getDocPagesGrouped();

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Help & docs</h1>
        <p className="mt-2 text-muted-foreground">
          Shipping, payments, returns, and lab safety for Robonautshop shoppers.
        </p>
      </div>

      {groups.length === 0 ? (
        <CatalogEmptyState
          title="No documentation yet"
          description="Help articles will appear here."
          actionHref="/"
          actionLabel="Back to home"
        />
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.section}>
              <h2 className="text-lg font-semibold tracking-tight">{group.section}</h2>
              <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {group.pages.map((page) => (
                  <li key={page.id}>
                    <ContentCard
                      href={`/docs/${page.slug}`}
                      title={page.title}
                      description={page.shortDescription}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

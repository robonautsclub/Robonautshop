import type { Metadata } from "next";

import { ContentCard } from "@/components/content/content-card";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState } from "@/components/product";
import { getRobotGuides } from "@/lib/content";

export const metadata: Metadata = {
  title: "Robot guides",
};

export default function RobotGuidesPage() {
  const items = getRobotGuides();

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Robot guides</h1>
        <p className="mt-2 text-muted-foreground">
          Build guides matched to catalog projects — assembly tips and competition notes.
        </p>
      </div>

      {items.length === 0 ? (
        <CatalogEmptyState
          title="No guides yet"
          description="Project-linked guides will show up here."
          actionHref="/projects"
          actionLabel="Browse projects"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((guide) => (
            <li key={guide.id}>
              <ContentCard
                href={`/guides/${guide.slug}`}
                title={guide.title}
                description={guide.shortDescription}
                badge={guide.difficulty}
                meta={
                  guide.projectSlug
                    ? `Project · ${guide.projectSlug}`
                    : "General guide"
                }
              />
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

import type { Metadata } from "next";

import { ContentCard } from "@/components/content/content-card";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState } from "@/components/product";
import { getTutorials } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tutorials",
};

export default function TutorialsPage() {
  const items = getTutorials();

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Tutorials</h1>
        <p className="mt-2 text-muted-foreground">
          Step-by-step lessons for boards, sensors, and motor drivers used in our kits.
        </p>
      </div>

      {items.length === 0 ? (
        <CatalogEmptyState
          title="No tutorials yet"
          description="Learning content will appear here as it is published."
          actionHref="/projects"
          actionLabel="Browse projects"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((tutorial) => (
            <li key={tutorial.id}>
              <ContentCard
                href={`/tutorials/${tutorial.slug}`}
                title={tutorial.title}
                description={tutorial.shortDescription}
                badge={tutorial.difficulty}
                meta={`About ${tutorial.estimatedMinutes} min`}
              />
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

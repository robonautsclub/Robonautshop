import type { Metadata } from "next";
import Link from "next/link";

import { CatalogCoverImage } from "@/components/catalog/catalog-cover-image";
import { SkillLevelBadge } from "@/components/catalog/skill-level-badge";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState } from "@/components/product";
import { getProjects } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Robot builds with real component requirements from the catalog.
        </p>
      </div>

      {projects.length === 0 ? (
        <CatalogEmptyState
          title="No projects yet"
          description="Robot projects will appear here when they are added to the catalog."
          actionHref="/kits"
          actionLabel="Browse kits"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <CatalogCoverImage
                  src={project.imageUrl}
                  alt={project.imageAlt}
                  className="transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-medium tracking-tight">
                      {project.name}
                    </h2>
                    <SkillLevelBadge skillLevel={project.skillLevel} />
                  </div>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {project.shortDescription}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

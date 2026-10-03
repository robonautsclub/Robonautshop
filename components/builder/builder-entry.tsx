import Link from "next/link";

import { CatalogCoverImage } from "@/components/catalog/catalog-cover-image";
import { SkillLevelBadge } from "@/components/catalog/skill-level-badge";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState } from "@/components/product";
import type { ProjectSkillLevel, RobotProject } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const SKILL_OPTIONS: Array<{ value: ProjectSkillLevel | "ALL"; label: string }> =
  [
    { value: "ALL", label: "All levels" },
    { value: "BEGINNER", label: "Beginner" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "ADVANCED", label: "Advanced" },
    { value: "COMPETITION", label: "Competition" },
  ];

type BuilderEntryProps = {
  projects: RobotProject[];
  activeSkill: ProjectSkillLevel | "ALL";
};

export function BuilderEntry({ projects, activeSkill }: BuilderEntryProps) {
  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Robot Builder</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a project, review the parts list, customize what you need, then
          add a kit or selected components to your cart.
        </p>
      </div>

      <div className="mb-8">
        <p className="mb-3 text-sm font-medium">Skill level</p>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((option) => {
            const href =
              option.value === "ALL"
                ? "/builder"
                : `/builder?skill=${option.value}`;
            const selected = activeSkill === option.value;

            return (
              <Link
                key={option.value}
                href={href}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "bg-background hover:border-foreground/30",
                )}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </div>

      {projects.length === 0 ? (
        <CatalogEmptyState
          title="No projects for this skill level"
          description="Try another skill filter or browse all robot projects."
          actionHref="/builder"
          actionLabel="Show all levels"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/builder/${project.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <CatalogCoverImage
                  src={project.imageUrl}
                  alt={project.imageAlt}
                />
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-medium tracking-tight">
                      {project.name}
                    </h2>
                    <SkillLevelBadge skillLevel={project.skillLevel} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {project.shortDescription}
                  </p>
                  <span className="mt-auto pt-2 text-sm font-medium">
                    Start building →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

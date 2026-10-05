import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogCoverImage } from "@/components/catalog/catalog-cover-image";
import { ComponentRequirementsList } from "@/components/catalog/component-requirements-list";
import { SkillLevelBadge } from "@/components/catalog/skill-level-badge";
import { CodeExampleBlocks } from "@/components/content/code-example-blocks";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import {
  formatBdt,
  getProjectBySlug,
  getProjectLinkedKit,
  getProjectRequirementLines,
  sumRequirementLineTotals,
} from "@/lib/catalog";
import {
  getCodeExamplesForProjectSlug,
  getRobotGuideByProjectSlug,
} from "@/lib/content";
import { getRequestDb } from "@/lib/db/request";
import { cn } from "@/lib/utils";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = await getRequestDb();
  const project = await getProjectBySlug(db, slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: project.name,
    description: project.shortDescription,
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const db = await getRequestDb();
  const project = await getProjectBySlug(db, slug);

  if (!project) {
    notFound();
  }

  const lines = await getProjectRequirementLines(db, project.id);
  const requiredLines = lines.filter((line) => !line.optional);
  const optionalLines = lines.filter((line) => line.optional);
  const requiredTotal = sumRequirementLineTotals(requiredLines);
  const linkedKit = await getProjectLinkedKit(db, project.id);
  const guide = getRobotGuideByProjectSlug(project.slug);
  const codeExamples = getCodeExamplesForProjectSlug(project.slug);

  return (
    <PageContainer as="section" className="py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/projects" className="hover:text-foreground">
              Projects
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{project.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <CatalogCoverImage
          src={project.imageUrl}
          alt={project.imageAlt}
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="rounded-xl border"
        />

        <div className="space-y-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {project.name}
              </h1>
              <SkillLevelBadge skillLevel={project.skillLevel} />
            </div>
            <p className="text-muted-foreground">{project.shortDescription}</p>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Required parts total</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {formatBdt(requiredTotal)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {requiredLines.length} required component
              {requiredLines.length === 1 ? "" : "s"}
              {optionalLines.length > 0
                ? ` · ${optionalLines.length} optional`
                : ""}
            </p>
            {linkedKit ? (
              <Link
                href={`/kits/${linkedKit.slug}`}
                className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
              >
                View {linkedKit.name}
              </Link>
            ) : null}
            {guide ? (
              <Link
                href={`/guides/${guide.slug}`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  linkedKit ? "mt-2" : "mt-4",
                )}
              >
                Read build guide
              </Link>
            ) : null}
            <Link
              href={`/builder/${project.slug}`}
              className={cn(
                buttonVariants({
                  variant: linkedKit || guide ? "ghost" : "outline",
                }),
                "mt-2",
              )}
            >
              Open in Robot Builder
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Required components
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quantities, live stock from the mock inventory, and line prices.
          </p>
          <ComponentRequirementsList className="mt-6" lines={requiredLines} />
        </div>

        {optionalLines.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Optional components
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nice-to-have upgrades for this build.
            </p>
            <ComponentRequirementsList className="mt-6" lines={optionalLines} />
          </div>
        ) : null}
      </div>

      <CodeExampleBlocks examples={codeExamples} heading="Project code examples" />
    </PageContainer>
  );
}

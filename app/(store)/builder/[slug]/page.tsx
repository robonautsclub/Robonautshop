import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BuilderWorkspace } from "@/components/builder/builder-workspace";
import { PageContainer } from "@/components/layout/page-container";
import {
  getKitRequirementLines,
  getProjectBySlug,
  getProjectLinkedKit,
  getProjectRequirementLines,
} from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";

type BuilderProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BuilderProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = await getRequestDb();
  const project = await getProjectBySlug(db, slug);

  if (!project) {
    return { title: "Builder project not found" };
  }

  return {
    title: `Build ${project.name}`,
    description: project.shortDescription,
  };
}

export default async function BuilderProjectPage({
  params,
}: BuilderProjectPageProps) {
  const { slug } = await params;
  const db = await getRequestDb();
  const project = await getProjectBySlug(db, slug);

  if (!project) {
    notFound();
  }

  const lines = await getProjectRequirementLines(db, project.id);
  const linkedKit = await getProjectLinkedKit(db, project.id);
  const kitLines = linkedKit ? await getKitRequirementLines(db, linkedKit.id) : [];

  return (
    <PageContainer as="section" className="py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/builder" className="hover:text-foreground">
              Robot Builder
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{project.name}</li>
        </ol>
      </nav>

      <BuilderWorkspace
        project={project}
        lines={lines}
        linkedKit={linkedKit}
        kitLines={kitLines}
      />
    </PageContainer>
  );
}

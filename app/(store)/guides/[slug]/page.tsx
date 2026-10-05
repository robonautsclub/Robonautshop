import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentArticle } from "@/components/content/content-article";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { getRobotGuideBySlug } from "@/lib/content";
import { cn } from "@/lib/utils";

type GuideDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: GuideDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getRobotGuideBySlug(slug);
  if (!guide) {
    return { title: "Guide not found" };
  }
  return {
    title: guide.title,
    description: guide.shortDescription,
  };
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params;
  const guide = getRobotGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return (
    <PageContainer as="section" className="py-10">
      <ContentArticle
        breadcrumbHref="/guides"
        breadcrumbLabel="Robot guides"
        title={guide.title}
        description={guide.shortDescription}
        meta={
          <p className="text-sm text-muted-foreground">{guide.difficulty}</p>
        }
        paragraphs={guide.body}
        aside={
          <div className="space-y-3 rounded-xl border p-5">
            <h2 className="font-semibold tracking-tight">Continue building</h2>
            {guide.projectSlug ? (
              <>
                <Link
                  href={`/projects/${guide.projectSlug}`}
                  className={cn(buttonVariants(), "w-full")}
                >
                  View project
                </Link>
                <Link
                  href={`/builder/${guide.projectSlug}`}
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                >
                  Open Robot Builder
                </Link>
              </>
            ) : (
              <Link
                href="/projects"
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
              >
                Browse projects
              </Link>
            )}
            <Link
              href="/tutorials"
              className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
            >
              Tutorials
            </Link>
          </div>
        }
      />
    </PageContainer>
  );
}

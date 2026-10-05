import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentArticle } from "@/components/content/content-article";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { getTutorialBySlug } from "@/lib/content";
import { cn } from "@/lib/utils";

type TutorialDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: TutorialDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = getTutorialBySlug(slug);
  if (!tutorial) {
    return { title: "Tutorial not found" };
  }
  return {
    title: tutorial.title,
    description: tutorial.shortDescription,
  };
}

export default async function TutorialDetailPage({
  params,
}: TutorialDetailPageProps) {
  const { slug } = await params;
  const tutorial = getTutorialBySlug(slug);

  if (!tutorial) {
    notFound();
  }

  return (
    <PageContainer as="section" className="py-10">
      <ContentArticle
        breadcrumbHref="/tutorials"
        breadcrumbLabel="Tutorials"
        title={tutorial.title}
        description={tutorial.shortDescription}
        meta={
          <p className="text-sm text-muted-foreground">
            {tutorial.difficulty} · about {tutorial.estimatedMinutes} minutes
          </p>
        }
        paragraphs={tutorial.body}
        aside={
          <div className="space-y-4 rounded-xl border p-5">
            <h2 className="font-semibold tracking-tight">Related in the store</h2>
            {tutorial.relatedProductSlugs.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Products</p>
                <ul className="mt-2 space-y-1">
                  {tutorial.relatedProductSlugs.map((productSlug) => (
                    <li key={productSlug}>
                      <Link
                        href={`/products/${productSlug}`}
                        className="text-sm hover:underline"
                      >
                        {productSlug}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {tutorial.relatedProjectSlugs.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Projects</p>
                <ul className="mt-2 space-y-1">
                  {tutorial.relatedProjectSlugs.map((projectSlug) => (
                    <li key={projectSlug}>
                      <Link
                        href={`/projects/${projectSlug}`}
                        className="text-sm hover:underline"
                      >
                        {projectSlug}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <Link href="/guides" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              Robot guides
            </Link>
          </div>
        }
      />
    </PageContainer>
  );
}

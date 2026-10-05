import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentArticle } from "@/components/content/content-article";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { getDocPageBySlug, getDocPages } from "@/lib/content";
import { cn } from "@/lib/utils";

type DocDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: DocDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocPageBySlug(slug);
  if (!page) {
    return { title: "Doc not found" };
  }
  return {
    title: page.title,
    description: page.shortDescription,
  };
}

export default async function DocDetailPage({ params }: DocDetailPageProps) {
  const { slug } = await params;
  const page = getDocPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const others = getDocPages().filter((item) => item.slug !== page.slug).slice(0, 4);

  return (
    <PageContainer as="section" className="py-10">
      <ContentArticle
        breadcrumbHref="/docs"
        breadcrumbLabel="Help & docs"
        title={page.title}
        description={page.shortDescription}
        meta={
          <p className="text-sm text-muted-foreground">Section · {page.section}</p>
        }
        paragraphs={page.body}
        aside={
          <div className="space-y-3 rounded-xl border p-5">
            <h2 className="font-semibold tracking-tight">More help</h2>
            <ul className="space-y-2">
              {others.map((item) => (
                <li key={item.id}>
                  <Link href={`/docs/${item.slug}`} className="text-sm hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/account/orders"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Track an order
            </Link>
          </div>
        }
      />
    </PageContainer>
  );
}

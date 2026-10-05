import Link from "next/link";
import type { ReactNode } from "react";

type ContentArticleProps = {
  breadcrumbHref: string;
  breadcrumbLabel: string;
  title: string;
  description: string;
  meta?: ReactNode;
  paragraphs: string[];
  aside?: ReactNode;
};

export function ContentArticle({
  breadcrumbHref,
  breadcrumbLabel,
  title,
  description,
  meta,
  paragraphs,
  aside,
}: ContentArticleProps) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href={breadcrumbHref} className="hover:text-foreground">
              {breadcrumbLabel}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{title}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <article className="space-y-6">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
            {meta}
          </header>
          <div className="space-y-4">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
        {aside ? <aside className="space-y-4">{aside}</aside> : null}
      </div>
    </>
  );
}

import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import {
  getPolicyPage,
  POLICY_REVIEW_NOTICE,
  type PolicySlug,
} from "@/lib/content/policy-pages";
import { buildPageMetadata } from "@/lib/seo/metadata";

/** Shared metadata for the static trust pages. */
export function policyMetadata(slug: PolicySlug): Metadata {
  const page = getPolicyPage(slug);
  return buildPageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
  });
}

export function PolicyPage({ slug }: { slug: PolicySlug }) {
  const page = getPolicyPage(slug);

  return (
    <PageContainer as="section" className="max-w-3xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
      <p className="mt-2 text-muted-foreground">{page.description}</p>

      {page.needsReview ? (
        <p
          className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm"
          role="note"
        >
          {POLICY_REVIEW_NOTICE}
        </p>
      ) : null}

      <div className="mt-8 space-y-8">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </PageContainer>
  );
}

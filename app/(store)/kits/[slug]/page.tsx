import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddKitToCartButton } from "@/components/cart/add-kit-to-cart-button";
import { CatalogCoverImage } from "@/components/catalog/catalog-cover-image";
import { ComponentRequirementsList } from "@/components/catalog/component-requirements-list";
import { KitCustomQuantities } from "@/components/kit/kit-custom-quantities";
import { PageContainer } from "@/components/layout/page-container";
import { JsonLd } from "@/components/shared/json-ld";
import { PriceDisplay } from "@/components/product/price-display";
import { buttonVariants } from "@/components/ui/button";
import {
  getKitBySlug,
  getKitLinkedProject,
  getKitRequirementLines,
} from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

type KitDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: KitDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = await getRequestDb();
  const kit = await getKitBySlug(db, slug);

  if (!kit) {
    return { title: "Kit not found" };
  }

  return buildPageMetadata({
    title: kit.name,
    description: kit.shortDescription,
    path: `/kits/${kit.slug}`,
    image: kit.imageUrl ? { url: kit.imageUrl, alt: kit.imageAlt || kit.name } : null,
  });
}

export default async function KitDetailPage({ params }: KitDetailPageProps) {
  const { slug } = await params;
  const db = await getRequestDb();
  const kit = await getKitBySlug(db, slug);

  if (!kit) {
    notFound();
  }

  const lines = await getKitRequirementLines(db, kit.id);
  const linkedProject = await getKitLinkedProject(db, kit);

  return (
    <PageContainer as="section" className="py-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Kits", path: "/kits" },
          { name: kit.name, path: `/kits/${kit.slug}` },
        ])}
      />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/kits" className="hover:text-foreground">
              Kits
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{kit.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <CatalogCoverImage
          src={kit.imageUrl}
          alt={kit.imageAlt}
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="rounded-xl border"
        />

        <div className="space-y-5">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">{kit.name}</h1>
            <p className="text-muted-foreground">{kit.shortDescription}</p>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {kit.description}
            </p>
            {linkedProject ? (
              <p className="text-sm">
                Builds{" "}
                <Link
                  href={`/projects/${linkedProject.slug}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {linkedProject.name}
                </Link>
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border p-5 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Kit price</p>
              <PriceDisplay
                price={kit.price}
                compareAtPrice={kit.compareAtPrice}
                size="lg"
                className="mt-2"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Adds each included component to the cart using catalog product
              ids. Stock is checked per line.
            </p>
            <AddKitToCartButton lines={lines} kitName={kit.name} />
            {linkedProject ? (
              <Link
                href={`/projects/${linkedProject.slug}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                View project guide
              </Link>
            ) : null}
          </div>

          <KitCustomQuantities lines={lines} kitName={kit.name} />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">
          Included components
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each line links to the matching product page.
        </p>
        <ComponentRequirementsList
          className="mt-6"
          lines={lines}
          showOptionalBadge={false}
        />
      </div>
    </PageContainer>
  );
}

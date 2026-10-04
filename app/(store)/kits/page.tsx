import type { Metadata } from "next";
import Link from "next/link";

import { CatalogCoverImage } from "@/components/catalog/catalog-cover-image";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState } from "@/components/product";
import { PriceDisplay } from "@/components/product/price-display";
import { getKits } from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";

export const metadata: Metadata = {
  title: "Kits",
};

export default async function KitsPage() {
  const db = await getRequestDb();
  const kits = await getKits(db);

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Kits</h1>
        <p className="mt-2 text-muted-foreground">
          Complete robot kits with matched components.
        </p>
      </div>

      {kits.length === 0 ? (
        <CatalogEmptyState
          title="No kits yet"
          description="Kits will appear here when they are added to the catalog."
          actionHref="/products"
          actionLabel="Browse products"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kits.map((kit) => (
            <li key={kit.id}>
              <Link
                href={`/kits/${kit.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <CatalogCoverImage
                  src={kit.imageUrl}
                  alt={kit.imageAlt}
                  className="transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-medium tracking-tight">
                    {kit.name}
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {kit.shortDescription}
                  </p>
                  <div className="mt-4">
                    <PriceDisplay
                      price={kit.price}
                      compareAtPrice={kit.compareAtPrice}
                      size="sm"
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

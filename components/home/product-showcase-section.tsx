import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState, ProductCard, ProductGrid } from "@/components/product";
import type { ProductCardModel } from "@/lib/catalog";

type ProductShowcaseSectionProps = {
  title: string;
  subtitle: string;
  cards: ProductCardModel[];
  emptyTitle: string;
  emptyDescription: string;
  /** Section background, e.g. to alternate rows. */
  className?: string;
};

/** One homepage product row (featured, new arrivals, bestsellers) with an empty state. */
export function ProductShowcaseSection({
  title,
  subtitle,
  cards,
  emptyTitle,
  emptyDescription,
  className,
}: ProductShowcaseSectionProps) {
  return (
    <PageContainer as="section" className={className ?? "py-14"}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Link
          href="/products"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>
      {cards.length === 0 ? (
        <CatalogEmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionHref="/products"
          actionLabel="Browse all products"
        />
      ) : (
        <ProductGrid>
          {cards.map((card) => (
            <ProductCard
              key={card.product.id}
              product={card.product}
              imageUrl={card.imageUrl}
              imageAlt={card.imageAlt}
              availableQuantity={card.availableQuantity}
            />
          ))}
        </ProductGrid>
      )}
    </PageContainer>
  );
}

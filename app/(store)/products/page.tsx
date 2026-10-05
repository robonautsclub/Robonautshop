import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import {
  CatalogEmptyState,
  ProductCard,
  ProductGrid,
} from "@/components/product";
import {
  parseProductSort,
  ProductToolbar,
} from "@/components/product/product-toolbar";
import { getCategories, getProductCardModels, getProducts } from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";
import { recordAnalyticsEvent } from "@/lib/analytics/queries";

export const metadata: Metadata = {
  title: "Products",
};

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    inStock?: string;
    sort?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const inStock = params.inStock === "1" || params.inStock === "true";
  const sort = parseProductSort(params.sort);

  const db = await getRequestDb();
  const categories = await getCategories(db);
  const products = await getProducts(db, {
    query: q || undefined,
    categorySlug: category || undefined,
    inStock: inStock || undefined,
    sort,
  });
  const cards = await getProductCardModels(db, products);

  if (q) {
    void recordAnalyticsEvent(db, { type: "SEARCH", query: q });
  }

  const hasFilters = Boolean(q || category || inStock || sort !== "newest");

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
        <p className="mt-2 text-muted-foreground">
          Browse robotics components from the development catalog.
        </p>
      </div>

      <ProductToolbar
        categories={categories}
        values={{ q, category, inStock, sort }}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          {products.length} product{products.length === 1 ? "" : "s"}
          {q ? ` for “${q}”` : ""}
        </p>
        {hasFilters ? (
          <Link href="/products" className="hover:text-foreground">
            Clear filters
          </Link>
        ) : null}
      </div>

      <div className="mt-6">
        {cards.length === 0 ? (
          <CatalogEmptyState
            title="No products found"
            description="Try changing your search, removing a filter, or browsing another category."
            actionHref="/products"
            actionLabel="Reset filters"
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
      </div>
    </PageContainer>
  );
}

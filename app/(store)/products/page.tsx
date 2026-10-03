import type { Metadata } from "next";
import Link from "next/link";

import {
  CatalogEmptyState,
  ProductCard,
  ProductGrid,
} from "@/components/product";
import {
  parseProductSort,
  ProductToolbar,
} from "@/components/product/product-toolbar";
import {
  getCategories,
  getProducts,
  toProductCardModel,
} from "@/lib/catalog";

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
  const categories = getCategories();

  const products = getProducts({
    query: q || undefined,
    categorySlug: category || undefined,
    inStock: inStock || undefined,
    sort,
  });

  const hasFilters = Boolean(q || category || inStock || sort !== "newest");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
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
        {products.length === 0 ? (
          <CatalogEmptyState
            title="No products found"
            description="Try changing your search, removing a filter, or browsing another category."
            actionHref="/products"
            actionLabel="Reset filters"
          />
        ) : (
          <ProductGrid>
            {products.map((product) => {
              const card = toProductCardModel(product);
              return (
                <ProductCard
                  key={product.id}
                  product={card.product}
                  imageUrl={card.imageUrl}
                  imageAlt={card.imageAlt}
                  availableQuantity={card.availableQuantity}
                />
              );
            })}
          </ProductGrid>
        )}
      </div>
    </section>
  );
}

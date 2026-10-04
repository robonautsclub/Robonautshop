import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState } from "@/components/product";
import { getCategories, getProducts } from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const db = await getRequestDb();
  const categories = await getCategories(db);
  const counts = await Promise.all(
    categories.map((category) =>
      getProducts(db, { categorySlug: category.slug }).then((products) => products.length),
    ),
  );

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Shop by component family.
        </p>
      </div>

      {categories.length === 0 ? (
        <CatalogEmptyState
          title="No categories yet"
          description="Categories will appear here when the catalog is populated."
          actionHref="/products"
          actionLabel="Browse products"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => {
            const count = counts[index];
            return (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="block h-full rounded-xl border px-5 py-5 transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <h2 className="text-lg font-medium tracking-tight">
                    {category.name}
                  </h2>
                  {category.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  ) : null}
                  <p className="mt-4 text-xs text-muted-foreground">
                    {count} product{count === 1 ? "" : "s"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PageContainer>
  );
}

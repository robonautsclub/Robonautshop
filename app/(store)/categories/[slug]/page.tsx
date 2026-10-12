import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import {
  CatalogEmptyState,
  ProductCard,
  ProductGrid,
  ProductPagination,
} from "@/components/product";
import {
  getCategoryById,
  getCategoryBySlug,
  getProductCardModels,
  getProductsPage,
  getSubcategories,
} from "@/lib/catalog";
import { buildListHref, parsePageParam } from "@/lib/catalog/list-url";
import { getRequestDb } from "@/lib/db/request";
import { buildPageMetadata } from "@/lib/seo/metadata";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = parsePageParam((await searchParams).page);
  const db = await getRequestDb();
  const category = await getCategoryBySlug(db, slug);

  if (!category) {
    return { title: "Category not found" };
  }

  return buildPageMetadata({
    title: page > 1 ? `${category.name} · Page ${page}` : category.name,
    description: category.description ?? undefined,
    path: buildListHref(`/categories/${category.slug}`, {}, page),
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const pageNumber = parsePageParam((await searchParams).page);
  const db = await getRequestDb();
  const category = await getCategoryBySlug(db, slug);

  if (!category) {
    notFound();
  }

  const result = await getProductsPage(db, {
    categorySlug: category.slug,
    sort: "name-asc",
    page: pageNumber,
  });
  const cards = await getProductCardModels(db, result.products);
  const [parent, subcategories] = await Promise.all([
    category.parentId ? getCategoryById(db, category.parentId) : Promise.resolve(null),
    getSubcategories(db, category.id),
  ]);

  return (
    <PageContainer as="section" className="py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/categories" className="hover:text-foreground">
              Categories
            </Link>
          </li>
          <li aria-hidden>/</li>
          {parent ? (
            <>
              <li>
                <Link href={`/categories/${parent.slug}`} className="hover:text-foreground">
                  {parent.name}
                </Link>
              </li>
              <li aria-hidden>/</li>
            </>
          ) : null}
          <li className="text-foreground">{category.name}</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {category.description}
          </p>
        ) : null}
      </div>

      {subcategories.length > 0 ? (
        <nav aria-label="Subcategories" className="mb-8">
          <ul className="flex flex-wrap gap-2">
            {subcategories.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/categories/${child.slug}`}
                  className="inline-flex rounded-full border px-3 py-1 text-sm hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {cards.length === 0 ? (
        <CatalogEmptyState
          title="No products in this category"
          description="Try another category or browse the full catalog."
          actionHref="/products"
          actionLabel="Browse products"
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

      <ProductPagination
        basePath={`/categories/${category.slug}`}
        params={{}}
        page={result.page}
        totalPages={result.totalPages}
      />
    </PageContainer>
  );
}

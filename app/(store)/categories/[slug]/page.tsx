import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import {
  CatalogEmptyState,
  ProductCard,
  ProductGrid,
} from "@/components/product";
import {
  getCategoryBySlug,
  getProductCardModels,
  getProducts,
} from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = await getRequestDb();
  const category = await getCategoryBySlug(db, slug);

  if (!category) {
    return { title: "Category not found" };
  }

  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const db = await getRequestDb();
  const category = await getCategoryBySlug(db, slug);

  if (!category) {
    notFound();
  }

  const products = await getProducts(db, {
    categorySlug: category.slug,
    sort: "name-asc",
  });
  const cards = await getProductCardModels(db, products);

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
    </PageContainer>
  );
}

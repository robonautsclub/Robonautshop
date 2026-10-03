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
  getCategories,
  getCategoryBySlug,
  getProducts,
  toProductCardModel,
} from "@/lib/catalog";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

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
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = getProducts({
    categorySlug: category.slug,
    sort: "name-asc",
  });

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

      {products.length === 0 ? (
        <CatalogEmptyState
          title="No products in this category"
          description="Try another category or browse the full catalog."
          actionHref="/products"
          actionLabel="Browse products"
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
    </PageContainer>
  );
}

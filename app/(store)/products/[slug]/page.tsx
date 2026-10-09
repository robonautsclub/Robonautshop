import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CodeExampleBlocks } from "@/components/content/code-example-blocks";
import { ProductDatasheets } from "@/components/content/product-datasheets";
import { PageContainer } from "@/components/layout/page-container";
import { JsonLd } from "@/components/shared/json-ld";
import {
  CatalogEmptyState,
  ProductCard,
  ProductGrid,
} from "@/components/product";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { WishlistButton } from "@/components/product/wishlist-button";
import { FrequentlyBoughtTogether } from "@/components/recommendations/frequently-bought-together";
import { ProductReviewsSection } from "@/components/reviews/product-reviews-section";
import { getServerSession } from "@/lib/auth/session";
import {
  getProductBySlug,
  getProductCardModels,
  getRelatedProducts,
} from "@/lib/catalog";
import {
  getCodeExamplesForProductSlug,
  getDatasheetsForProductSlug,
} from "@/lib/content";
import { getRequestDb } from "@/lib/db/request";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/structured-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { recordAnalyticsEvent } from "@/lib/analytics/queries";
import { getFrequentlyBoughtWith } from "@/lib/recommendations/queries";
import { getMyReviewForProduct, getReviewsForProduct, getReviewSummaryForProduct } from "@/lib/reviews/queries";
import { isInWishlist } from "@/lib/wishlist/queries";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = await getRequestDb();
  const product = await getProductBySlug(db, slug);

  if (!product) {
    return { title: "Product not found" };
  }

  const image = product.images[0];
  return buildPageMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/products/${product.slug}`,
    image: image ? { url: image.url, alt: image.alt || product.name } : null,
  });
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const db = await getRequestDb();
  const product = await getProductBySlug(db, slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(db, product.slug, 4);
  const relatedCards = await getProductCardModels(db, related);
  const primaryImage = product.images[0];
  const specificationEntries = Object.entries(product.specifications);
  const datasheets = getDatasheetsForProductSlug(product.slug);
  const codeExamples = getCodeExamplesForProductSlug(product.slug);

  const session = await getServerSession();
  const [frequentlyBoughtWith, reviews, reviewSummary, myReview, wishlisted] = await Promise.all([
    getFrequentlyBoughtWith(db, product.id, 4),
    getReviewsForProduct(db, product.id),
    getReviewSummaryForProduct(db, product.id),
    session ? getMyReviewForProduct(db, session.user.id, product.id) : Promise.resolve(null),
    session ? isInWishlist(db, session.user.id, product.id) : Promise.resolve(false),
  ]);

  // Fire-and-forget — never block the page render on analytics logging.
  void recordAnalyticsEvent(db, { type: "PRODUCT_VIEW", productId: product.id });

  return (
    <PageContainer as="section" className="py-10">
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: "Products", path: "/products" },
            ...(product.category
              ? [{ name: product.category.name, path: `/categories/${product.category.slug}` }]
              : []),
            { name: product.name, path: `/products/${product.slug}` },
          ]),
        ]}
      />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
          </li>
          <li aria-hidden>/</li>
          {product.category ? (
            <>
              <li>
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="hover:text-foreground"
                >
                  {product.category.name}
                </Link>
              </li>
              <li aria-hidden>/</li>
            </>
          ) : null}
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {product.name}
            </h1>
            {product.brand ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Brand · {product.brand}
              </p>
            ) : null}
            <p className="mt-4 text-muted-foreground">
              {product.shortDescription}
            </p>
          </div>

          <ProductPurchasePanel
            product={product}
            variants={product.variants}
            inventory={product.inventory}
          />

          <WishlistButton
            productId={product.id}
            initialWishlisted={wishlisted}
            isSignedIn={Boolean(session)}
          />
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Description</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Specifications
          </h2>
          {specificationEntries.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No specifications listed.
            </p>
          ) : (
            <dl className="mt-3 divide-y rounded-xl border">
              {specificationEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-2 gap-3 px-4 py-3 text-sm"
                >
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <ProductDatasheets datasheets={datasheets} />
      <CodeExampleBlocks examples={codeExamples} />

      <div className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">
          Related products
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          More parts from the same category.
        </p>
        <div className="mt-6">
          {relatedCards.length === 0 ? (
            <CatalogEmptyState
              title="No related products"
              description="Browse the catalog for more components."
              actionHref="/products"
              actionLabel="Browse products"
            />
          ) : (
            <ProductGrid>
              {relatedCards.map((card) => (
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
      </div>

      <FrequentlyBoughtTogether items={frequentlyBoughtWith} />

      <ProductReviewsSection
        productSlug={product.slug}
        reviews={reviews}
        summary={reviewSummary}
        isSignedIn={Boolean(session)}
        myReview={myReview}
      />
    </PageContainer>
  );
}

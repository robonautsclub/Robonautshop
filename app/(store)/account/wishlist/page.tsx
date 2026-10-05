import { inArray } from "drizzle-orm";
import type { Metadata } from "next";

import { AccountNav } from "@/components/account/account-nav";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState, ProductCard, ProductGrid } from "@/components/product";
import { getServerSession } from "@/lib/auth/session";
import { getProductCardModels } from "@/lib/catalog";
import { getRequestDb } from "@/lib/db/request";
import { products } from "@/lib/db/schema/products";
import { listWishlistProductIds } from "@/lib/wishlist/queries";

export const metadata: Metadata = {
  title: "Wishlist",
};

export const dynamic = "force-dynamic";

export default async function AccountWishlistPage() {
  const session = await getServerSession();
  const db = await getRequestDb();
  const productIds = session ? await listWishlistProductIds(db, session.user.id) : [];
  const productRows = productIds.length
    ? await db.select().from(products).where(inArray(products.id, productIds))
    : [];
  const cards = await getProductCardModels(db, productRows);

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Wishlist</h1>
          <p className="mt-2 text-muted-foreground">Products you&apos;ve saved for later.</p>
        </div>
        <AccountNav pathname="/account/wishlist" />
      </div>

      {cards.length === 0 ? (
        <CatalogEmptyState
          title="Your wishlist is empty"
          description="Save products you're interested in from their product page."
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

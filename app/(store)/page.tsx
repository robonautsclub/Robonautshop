import Link from "next/link";

import { CatalogCoverImage } from "@/components/catalog/catalog-cover-image";
import { HomeHero } from "@/components/home/home-hero";
import { ProductShowcaseSection } from "@/components/home/product-showcase-section";
import { PageContainer } from "@/components/layout/page-container";
import {
  CatalogEmptyState,
} from "@/components/product";
import {
  getCategories,
  getBestsellers,
  getKits,
  getNewArrivals,
  getProductCardModels,
  getProducts,
  getProjects,
} from "@/lib/catalog";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { getRequestDb } from "@/lib/db/request";

export default async function HomePage() {
  const db = await getRequestDb();
  const featuredProductsRaw = await getProducts(db, {
    featured: true,
    sort: "name-asc",
  });
  const featuredProducts = await getProductCardModels(
    db,
    featuredProductsRaw.slice(0, 6),
  );
  const [newArrivals, bestsellers] = await Promise.all([
    getNewArrivals(db, 6).then((rows) => getProductCardModels(db, rows)),
    getBestsellers(db, 6).then((rows) => getProductCardModels(db, rows)),
  ]);
  const categoriesAll = await getCategories(db);
  const categories = categoriesAll.slice(0, 6);
  const featuredKitsAll = await getKits(db, { featured: true });
  const featuredKits = featuredKitsAll.slice(0, 2);
  const featuredProjectsAll = await getProjects(db, { featured: true });
  const featuredProjects = featuredProjectsAll.slice(0, 2);

  return (
    <div>
      <HomeHero />

      <ProductShowcaseSection
        title="Featured products"
        subtitle="Popular parts."
        cards={featuredProducts}
        emptyTitle="No featured products yet"
        emptyDescription="Featured items will show here once they are marked in the catalog."
      />

      <ProductShowcaseSection
        title="New arrivals"
        subtitle="The latest additions to the catalog."
        cards={newArrivals}
        emptyTitle="No products yet"
        emptyDescription="New products will appear here as they are added."
        className="pb-14"
      />

      <ProductShowcaseSection
        title="Bestsellers"
        subtitle="Most ordered by our customers."
        cards={bestsellers}
        emptyTitle="No bestsellers yet"
        emptyDescription="Bestsellers appear here once customers have placed orders."
        className="pb-14"
      />

      <PageContainer>
        <RecentlyViewed />
      </PageContainer>

      <section className="border-y bg-muted/30">
        <PageContainer className="py-14">
          <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Jump straight into the part family you need.
          </p>
          {categories.length === 0 ? (
            <div className="mt-6">
              <CatalogEmptyState
                title="No categories"
                description="Categories will appear here when the catalog has them."
              />
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="block rounded-xl border bg-background px-4 py-4 transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="font-medium tracking-tight">
                      {category.name}
                    </span>
                    {category.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PageContainer>
      </section>

      <PageContainer
        as="section"
        className="grid gap-10 py-14 lg:grid-cols-2"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Starter kits</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bundles matched to common robot builds.
          </p>
          {featuredKits.length === 0 ? (
            <div className="mt-6">
              <CatalogEmptyState
                title="No kits yet"
                description="Kit highlights will show here when available."
                actionHref="/kits"
                actionLabel="Browse kits"
              />
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {featuredKits.map((kit) => (
                <li key={kit.id}>
                  <Link
                    href={`/kits/${kit.slug}`}
                    className="flex overflow-hidden rounded-xl border hover:border-foreground/20"
                  >
                    <CatalogCoverImage
                      src={kit.imageUrl}
                      alt={kit.imageAlt}
                      className="w-28 shrink-0 sm:w-36"
                      sizes="144px"
                    />
                    <div className="p-4">
                      <p className="font-medium">{kit.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {kit.shortDescription}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Guided builds with real component lists.
          </p>
          {featuredProjects.length === 0 ? (
            <div className="mt-6">
              <CatalogEmptyState
                title="No projects yet"
                description="Project highlights will show here when available."
                actionHref="/projects"
                actionLabel="Browse projects"
              />
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {featuredProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="flex overflow-hidden rounded-xl border hover:border-foreground/20"
                  >
                    <CatalogCoverImage
                      src={project.imageUrl}
                      alt={project.imageAlt}
                      className="w-28 shrink-0 sm:w-36"
                      sizes="144px"
                    />
                    <div className="p-4">
                      <p className="font-medium">{project.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {project.shortDescription}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

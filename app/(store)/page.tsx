import Link from "next/link";

import { CatalogCoverImage } from "@/components/catalog/catalog-cover-image";
import { PageContainer } from "@/components/layout/page-container";
import {
  CatalogEmptyState,
  ProductCard,
  ProductGrid,
} from "@/components/product";
import { buttonVariants } from "@/components/ui/button";
import {
  getCategories,
  getKits,
  getProducts,
  getProjects,
  toProductCardModel,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const featuredProducts = getProducts({ featured: true, sort: "name-asc" }).slice(
    0,
    6,
  );
  const categories = getCategories().slice(0, 6);
  const featuredKits = getKits({ featured: true }).slice(0, 2);
  const featuredProjects = getProjects({ featured: true }).slice(0, 2);

  return (
    <div>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.92_0.02_250),transparent_55%),linear-gradient(180deg,oklch(0.97_0.01_240),transparent)]"
        />
        <PageContainer className="relative flex min-h-[70vh] flex-col justify-end gap-6 py-16 sm:py-24">
          <p className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Robonautshop
          </p>
          <h1 className="max-w-2xl text-xl font-medium tracking-tight text-foreground/90 sm:text-2xl">
            Robotics parts for builders who ship robots, not shopping carts.
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Microcontrollers, motors, sensors, and kits for STEM labs and
            competition teams across Bangladesh.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className={cn(buttonVariants({ size: "lg" }))}>
              Browse products
            </Link>
            <Link
              href="/kits"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              View kits
            </Link>
            <Link
              href="/builder"
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
            >
              Robot Builder
            </Link>
          </div>
        </PageContainer>
      </section>

      <PageContainer as="section" className="py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Featured products
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Popular parts from the mock catalog.
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        {featuredProducts.length === 0 ? (
          <CatalogEmptyState
            title="No featured products yet"
            description="Featured items will show here once they are marked in the catalog."
            actionHref="/products"
            actionLabel="Browse all products"
          />
        ) : (
          <ProductGrid>
            {featuredProducts.map((product) => {
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

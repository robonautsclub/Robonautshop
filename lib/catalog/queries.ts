/**
 * Catalog access helpers over the mock fixture data.
 *
 * Pages and components should import from here (or `@/lib/catalog`), not from
 * faker or raw mock arrays. These function signatures are intended to stay
 * stable when the implementation later switches to D1/API.
 */

import {
  mockCategories,
  mockImages,
  mockInventory,
  mockKitComponents,
  mockKits,
  mockProducts,
  mockProjectComponents,
  mockProjects,
  mockVariants,
} from "@/lib/catalog/mock-data";
import {
  getAvailableQuantity,
  type Category,
  type InventorySummary,
  type Kit,
  type KitComponent,
  type Product,
  type ProductImage,
  type ProductVariant,
  type ProjectComponent,
  type RobotProject,
} from "@/lib/catalog/types";

export type ProductSort =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "newest";

export type GetProductsOptions = {
  categorySlug?: string;
  query?: string;
  featured?: boolean;
  inStock?: boolean;
  sort?: ProductSort;
};

export type ProductWithRelations = Product & {
  category: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
  inventory: InventorySummary[];
};

function isPublishedProduct(product: Product): boolean {
  return product.status === "PUBLISHED";
}

function isPublishedKit(kit: Kit): boolean {
  return kit.status === "PUBLISHED";
}

function isPublishedProject(project: RobotProject): boolean {
  return project.status === "PUBLISHED";
}

function productHasAvailableStock(productId: string): boolean {
  return mockInventory.some(
    (row) => row.productId === productId && getAvailableQuantity(row) > 0,
  );
}

function matchesQuery(product: Product, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [
    product.name,
    product.slug,
    product.sku,
    product.shortDescription,
    product.description,
    product.brand ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function sortProducts(products: Product[], sort: ProductSort = "newest"): Product[] {
  const copy = [...products];

  switch (sort) {
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "newest":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

function attachProductRelations(product: Product): ProductWithRelations {
  return {
    ...product,
    category: mockCategories.find((category) => category.id === product.categoryId) ?? null,
    images: mockImages
      .filter((image) => image.productId === product.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    variants: mockVariants
      .filter((variant) => variant.productId === product.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    inventory: mockInventory.filter((row) => row.productId === product.id),
  };
}

export function getCategories(): Category[] {
  return [...mockCategories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryBySlug(slug: string): Category | null {
  return mockCategories.find((category) => category.slug === slug) ?? null;
}

export function getProducts(options: GetProductsOptions = {}): Product[] {
  const category = options.categorySlug
    ? getCategoryBySlug(options.categorySlug)
    : null;

  if (options.categorySlug && !category) {
    return [];
  }

  let results = mockProducts.filter(isPublishedProduct);

  if (category) {
    results = results.filter((product) => product.categoryId === category.id);
  }

  if (options.query) {
    results = results.filter((product) => matchesQuery(product, options.query!));
  }

  if (options.featured === true) {
    results = results.filter((product) => product.featured);
  }

  if (options.inStock === true) {
    results = results.filter((product) => productHasAvailableStock(product.id));
  }

  return sortProducts(results, options.sort);
}

export function getProductBySlug(slug: string): ProductWithRelations | null {
  const product = mockProducts.find(
    (item) => item.slug === slug && isPublishedProduct(item),
  );

  if (!product) {
    return null;
  }

  return attachProductRelations(product);
}

export function getProductById(id: string): ProductWithRelations | null {
  const product = mockProducts.find((item) => item.id === id);

  if (!product) {
    return null;
  }

  return attachProductRelations(product);
}

export function searchProducts(
  query: string,
  options: Omit<GetProductsOptions, "query"> = {},
): Product[] {
  return getProducts({ ...options, query });
}

export function getRelatedProducts(
  productSlug: string,
  limit = 4,
): Product[] {
  const product = mockProducts.find((item) => item.slug === productSlug);

  if (!product) {
    return [];
  }

  return getProducts({
    sort: "name-asc",
  })
    .filter(
      (item) =>
        item.id !== product.id && item.categoryId === product.categoryId,
    )
    .slice(0, limit);
}

export function getKits(options: { featured?: boolean } = {}): Kit[] {
  let results = mockKits.filter(isPublishedKit);

  if (options.featured === true) {
    results = results.filter((kit) => kit.featured);
  }

  return [...results].sort((a, b) => a.name.localeCompare(b.name));
}

export function getKitBySlug(slug: string): Kit | null {
  return (
    mockKits.find((kit) => kit.slug === slug && isPublishedKit(kit)) ?? null
  );
}

export function getKitComponents(kitId: string): KitComponent[] {
  return mockKitComponents.filter((component) => component.kitId === kitId);
}

export function getProjects(
  options: { featured?: boolean; skillLevel?: RobotProject["skillLevel"] } = {},
): RobotProject[] {
  let results = mockProjects.filter(isPublishedProject);

  if (options.featured === true) {
    results = results.filter((project) => project.featured);
  }

  if (options.skillLevel) {
    results = results.filter(
      (project) => project.skillLevel === options.skillLevel,
    );
  }

  return [...results].sort((a, b) => a.name.localeCompare(b.name));
}

export function getProjectBySlug(slug: string): RobotProject | null {
  return (
    mockProjects.find(
      (project) => project.slug === slug && isPublishedProject(project),
    ) ?? null
  );
}

export function getProjectComponents(projectId: string): ProjectComponent[] {
  return mockProjectComponents.filter(
    (component) => component.projectId === projectId,
  );
}

export function getVariantsForProduct(productId: string): ProductVariant[] {
  return mockVariants
    .filter((variant) => variant.productId === productId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getImagesForProduct(productId: string): ProductImage[] {
  return mockImages
    .filter((image) => image.productId === productId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getInventoryForProduct(productId: string): InventorySummary[] {
  return mockInventory.filter((row) => row.productId === productId);
}

export function getInventoryForSku(sku: string): InventorySummary | null {
  return mockInventory.find((row) => row.sku === sku) ?? null;
}

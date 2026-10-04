/**
 * Catalog access helpers backed by D1 via Drizzle.
 *
 * Pages and components should import from here (or `@/lib/catalog`), not
 * query `lib/db/schema` tables directly — this is the one place catalog
 * read logic lives (AGENTS.md "Business logic should not be duplicated").
 *
 * Every function takes a `db: Database` first (see `lib/db/request.ts`'s
 * `getRequestDb()`), because a D1 binding is only available per-request —
 * there is no module-level database singleton.
 *
 * `lib/cart/calculations.ts` deliberately does NOT use this file — the
 * client-side cart needs synchronous pricing, which a real DB call can't
 * give it. That's unwired here on purpose; see that file's comment and
 * tasks/phase-12-wire-up/78-real-cart-orders.md.
 */

import { and, eq, inArray, ne } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { categories } from "@/lib/db/schema/categories";
import { inventory } from "@/lib/db/schema/inventory";
import { kitComponents } from "@/lib/db/schema/kit-components";
import { kits } from "@/lib/db/schema/kits";
import { productImages } from "@/lib/db/schema/product-images";
import { productVariants } from "@/lib/db/schema/product-variants";
import { products } from "@/lib/db/schema/products";
import { projectComponents } from "@/lib/db/schema/project-components";
import { robotProjects } from "@/lib/db/schema/robot-projects";
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

function sortProducts(rows: Product[], sort: ProductSort = "newest"): Product[] {
  const copy = [...rows];

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

async function attachProductRelations(
  db: Database,
  product: Product,
): Promise<ProductWithRelations> {
  const [category, images, variants, inventoryRows] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(eq(categories.id, product.categoryId))
      .then((rows) => rows[0] ?? null),
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(productImages.sortOrder),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id))
      .orderBy(productVariants.sortOrder),
    db.select().from(inventory).where(eq(inventory.productId, product.id)),
  ]);

  return { ...product, category, images, variants, inventory: inventoryRows };
}

export async function getCategories(db: Database): Promise<Category[]> {
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function getCategoryBySlug(
  db: Database,
  slug: string,
): Promise<Category | null> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug));
  return rows[0] ?? null;
}

export async function getProducts(
  db: Database,
  options: GetProductsOptions = {},
): Promise<Product[]> {
  const category = options.categorySlug
    ? await getCategoryBySlug(db, options.categorySlug)
    : null;

  if (options.categorySlug && !category) {
    return [];
  }

  const conditions = [eq(products.status, "PUBLISHED")];
  if (category) {
    conditions.push(eq(products.categoryId, category.id));
  }
  if (options.featured === true) {
    conditions.push(eq(products.featured, true));
  }

  let results = await db
    .select()
    .from(products)
    .where(and(...conditions));

  if (options.query) {
    results = results.filter((product) => matchesQuery(product, options.query!));
  }

  if (options.inStock === true) {
    const ids = results.map((product) => product.id);
    const inventoryRows = ids.length
      ? await db.select().from(inventory).where(inArray(inventory.productId, ids))
      : [];
    const availableByProduct = new Map<string, number>();
    for (const row of inventoryRows) {
      availableByProduct.set(
        row.productId,
        (availableByProduct.get(row.productId) ?? 0) + getAvailableQuantity(row),
      );
    }
    results = results.filter((product) => (availableByProduct.get(product.id) ?? 0) > 0);
  }

  return sortProducts(results, options.sort);
}

export async function getProductBySlug(
  db: Database,
  slug: string,
): Promise<ProductWithRelations | null> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, "PUBLISHED")));
  const product = rows[0];

  if (!product) {
    return null;
  }

  return attachProductRelations(db, product);
}

export async function getProductById(
  db: Database,
  id: string,
): Promise<ProductWithRelations | null> {
  const rows = await db.select().from(products).where(eq(products.id, id));
  const product = rows[0];

  if (!product) {
    return null;
  }

  return attachProductRelations(db, product);
}

export async function searchProducts(
  db: Database,
  query: string,
  options: Omit<GetProductsOptions, "query"> = {},
): Promise<Product[]> {
  return getProducts(db, { ...options, query });
}

export async function getRelatedProducts(
  db: Database,
  productSlug: string,
  limit = 4,
): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.slug, productSlug));
  const product = rows[0];

  if (!product) {
    return [];
  }

  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, "PUBLISHED"),
        eq(products.categoryId, product.categoryId),
        ne(products.id, product.id),
      ),
    )
    .orderBy(products.name)
    .limit(limit);
}

export async function getKits(
  db: Database,
  options: { featured?: boolean } = {},
): Promise<Kit[]> {
  const conditions = [eq(kits.status, "PUBLISHED")];
  if (options.featured === true) {
    conditions.push(eq(kits.featured, true));
  }

  const rows = await db
    .select()
    .from(kits)
    .where(and(...conditions));
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getKitBySlug(db: Database, slug: string): Promise<Kit | null> {
  const rows = await db
    .select()
    .from(kits)
    .where(and(eq(kits.slug, slug), eq(kits.status, "PUBLISHED")));
  return rows[0] ?? null;
}

export async function getKitComponents(
  db: Database,
  kitId: string,
): Promise<KitComponent[]> {
  return db.select().from(kitComponents).where(eq(kitComponents.kitId, kitId));
}

/** Batched version for admin list pages — one query, not one per kit. */
export async function getKitComponentsForKits(
  db: Database,
  kitIds: string[],
): Promise<KitComponent[]> {
  if (kitIds.length === 0) {
    return [];
  }
  return db.select().from(kitComponents).where(inArray(kitComponents.kitId, kitIds));
}

export async function getProjects(
  db: Database,
  options: { featured?: boolean; skillLevel?: RobotProject["skillLevel"] } = {},
): Promise<RobotProject[]> {
  const conditions = [eq(robotProjects.status, "PUBLISHED")];
  if (options.featured === true) {
    conditions.push(eq(robotProjects.featured, true));
  }
  if (options.skillLevel) {
    conditions.push(eq(robotProjects.skillLevel, options.skillLevel));
  }

  const rows = await db
    .select()
    .from(robotProjects)
    .where(and(...conditions));
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProjectBySlug(
  db: Database,
  slug: string,
): Promise<RobotProject | null> {
  const rows = await db
    .select()
    .from(robotProjects)
    .where(and(eq(robotProjects.slug, slug), eq(robotProjects.status, "PUBLISHED")));
  return rows[0] ?? null;
}

export async function getProjectComponents(
  db: Database,
  projectId: string,
): Promise<ProjectComponent[]> {
  return db
    .select()
    .from(projectComponents)
    .where(eq(projectComponents.projectId, projectId));
}

/** Batched version for admin list pages — one query, not one per project. */
export async function getProjectComponentsForProjects(
  db: Database,
  projectIds: string[],
): Promise<ProjectComponent[]> {
  if (projectIds.length === 0) {
    return [];
  }
  return db
    .select()
    .from(projectComponents)
    .where(inArray(projectComponents.projectId, projectIds));
}

export async function getVariantsForProduct(
  db: Database,
  productId: string,
): Promise<ProductVariant[]> {
  return db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId))
    .orderBy(productVariants.sortOrder);
}

export async function getImagesForProduct(
  db: Database,
  productId: string,
): Promise<ProductImage[]> {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.sortOrder);
}

export async function getInventoryForProduct(
  db: Database,
  productId: string,
): Promise<InventorySummary[]> {
  return db.select().from(inventory).where(eq(inventory.productId, productId));
}

export async function getInventoryForSku(
  db: Database,
  sku: string,
): Promise<InventorySummary | null> {
  const rows = await db.select().from(inventory).where(eq(inventory.sku, sku));
  return rows[0] ?? null;
}

export type ProductCardModel = {
  product: Product;
  imageUrl: string | null;
  imageAlt: string;
  availableQuantity: number;
};

function buildProductCardModel(
  product: Product,
  images: ProductImage[],
  inventoryRows: InventorySummary[],
): ProductCardModel {
  const availableQuantity = inventoryRows.reduce(
    (sum, row) => sum + getAvailableQuantity(row),
    0,
  );
  const primaryImage = images[0];

  return {
    product,
    imageUrl: primaryImage?.url ?? null,
    imageAlt: primaryImage?.alt ?? product.name,
    availableQuantity,
  };
}

/**
 * Batched version of building product card data for a list of products —
 * two queries total (images, inventory), not one pair per product
 * (AGENTS.md "Avoid N+1 query patterns"). Use this for any product grid.
 */
export async function getProductCardModels(
  db: Database,
  productList: Product[],
): Promise<ProductCardModel[]> {
  if (productList.length === 0) {
    return [];
  }

  const ids = productList.map((product) => product.id);
  const [images, inventoryRows] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, ids))
      .orderBy(productImages.sortOrder),
    db.select().from(inventory).where(inArray(inventory.productId, ids)),
  ]);

  const imagesByProduct = new Map<string, ProductImage[]>();
  for (const image of images) {
    const list = imagesByProduct.get(image.productId) ?? [];
    list.push(image);
    imagesByProduct.set(image.productId, list);
  }

  const inventoryByProduct = new Map<string, InventorySummary[]>();
  for (const row of inventoryRows) {
    const list = inventoryByProduct.get(row.productId) ?? [];
    list.push(row);
    inventoryByProduct.set(row.productId, list);
  }

  return productList.map((product) =>
    buildProductCardModel(
      product,
      imagesByProduct.get(product.id) ?? [],
      inventoryByProduct.get(product.id) ?? [],
    ),
  );
}

export type RequirementLine = {
  id: string;
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
  optional: boolean;
  unitPrice: number;
  lineTotal: number;
  availableQuantity: number;
  lowStockThreshold: number;
  imageUrl: string | null;
  imageAlt: string;
};

async function resolveRequirementLine(
  db: Database,
  input: {
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
    optional?: boolean;
  },
): Promise<RequirementLine | null> {
  const productRows = await db
    .select()
    .from(products)
    .where(and(eq(products.id, input.productId), eq(products.status, "PUBLISHED")));
  const product = productRows[0];

  if (!product) {
    return null;
  }

  const [variantRows, inventoryRows, imageRows] = await Promise.all([
    input.variantId
      ? db
          .select()
          .from(productVariants)
          .where(
            and(
              eq(productVariants.id, input.variantId),
              eq(productVariants.productId, product.id),
            ),
          )
      : Promise.resolve([]),
    db.select().from(inventory).where(eq(inventory.productId, product.id)),
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(productImages.sortOrder)
      .limit(1),
  ]);

  const variant = variantRows[0] ?? null;
  const inventoryRow = variant
    ? (inventoryRows.find((row) => row.variantId === variant.id) ?? null)
    : (inventoryRows.find((row) => row.variantId === null) ?? inventoryRows[0] ?? null);

  const availableQuantity = inventoryRow
    ? getAvailableQuantity(inventoryRow)
    : inventoryRows.reduce((sum, row) => sum + getAvailableQuantity(row), 0);

  const unitPrice = variant?.price ?? product.price;
  const primaryImage = imageRows[0];

  return {
    id: input.id,
    product,
    variant,
    quantity: input.quantity,
    optional: Boolean(input.optional),
    unitPrice,
    lineTotal: unitPrice * input.quantity,
    availableQuantity,
    lowStockThreshold: inventoryRow?.lowStockThreshold ?? 5,
    imageUrl: primaryImage?.url ?? null,
    imageAlt: primaryImage?.alt ?? product.name,
  };
}

export async function getKitRequirementLines(
  db: Database,
  kitId: string,
): Promise<RequirementLine[]> {
  const components = await getKitComponents(db, kitId);
  const lines = await Promise.all(
    components.map((component) =>
      resolveRequirementLine(db, {
        id: component.id,
        productId: component.productId,
        variantId: component.variantId,
        quantity: component.quantity,
      }),
    ),
  );

  return lines.filter((line): line is RequirementLine => line !== null);
}

export async function getProjectRequirementLines(
  db: Database,
  projectId: string,
): Promise<RequirementLine[]> {
  const components = await getProjectComponents(db, projectId);
  const lines = await Promise.all(
    components.map((component) =>
      resolveRequirementLine(db, {
        id: component.id,
        productId: component.productId,
        variantId: component.variantId,
        quantity: component.quantity,
        optional: component.optional,
      }),
    ),
  );

  return lines.filter((line): line is RequirementLine => line !== null);
}

export async function getKitLinkedProject(
  db: Database,
  kit: Kit,
): Promise<RobotProject | null> {
  if (!kit.projectId) {
    return null;
  }

  const rows = await db
    .select()
    .from(robotProjects)
    .where(
      and(eq(robotProjects.id, kit.projectId), eq(robotProjects.status, "PUBLISHED")),
    );
  return rows[0] ?? null;
}

export async function getProjectLinkedKit(
  db: Database,
  projectId: string,
): Promise<Kit | null> {
  const rows = await db
    .select()
    .from(kits)
    .where(and(eq(kits.projectId, projectId), eq(kits.status, "PUBLISHED")));
  return rows[0] ?? null;
}

export function sumRequirementLineTotals(lines: RequirementLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}

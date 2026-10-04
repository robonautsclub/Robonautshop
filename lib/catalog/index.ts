/**
 * Public catalog module.
 *
 * Prefer importing helpers from here in app code. Implementation reads from
 * D1 via Drizzle (lib/catalog/queries.ts) — every function takes a
 * `db: Database` first argument (see `getRequestDb()` in lib/db/request.ts).
 */

export type {
  Category,
  InventorySummary,
  Kit,
  KitComponent,
  Product,
  ProductImage,
  ProductStatus,
  ProductVariant,
  ProjectComponent,
  ProjectSkillLevel,
  RobotProject,
} from "@/lib/catalog/types";

export { getAvailableQuantity } from "@/lib/catalog/types";
export { formatBdt } from "@/lib/catalog/money";

export type {
  GetProductsOptions,
  ProductCardModel,
  ProductSort,
  ProductWithRelations,
  RequirementLine,
} from "@/lib/catalog/queries";

export {
  getCategories,
  getCategoryBySlug,
  getImagesForProduct,
  getInventoryForProduct,
  getInventoryForSku,
  getKitBySlug,
  getKitComponents,
  getKitComponentsForKits,
  getKitLinkedProject,
  getKitRequirementLines,
  getKits,
  getProductById,
  getProductBySlug,
  getProductCardModels,
  getProducts,
  getProjectBySlug,
  getProjectComponents,
  getProjectComponentsForProjects,
  getProjectLinkedKit,
  getProjectRequirementLines,
  getProjects,
  getRelatedProducts,
  getVariantsForProduct,
  searchProducts,
  sumRequirementLineTotals,
} from "@/lib/catalog/queries";

/**
 * Public catalog module.
 *
 * Prefer importing helpers from here in app code.
 * Implementation currently uses seeded Faker mock data and will later
 * call D1/API without changing these export names where possible.
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
} from "@/lib/catalog/queries";

export {
  getCategories,
  getCategoryBySlug,
  getImagesForProduct,
  getInventoryForProduct,
  getInventoryForSku,
  getKitBySlug,
  getKitComponents,
  getKits,
  getProductById,
  getProductBySlug,
  getProducts,
  getProjectBySlug,
  getProjectComponents,
  getProjects,
  getRelatedProducts,
  getVariantsForProduct,
  searchProducts,
  toProductCardModel,
} from "@/lib/catalog/queries";
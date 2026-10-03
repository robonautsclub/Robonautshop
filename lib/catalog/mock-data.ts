import { generateMockCatalog } from "@/lib/catalog/generate-mock-catalog";

/**
 * Seeded development fixture catalog.
 * Generated once at module load so IDs stay stable for the process lifetime.
 */
const catalog = generateMockCatalog();

export const mockCategories = catalog.categories;
export const mockProducts = catalog.products;
export const mockVariants = catalog.variants;
export const mockImages = catalog.images;
export const mockInventory = catalog.inventory;
export const mockKits = catalog.kits;
export const mockKitComponents = catalog.kitComponents;
export const mockProjects = catalog.projects;
export const mockProjectComponents = catalog.projectComponents;

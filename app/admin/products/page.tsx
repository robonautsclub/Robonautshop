import { AdminProductsShell } from "@/components/admin/admin-products-shell";
import {
  listAdminCategories,
  listAdminProductImages,
  listAdminProducts,
  listAdminVariants,
} from "@/lib/admin";
import { getRequestDb } from "@/lib/db/request";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const db = await getRequestDb();
  const [productRows, categoryRows, variants, images] = await Promise.all([
    listAdminProducts(db),
    listAdminCategories(db),
    listAdminVariants(db),
    listAdminProductImages(db),
  ]);
  const categoryNameById = new Map(
    categoryRows.map((category) => [category.id, category.name]),
  );
  const products = productRows.map((product) => ({
    ...product,
    categoryName: categoryNameById.get(product.categoryId) ?? "Unknown",
  }));
  const categories = categoryRows.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <AdminProductsShell
      products={products}
      categories={categories}
      variants={variants}
      images={images}
    />
  );
}

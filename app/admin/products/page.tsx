import { AdminProductsShell } from "@/components/admin/admin-products-shell";
import {
  getAdminCategoryName,
  listAdminCategories,
  listAdminProducts,
} from "@/lib/admin";

export default function AdminProductsPage() {
  const products = listAdminProducts().map((product) => ({
    ...product,
    categoryName: getAdminCategoryName(product.categoryId),
  }));
  const categories = listAdminCategories().map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return <AdminProductsShell products={products} categories={categories} />;
}

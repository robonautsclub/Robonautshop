import { AdminCategoriesShell } from "@/components/admin/admin-categories-shell";
import { listAdminCategories } from "@/lib/admin";
import { getRequestDb } from "@/lib/db/request";

export default async function AdminCategoriesPage() {
  const db = await getRequestDb();
  const categories = await listAdminCategories(db);

  return <AdminCategoriesShell categories={categories} />;
}

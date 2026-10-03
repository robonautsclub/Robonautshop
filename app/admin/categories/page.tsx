import { AdminCategoriesShell } from "@/components/admin/admin-categories-shell";
import { listAdminCategories } from "@/lib/admin";

export default function AdminCategoriesPage() {
  return <AdminCategoriesShell categories={listAdminCategories()} />;
}

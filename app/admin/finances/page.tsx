import { requirePermission } from "@/lib/auth/session";
import { AdminFinancesContent } from "@/components/admin/admin-finances-content";

export default async function AdminFinancesPage() {
  await requirePermission("analytics.view");
  return <AdminFinancesContent />;
}

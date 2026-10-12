import { requirePermission } from "@/lib/auth/session";
import { AdminCustomersShell } from "@/components/admin/admin-customers-shell";
import { listAdminCustomers } from "@/lib/admin";

export default async function AdminCustomersPage() {
  await requirePermission("customers.view");
  return <AdminCustomersShell customers={listAdminCustomers()} />;
}

import { AdminCustomersShell } from "@/components/admin/admin-customers-shell";
import { listAdminCustomers } from "@/lib/admin";

export default function AdminCustomersPage() {
  return <AdminCustomersShell customers={listAdminCustomers()} />;
}

import { AdminInventoryShell } from "@/components/admin/admin-inventory-shell";
import { listAdminInventory } from "@/lib/admin";

export default function AdminInventoryPage() {
  return <AdminInventoryShell rows={listAdminInventory()} />;
}

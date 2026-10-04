import { AdminInventoryShell } from "@/components/admin/admin-inventory-shell";
import { listAdminInventory } from "@/lib/admin";
import { getRequestDb } from "@/lib/db/request";

export default async function AdminInventoryPage() {
  const db = await getRequestDb();
  const rows = await listAdminInventory(db);

  return <AdminInventoryShell rows={rows} />;
}

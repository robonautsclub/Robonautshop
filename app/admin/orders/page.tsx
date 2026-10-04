import { AdminOrdersShell } from "@/components/admin/admin-orders-shell";
import { listAdminOrders, listAdminProducts } from "@/lib/admin";
import { getRequestDb } from "@/lib/db/request";

export default async function AdminOrdersPage() {
  const db = await getRequestDb();
  const products = await listAdminProducts(db);

  return <AdminOrdersShell orders={listAdminOrders()} products={products} />;
}

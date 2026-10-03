import { AdminOrdersShell } from "@/components/admin/admin-orders-shell";
import { listAdminOrders } from "@/lib/admin";

export default function AdminOrdersPage() {
  return <AdminOrdersShell orders={listAdminOrders()} />;
}

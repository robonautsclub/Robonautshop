import { AdminOrdersShell } from "@/components/admin/admin-orders-shell";
import { listAdminOrders, listAdminProducts } from "@/lib/admin";
import { mapRealOrderToAdminOrder } from "@/lib/admin/map-real-order";
import { getRequestDb } from "@/lib/db/request";
import { listOrdersForAdmin } from "@/lib/server-cart/order-queries";

export default async function AdminOrdersPage() {
  const db = await getRequestDb();
  const [products, realOrders] = await Promise.all([
    listAdminProducts(db),
    listOrdersForAdmin(db),
  ]);

  const mappedReal = realOrders.map(mapRealOrderToAdminOrder);
  // Real D1 orders first (receipt download works); demo fixtures after.
  const orders = [...mappedReal, ...listAdminOrders()];

  return <AdminOrdersShell orders={orders} products={products} />;
}

import { AdminOrdersShell } from "@/components/admin/admin-orders-shell";
import { listAdminOrders, listAdminProducts } from "@/lib/admin";
import { mapRealOrderToAdminOrder } from "@/lib/admin/map-real-order";
import { getRequestDb } from "@/lib/db/request";
import {
  matchesAdminOrderFilters,
  parseAdminOrderFilters,
} from "@/lib/orders/admin-filters";
import { listOrdersForAdmin } from "@/lib/server-cart/order-queries";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseAdminOrderFilters(await searchParams);
  const db = await getRequestDb();
  const [products, realOrders] = await Promise.all([
    listAdminProducts(db),
    listOrdersForAdmin(db, filters),
  ]);

  const mappedReal = realOrders.map(mapRealOrderToAdminOrder);
  // Real D1 orders (filtered in SQL) first; demo fixtures after, filtered by
  // the same rules in memory since they aren't in the database.
  const fixtures = listAdminOrders().filter((order) => matchesAdminOrderFilters(order, filters));
  const orders = [...mappedReal, ...fixtures];

  return <AdminOrdersShell orders={orders} products={products} filters={filters} />;
}

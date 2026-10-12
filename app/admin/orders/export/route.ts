import { csvResponse } from "@/lib/admin/csv-response";
import { requirePermission } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { parseAdminOrderFilters } from "@/lib/orders/admin-filters";
import { listOrdersForAdmin } from "@/lib/server-cart/order-queries";

export const dynamic = "force-dynamic";

const HEADERS = [
  "Order ID",
  "Placed at",
  "Customer",
  "Email",
  "Phone",
  "City",
  "Order status",
  "Payment status",
  "Payment method",
  "Items",
  "Subtotal (BDT)",
  "Discount (BDT)",
  "Delivery (BDT)",
  "Total (BDT)",
  "Coupon",
  "bKash transaction",
];

/**
 * GET /admin/orders/export?… — the orders table as CSV, using the same URL
 * filters as the page. Real (database) orders only; demo fixtures are not
 * exported. Needs orders.manage.
 */
export async function GET(request: Request) {
  await requirePermission("orders.manage");

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const filters = parseAdminOrderFilters(params);
  const db = await getRequestDb();
  const orders = await listOrdersForAdmin(db, filters);

  return csvResponse(
    "orders",
    HEADERS,
    orders.map(({ order, items, customer }) => [
      order.id,
      order.createdAt,
      order.shippingFullName,
      customer.email,
      order.shippingPhone,
      order.shippingCity,
      order.status,
      order.paymentStatus,
      order.paymentMethod,
      items.reduce((sum, item) => sum + item.quantity, 0),
      order.subtotal,
      order.discountTotal,
      order.shippingTotal,
      order.total,
      order.couponCode,
      order.bkashTransactionId,
    ]),
  );
}

import type {
  AdminOrder,
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/lib/admin/mock-orders";
import type { AdminOrderDetail } from "@/lib/server-cart/order-queries";

/** Map a real D1 order into the admin orders shell shape. */
export function mapRealOrderToAdminOrder(result: AdminOrderDetail): AdminOrder {
  const { order, items, customer } = result;
  return {
    id: order.id,
    placedAt: order.createdAt,
    customerName: customer.name,
    customerEmail: customer.email,
    city: order.shippingCity,
    orderStatus: order.status as AdminOrderStatus,
    paymentStatus: order.paymentStatus as AdminPaymentStatus,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    deliveryCharge: order.shippingTotal,
    total: order.total,
    lines: items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    specialInstructions: order.specialInstructions ?? undefined,
    invoiceAvailable: true,
  };
}

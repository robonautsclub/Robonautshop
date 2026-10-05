import { notFound } from "next/navigation";

import { AdminOrderDetailShell } from "@/components/admin/admin-order-detail-shell";
import {
  getAdminOrderById,
  type AdminOrder,
  type AdminOrderStatus,
  type AdminPaymentStatus,
} from "@/lib/admin";
import { getRequestDb } from "@/lib/db/request";
import { getOrderForAdmin } from "@/lib/server-cart/order-queries";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

function mapRealOrderToAdminOrder(
  result: NonNullable<Awaited<ReturnType<typeof getOrderForAdmin>>>,
): AdminOrder {
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
  };
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const mockOrder = getAdminOrderById(id);

  if (mockOrder) {
    return <AdminOrderDetailShell order={mockOrder} invoiceAvailable={false} />;
  }

  const db = await getRequestDb();
  const real = await getOrderForAdmin(db, id);
  if (!real) {
    notFound();
  }

  return (
    <AdminOrderDetailShell
      order={mapRealOrderToAdminOrder(real)}
      invoiceAvailable
    />
  );
}

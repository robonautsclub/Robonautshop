import { notFound } from "next/navigation";

import { AdminOrderDetailShell } from "@/components/admin/admin-order-detail-shell";
import { AdminOrderStatusControl } from "@/components/admin/admin-order-status-control";
import { getAdminOrderById } from "@/lib/admin";
import { mapRealOrderToAdminOrder } from "@/lib/admin/map-real-order";
import { getRequestDb } from "@/lib/db/request";
import { getNextOrderStatuses } from "@/lib/orders/status-rules";
import { getOrderForAdmin } from "@/lib/server-cart/order-queries";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const mockOrder = getAdminOrderById(id);

  if (mockOrder) {
    return (
      <AdminOrderDetailShell
        order={{ ...mockOrder, invoiceAvailable: false }}
      />
    );
  }

  const db = await getRequestDb();
  const real = await getOrderForAdmin(db, id);
  if (!real) {
    notFound();
  }

  return (
    <AdminOrderDetailShell
      order={mapRealOrderToAdminOrder(real)}
      statusControl={
        <AdminOrderStatusControl
          key={real.order.status}
          orderId={real.order.id}
          nextStatuses={getNextOrderStatuses(real.order.status, real.order.paymentStatus)}
        />
      }
    />
  );
}

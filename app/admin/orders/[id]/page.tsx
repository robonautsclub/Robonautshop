import { notFound } from "next/navigation";

import { AdminOrderDetailShell } from "@/components/admin/admin-order-detail-shell";
import { getAdminOrderById } from "@/lib/admin";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return <AdminOrderDetailShell order={order} />;
}

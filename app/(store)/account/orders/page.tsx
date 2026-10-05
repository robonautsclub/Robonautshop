import type { Metadata } from "next";

import { AccountOrdersContent } from "@/components/account/account-orders-content";
import { getServerSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { listOrdersForCustomer } from "@/lib/server-cart/order-queries";

export const metadata: Metadata = {
  title: "Orders",
};

export const dynamic = "force-dynamic";

type AccountOrdersPageProps = {
  searchParams: Promise<{ orderId?: string; paymentError?: string }>;
};

export default async function AccountOrdersPage({
  searchParams,
}: AccountOrdersPageProps) {
  const session = await getServerSession();
  const params = await searchParams;
  const db = await getRequestDb();
  const orders = session
    ? await listOrdersForCustomer(db, session.user.id)
    : [];

  return (
    <AccountOrdersContent
      orders={orders}
      paymentError={params.paymentError ?? null}
      highlightOrderId={params.orderId ?? null}
    />
  );
}

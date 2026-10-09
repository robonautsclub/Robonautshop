import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccountOrderItems } from "@/components/account/account-order-items";
import { RepayBkashButton } from "@/components/account/repay-bkash-button";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { getServerSession } from "@/lib/auth/session";
import { formatBdt } from "@/lib/catalog";
import { getPaymentMethodLabel } from "@/lib/checkout/types";
import { getRequestDb } from "@/lib/db/request";
import { canRepayWithBkash } from "@/lib/orders/repay-rules";
import { getOrderForCustomer } from "@/lib/server-cart/order-queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

type AccountOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Customer order detail (tasks/phase-18-hardening/110). The account layout
 * already requires a session; getOrderForCustomer is scoped to that user,
 * so someone else's order id is a plain 404 — it never reveals that the
 * order exists.
 */
export default async function AccountOrderDetailPage({
  params,
}: AccountOrderDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) {
    notFound();
  }

  const db = await getRequestDb();
  const record = await getOrderForCustomer(db, session.user.id, id);
  if (!record) {
    notFound();
  }

  const { order, items } = record;

  return (
    <PageContainer as="section" className="space-y-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Order {order.id.slice(0, 8)}…
          </h1>
        </div>
        <Link
          href="/account/orders"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back to orders
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-2 rounded-xl border p-5">
          <h2 className="text-sm font-semibold tracking-tight">Status</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Order</dt>
              <dd className="font-medium">{order.status}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Payment</dt>
              <dd className="font-medium">
                {getPaymentMethodLabel(order.paymentMethod)} · {order.paymentStatus}
              </dd>
            </div>
            {order.bkashTransactionId ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">bKash transaction</dt>
                <dd className="break-all font-medium">{order.bkashTransactionId}</dd>
              </div>
            ) : null}
          </dl>
          {canRepayWithBkash(order) ? (
            <div className="border-t pt-3">
              <RepayBkashButton orderId={order.id} />
            </div>
          ) : null}
        </section>

        <section className="space-y-2 rounded-xl border p-5">
          <h2 className="text-sm font-semibold tracking-tight">Delivery address</h2>
          <address className="text-sm not-italic text-muted-foreground">
            <span className="block font-medium text-foreground">{order.shippingFullName}</span>
            <span className="block">{order.shippingPhone}</span>
            <span className="block">{order.shippingAddressLine1}</span>
            {order.shippingAddressLine2 ? (
              <span className="block">{order.shippingAddressLine2}</span>
            ) : null}
            <span className="block">
              {order.shippingCity}
              {order.shippingPostalCode ? ` ${order.shippingPostalCode}` : ""}
            </span>
          </address>
          {order.specialInstructions ? (
            <p className="whitespace-pre-wrap border-t pt-2 text-sm text-muted-foreground">
              {order.specialInstructions}
            </p>
          ) : null}
        </section>
      </div>

      <section className="rounded-xl border p-5">
        <h2 className="text-sm font-semibold tracking-tight">Items</h2>
        <div className="mt-3">
          <AccountOrderItems items={items} />
        </div>
        <dl className="mt-4 space-y-2 border-t pt-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatBdt(order.subtotal)}</dd>
          </div>
          {order.discountTotal > 0 ? (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">
                Discount{order.couponCode ? ` (${order.couponCode})` : ""}
              </dt>
              <dd>−{formatBdt(order.discountTotal)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Delivery charge</dt>
            <dd>{formatBdt(order.shippingTotal)}</dd>
          </div>
          <div className="flex justify-between gap-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatBdt(order.total)}</dd>
          </div>
        </dl>
      </section>
    </PageContainer>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AccountNav } from "@/components/account/account-nav";
import { PageContainer } from "@/components/layout/page-container";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatBdt } from "@/lib/catalog";
import { PAYMENT_METHODS } from "@/lib/checkout/types";
import { repayBkashOrderAction } from "@/lib/server-cart/actions";
import type { CustomerOrderSummary } from "@/lib/server-cart/order-queries";
import { cn } from "@/lib/utils";

type AccountOrdersContentProps = {
  orders: CustomerOrderSummary[];
  paymentError?: string | null;
  highlightOrderId?: string | null;
};

function canRepayBkash(order: CustomerOrderSummary["order"]): boolean {
  return (
    order.paymentMethod === "BKASH" &&
    (order.paymentStatus === "FAILED" ||
      order.paymentStatus === "CANCELLED" ||
      order.paymentStatus === "PENDING")
  );
}

export function AccountOrdersContent({
  orders,
  paymentError,
  highlightOrderId,
}: AccountOrdersContentProps) {
  const router = useRouter();
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(paymentError ?? null);
  const [isPending, startTransition] = useTransition();

  function onRepay(orderId: string) {
    setError(null);
    setPendingOrderId(orderId);
    startTransition(async () => {
      const result = await repayBkashOrderAction(orderId);
      if (!result.ok) {
        setError(result.error);
        setPendingOrderId(null);
        return;
      }
      window.location.assign(result.redirectUrl);
    });
  }

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-2 text-muted-foreground">
            Your order history, including unpaid bKash attempts you can retry.
          </p>
        </div>
        <AccountNav pathname="/account/orders" />
      </div>

      {error ? (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">No orders yet.</p>
          <Link
            href="/products"
            className={cn(buttonVariants(), "mt-4 inline-flex")}
          >
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map(({ order, items }) => {
            const paymentLabel =
              PAYMENT_METHODS.find((method) => method.id === order.paymentMethod)
                ?.label ?? order.paymentMethod;
            const highlighted = highlightOrderId === order.id;
            const repayable = canRepayBkash(order);

            return (
              <li
                key={order.id}
                className={cn(
                  "rounded-xl border p-5",
                  highlighted && "border-foreground",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <h2 className="mt-1 font-semibold tracking-tight">
                      Order {order.id.slice(0, 8)}…
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.status} · {paymentLabel} · {order.paymentStatus}
                    </p>
                  </div>
                  <p className="text-base font-semibold">{formatBdt(order.total)}</p>
                </div>

                <ul className="mt-4 space-y-2 border-t pt-3 text-sm">
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span className="text-muted-foreground">
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatBdt(item.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 text-sm text-muted-foreground">
                  {order.shippingFullName} · {order.shippingCity}
                </p>

                {repayable ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={isPending && pendingOrderId === order.id}
                      onClick={() => onRepay(order.id)}
                    >
                      {isPending && pendingOrderId === order.id
                        ? "Starting bKash…"
                        : "Pay again with bKash"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.refresh()}
                    >
                      Refresh
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </PageContainer>
  );
}

import Link from "next/link";

import { AccountNav } from "@/components/account/account-nav";
import { AccountOrderItems } from "@/components/account/account-order-items";
import { RepayBkashButton } from "@/components/account/repay-bkash-button";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { formatBdt } from "@/lib/catalog";
import { getPaymentMethodLabel } from "@/lib/checkout/types";
import { canRepayWithBkash } from "@/lib/orders/repay-rules";
import type { CustomerOrderSummary } from "@/lib/server-cart/order-queries";
import { cn } from "@/lib/utils";

type AccountOrdersContentProps = {
  orders: CustomerOrderSummary[];
  paymentError?: string | null;
  highlightOrderId?: string | null;
};

export function AccountOrdersContent({
  orders,
  paymentError,
  highlightOrderId,
}: AccountOrdersContentProps) {
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

      {paymentError ? (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {paymentError}
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
            const highlighted = highlightOrderId === order.id;

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
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="underline-offset-4 hover:underline focus-visible:underline"
                      >
                        Order {order.id.slice(0, 8)}…
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.status} · {getPaymentMethodLabel(order.paymentMethod)} ·{" "}
                      {order.paymentStatus}
                    </p>
                  </div>
                  <p className="text-base font-semibold">{formatBdt(order.total)}</p>
                </div>

                <div className="mt-4 border-t pt-3">
                  <AccountOrderItems items={items} />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {order.shippingFullName} · {order.shippingCity}
                  </p>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    View details
                  </Link>
                </div>

                {canRepayWithBkash(order) ? (
                  <div className="mt-4">
                    <RepayBkashButton orderId={order.id} />
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

import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { formatBdt } from "@/lib/catalog";
import { PAYMENT_METHODS } from "@/lib/checkout/types";
import type { OrderItemRecord, OrderRecord } from "@/lib/server-cart/order-queries";
import { cn } from "@/lib/utils";

type OrderConfirmationContentProps = {
  order: OrderRecord;
  items: OrderItemRecord[];
};

export function OrderConfirmationContent({
  order,
  items,
}: OrderConfirmationContentProps) {
  const paymentLabel =
    PAYMENT_METHODS.find((method) => method.id === order.paymentMethod)?.label ??
    order.paymentMethod;

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium text-muted-foreground">
          Order {order.id}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Thanks — your order is confirmed
        </h1>
        <p className="mt-2 text-muted-foreground">
          We’ll update the status here as it’s processed. No payment has been
          charged yet.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border p-5">
            <h2 className="font-semibold tracking-tight">Order details</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Order ID</dt>
                <dd className="font-medium">{order.id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Placed at</dt>
                <dd className="font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Order status</dt>
                <dd className="font-medium">{order.status}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Payment</dt>
                <dd className="font-medium">
                  {paymentLabel} · {order.paymentStatus}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border p-5">
            <h2 className="font-semibold tracking-tight">Deliver to</h2>
            <p className="mt-3 text-sm">{order.shippingFullName}</p>
            <p className="text-sm text-muted-foreground">{order.shippingPhone}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {order.shippingAddressLine1}
              {order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.shippingCity}
              {order.shippingPostalCode ? ` · ${order.shippingPostalCode}` : ""}
            </p>
            {order.shippingLat !== null && order.shippingLng !== null ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Map pin: {order.shippingLat.toFixed(5)}, {order.shippingLng.toFixed(5)}
              </p>
            ) : null}
            <p className="mt-3 text-sm text-muted-foreground">
              {formatBdt(order.shippingTotal)} delivery charge
            </p>
            {order.specialInstructions ? (
              <div className="mt-4 border-t pt-3">
                <p className="text-sm font-medium">Special instructions</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {order.specialInstructions}
                </p>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="h-fit rounded-xl border p-5">
          <h2 className="font-semibold tracking-tight">Items</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-medium">{formatBdt(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBdt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Delivery charge</span>
              <span>{formatBdt(order.shippingTotal)}</span>
            </div>
            <div className="flex justify-between gap-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatBdt(order.total)}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/products" className={cn(buttonVariants(), "w-full")}>
              Continue shopping
            </Link>
            <Link
              href="/account"
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              Go to account
            </Link>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}

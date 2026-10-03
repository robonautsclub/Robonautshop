"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { formatBdt } from "@/lib/catalog";
import { readDemoOrder } from "@/lib/checkout/demo-order-storage";
import { PAYMENT_METHODS, type DemoOrderSnapshot } from "@/lib/checkout/types";
import { cn } from "@/lib/utils";

export function OrderConfirmationContent() {
  const [order, setOrder] = useState<DemoOrderSnapshot | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setOrder(readDemoOrder());
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <PageContainer as="section" className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Order confirmation
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer as="section" className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Order confirmation
        </h1>
        <p className="mt-2 text-muted-foreground">
          No demo order found. Place an order from checkout first.
        </p>
        <Link
          href="/checkout"
          className={cn(buttonVariants(), "mt-6 inline-flex")}
        >
          Go to checkout
        </Link>
      </PageContainer>
    );
  }

  const paymentLabel =
    PAYMENT_METHODS.find((method) => method.id === order.paymentMethod)
      ?.label ?? order.paymentMethod;

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium text-muted-foreground">Demo order</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Thanks — your demo order is confirmed
        </h1>
        <p className="mt-2 text-muted-foreground">
          This confirmation is stored in session storage only. The cart was
          cleared after placing the demo order. No payment was taken.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border p-5">
            <h2 className="font-semibold tracking-tight">Order details</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Demo order ID</dt>
                <dd className="font-medium">{order.demoOrderId}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Placed at</dt>
                <dd className="font-medium">
                  {new Date(order.placedAt).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Payment</dt>
                <dd className="font-medium">{paymentLabel}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border p-5">
            <h2 className="font-semibold tracking-tight">Deliver to</h2>
            <p className="mt-3 text-sm">{order.address.fullName}</p>
            <p className="text-sm text-muted-foreground">{order.address.phone}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {order.address.addressLine1}
              {order.address.addressLine2
                ? `, ${order.address.addressLine2}`
                : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.address.city}
              {order.address.postalCode ? ` · ${order.address.postalCode}` : ""}
            </p>
            {order.location ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Map pin: {order.location.lat.toFixed(5)},{" "}
                {order.location.lng.toFixed(5)}
              </p>
            ) : null}
            <p className="mt-3 text-sm text-muted-foreground">
              {order.shipping.method} · {formatBdt(order.shipping.amount)}{" "}
              delivery charge
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
            {order.lines.map((line) => (
              <li key={line.key} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {line.name} × {line.quantity}
                </span>
                <span className="font-medium">{formatBdt(line.lineTotal)}</span>
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
              <span>{formatBdt(order.shipping.amount)}</span>
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

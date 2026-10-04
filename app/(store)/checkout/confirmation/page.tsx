import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { OrderConfirmationContent } from "@/components/checkout/order-confirmation-content";
import { getServerSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { getOrderForCustomer } from "@/lib/server-cart/order-queries";

export const metadata: Metadata = {
  title: "Order confirmation",
};

type OrderConfirmationPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

/**
 * Reads the real order from D1, scoped to the signed-in customer — guessing
 * another customer's orderId in the URL returns 404, never their order
 * (AGENTS.md "Never trust the browser" extends to authorization, not just
 * price/stock). The /checkout layout already requires a session, but this
 * page re-checks independently rather than assuming it ran.
 */
export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps) {
  const { orderId } = await searchParams;
  const session = await getServerSession();

  if (!session) {
    redirect(`/user/login?callbackUrl=/checkout/confirmation${orderId ? `?orderId=${orderId}` : ""}`);
  }

  if (!orderId) {
    notFound();
  }

  const db = await getRequestDb();
  const result = await getOrderForCustomer(db, session.user.id, orderId);

  if (!result) {
    notFound();
  }

  return <OrderConfirmationContent order={result.order} items={result.items} />;
}

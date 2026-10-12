import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { orderInvoiceFromOrder } from "@/lib/invoice/from-order";
import { invoicePdfResponse } from "@/lib/invoice/pdf-response";
import { getOrderForCustomer } from "@/lib/server-cart/order-queries";

type InvoiceRouteProps = {
  params: Promise<{ id: string }>;
};

/**
 * Owner-only invoice PDF (task 131). getOrderForCustomer is scoped to the
 * session user, so someone else's order id is a plain 404 that never reveals
 * the order exists.
 */
export async function GET(_request: Request, { params }: InvoiceRouteProps) {
  const session = await getServerSession();
  if (!session) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { id } = await params;
  const db = await getRequestDb();
  const record = await getOrderForCustomer(db, session.user.id, id);
  if (!record) {
    return new NextResponse("Not found", { status: 404 });
  }

  return invoicePdfResponse(
    orderInvoiceFromOrder(record.order, record.items, {
      name: session.user.name,
      email: session.user.email,
    }),
  );
}

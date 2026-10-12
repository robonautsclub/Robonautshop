import { NextResponse } from "next/server";

import { getAdminOrderById } from "@/lib/admin";
import { requireAdminSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { orderInvoiceFromAdminOrder, orderInvoiceFromOrder } from "@/lib/invoice/from-order";
import { invoicePdfResponse } from "@/lib/invoice/pdf-response";
import type { OrderInvoice } from "@/lib/invoice/types";
import { getOrderForAdmin } from "@/lib/server-cart/order-queries";

type InvoiceRouteProps = {
  params: Promise<{ id: string }>;
};

/**
 * On-demand PDF receipt for a real D1 order, or a demo fixture order.
 * Bytes are generated in memory — never stored in R2.
 */
export async function GET(_request: Request, { params }: InvoiceRouteProps) {
  await requireAdminSession();

  const { id } = await params;
  let invoice: OrderInvoice | null = null;

  const db = await getRequestDb();
  const real = await getOrderForAdmin(db, id);
  if (real) {
    invoice = orderInvoiceFromOrder(real.order, real.items, real.customer);
  } else {
    const mock = getAdminOrderById(id);
    if (mock) {
      invoice = orderInvoiceFromAdminOrder(mock);
    }
  }

  if (!invoice) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  return invoicePdfResponse(invoice);
}

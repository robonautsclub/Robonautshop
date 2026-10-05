import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { orderInvoiceFromOrder, invoicePdfFilename } from "@/lib/invoice/from-order";
import { renderOrderInvoicePdf } from "@/lib/invoice/pdf";
import { getOrderForAdmin } from "@/lib/server-cart/order-queries";

type InvoiceRouteProps = {
  params: Promise<{ id: string }>;
};

/**
 * On-demand PDF invoice for a real D1 order.
 * Bytes are generated in memory — never stored in R2.
 * Mock admin order ids (e.g. ADM-1001) 404 here by design.
 */
export async function GET(_request: Request, { params }: InvoiceRouteProps) {
  await requireAdminSession();

  const { id } = await params;
  const db = await getRequestDb();
  const result = await getOrderForAdmin(db, id);

  if (!result) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  const invoice = orderInvoiceFromOrder(result.order, result.items, result.customer);
  const pdfBytes = await renderOrderInvoicePdf(invoice);
  const filename = invoicePdfFilename(invoice.orderId);

  // Copy into a fresh ArrayBuffer-backed view for BodyInit typing (pdf-lib's
  // Uint8Array can be ArrayBufferLike / SharedArrayBuffer under TS 5).
  const body = Uint8Array.from(pdfBytes);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

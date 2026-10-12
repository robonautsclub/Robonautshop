import { NextResponse } from "next/server";

import { invoicePdfFilename } from "@/lib/invoice/from-order";
import { renderOrderInvoicePdf } from "@/lib/invoice/pdf";
import type { OrderInvoice } from "@/lib/invoice/types";

/** The one place an invoice becomes an HTTP PDF response (admin and customer routes). */
export async function invoicePdfResponse(invoice: OrderInvoice): Promise<NextResponse> {
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

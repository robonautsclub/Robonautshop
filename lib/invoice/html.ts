import { formatBdt } from "@/lib/catalog/money";
import { escapeHtml } from "@/lib/email/html";
import { shortOrderId } from "@/lib/invoice/from-order";
import type { OrderInvoice } from "@/lib/invoice/types";

function formatInvoiceDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Email-safe branded invoice HTML (table layout + inline CSS).
 * Same content structure as the PDF renderer in lib/invoice/pdf.ts.
 */
export function renderOrderInvoiceHtml(invoice: OrderInvoice): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const shortId = shortOrderId(invoice.orderId);
  const safeName = escapeHtml(invoice.customerName.trim() || "there");

  const linesHtml = invoice.lines
    .map(
      (line) => `
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #e8e8e8; font-size:14px; color:#171717;">
            <div style="font-weight:600;">${escapeHtml(line.productName)}</div>
            <div style="margin-top:2px; font-size:12px; color:#737373;">SKU ${escapeHtml(line.sku)}</div>
          </td>
          <td style="padding:10px 12px; border-bottom:1px solid #e8e8e8; font-size:14px; color:#404040; text-align:center;">${line.quantity}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e8e8e8; font-size:14px; color:#404040; text-align:right;">${escapeHtml(formatBdt(line.unitPrice))}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e8e8e8; font-size:14px; color:#171717; text-align:right; font-weight:600;">${escapeHtml(formatBdt(line.lineTotal))}</td>
        </tr>`,
    )
    .join("");

  const addressLine2 = invoice.shippingAddressLine2
    ? `<br />${escapeHtml(invoice.shippingAddressLine2)}`
    : "";
  const postal = invoice.shippingPostalCode
    ? ` ${escapeHtml(invoice.shippingPostalCode)}`
    : "";

  const discountRow =
    invoice.discountTotal > 0
      ? `
        <tr>
          <td style="padding:6px 0; color:#404040;">Discount${invoice.couponCode ? ` (${escapeHtml(invoice.couponCode)})` : ""}</td>
          <td style="padding:6px 0; text-align:right; color:#171717;">−${escapeHtml(formatBdt(invoice.discountTotal))}</td>
        </tr>`
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${escapeHtml(shortId)}</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#171717;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5; padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border:1px solid #e4e4e7; border-radius:12px; overflow:hidden;">
          <tr>
            <td style="background:#171717; padding:28px 28px 24px;">
              <div style="font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#a3a3a3;">Robonautsshop</div>
              <div style="margin-top:8px; font-size:22px; font-weight:700; color:#ffffff; line-height:1.25;">Invoice / Order confirmation</div>
              <div style="margin-top:8px; font-size:13px; color:#d4d4d4;">Order ${escapeHtml(shortId)} · ${escapeHtml(formatInvoiceDate(invoice.createdAt))}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 20px; font-size:15px; line-height:1.5; color:#404040;">
                Hi ${safeName}, thanks for your order. Here’s your invoice summary.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="50%" valign="top" style="padding-right:12px;">
                    <div style="font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#737373; margin-bottom:8px;">Order details</div>
                    <div style="font-size:13px; line-height:1.6; color:#171717;">
                      <strong>Order ID:</strong> ${escapeHtml(invoice.orderId)}<br />
                      <strong>Status:</strong> ${escapeHtml(invoice.orderStatus)}<br />
                      <strong>Payment:</strong> ${escapeHtml(invoice.paymentMethod)} · ${escapeHtml(invoice.paymentStatus)}
                    </div>
                  </td>
                  <td width="50%" valign="top" style="padding-left:12px;">
                    <div style="font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#737373; margin-bottom:8px;">Bill to</div>
                    <div style="font-size:13px; line-height:1.6; color:#171717;">
                      ${escapeHtml(invoice.customerName)}<br />
                      ${escapeHtml(invoice.customerEmail)}
                    </div>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7; border-radius:8px; overflow:hidden; margin-bottom:20px;">
                <tr style="background:#fafafa;">
                  <th align="left" style="padding:10px 12px; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:#737373; font-weight:600;">Item</th>
                  <th align="center" style="padding:10px 12px; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:#737373; font-weight:600;">Qty</th>
                  <th align="right" style="padding:10px 12px; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:#737373; font-weight:600;">Unit</th>
                  <th align="right" style="padding:10px 12px; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:#737373; font-weight:600;">Total</th>
                </tr>
                ${linesHtml}
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:280px; margin-left:auto; font-size:14px;">
                <tr>
                  <td style="padding:6px 0; color:#404040;">Subtotal</td>
                  <td style="padding:6px 0; text-align:right; color:#171717;">${escapeHtml(formatBdt(invoice.subtotal))}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#404040;">Delivery</td>
                  <td style="padding:6px 0; text-align:right; color:#171717;">${escapeHtml(formatBdt(invoice.shippingTotal))}</td>
                </tr>
                ${discountRow}
                <tr>
                  <td style="padding:12px 0 0; border-top:1px solid #e4e4e7; font-weight:700; font-size:16px;">Total</td>
                  <td style="padding:12px 0 0; border-top:1px solid #e4e4e7; text-align:right; font-weight:700; font-size:16px;">${escapeHtml(formatBdt(invoice.total))}</td>
                </tr>
              </table>

              <div style="margin-top:28px; padding-top:20px; border-top:1px solid #e4e4e7;">
                <div style="font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#737373; margin-bottom:8px;">Deliver to</div>
                <div style="font-size:13px; line-height:1.6; color:#171717;">
                  ${escapeHtml(invoice.shippingFullName)}<br />
                  ${escapeHtml(invoice.shippingPhone)}<br />
                  ${escapeHtml(invoice.shippingAddressLine1)}${addressLine2}<br />
                  ${escapeHtml(invoice.shippingCity)}${postal}
                </div>
              </div>

              ${
                site
                  ? `<p style="margin:28px 0 0; font-size:14px;"><a href="${escapeHtml(site)}/account/orders" style="color:#171717; font-weight:600;">View your orders</a></p>`
                  : ""
              }
              <p style="margin:16px 0 0; font-size:12px; color:#737373;">— Robonautsshop</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

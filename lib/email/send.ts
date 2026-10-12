import { getResendClient, getResendFromAddress } from "@/lib/email/client";
import { escapeHtml } from "@/lib/email/html";
import {
  invoicePdfFilename,
  shortOrderId,
} from "@/lib/invoice/from-order";
import { renderOrderInvoiceHtml } from "@/lib/invoice/html";
import { renderOrderInvoicePdf } from "@/lib/invoice/pdf";
import type { OrderInvoice } from "@/lib/invoice/types";
import { logger } from "@/lib/logger";

export type OrderEmailLine = {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderEmailPayload = {
  to: string;
  customerName: string;
  orderId: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  couponCode?: string | null;
  total: number;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingPostalCode?: string | null;
  lines: OrderEmailLine[];
};

function orderInvoiceFromEmailPayload(payload: OrderEmailPayload): OrderInvoice {
  return {
    orderId: payload.orderId,
    createdAt: payload.createdAt,
    customerName: payload.customerName,
    customerEmail: payload.to,
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentStatus,
    orderStatus: payload.orderStatus,
    subtotal: payload.subtotal,
    shippingTotal: payload.shippingTotal,
    discountTotal: payload.discountTotal,
    couponCode: payload.couponCode,
    total: payload.total,
    shippingFullName: payload.shippingFullName,
    shippingPhone: payload.shippingPhone,
    shippingAddressLine1: payload.shippingAddressLine1,
    shippingAddressLine2: payload.shippingAddressLine2,
    shippingCity: payload.shippingCity,
    shippingPostalCode: payload.shippingPostalCode,
    lines: payload.lines.map((line) => ({
      productName: line.productName,
      sku: line.sku,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
    })),
  };
}

/**
 * Fire-and-forget style send: logs and returns false on failure so order /
 * signup flows are never blocked by mail provider outages.
 */
async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.info(
      "[email] RESEND_API_KEY not configured — skipped send:",
      args.subject,
    );
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: getResendFromAddress(),
      to: args.to,
      subject: args.subject,
      html: args.html,
      attachments: args.attachments,
    });

    if (error) {
      logger.error("email.rejected", undefined, { subject: args.subject, reason: error.message });
      return false;
    }
    return true;
  } catch (error) {
    logger.error("email.send_failed", error, { subject: args.subject });
    return false;
  }
}

export async function sendWelcomeEmail(args: {
  to: string;
  name: string;
}): Promise<boolean> {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const safeName = escapeHtml(args.name.trim() || "there");

  return sendEmail({
    to: args.to,
    subject: "Welcome to Robonautsshop",
    html: `
      <p>Hi ${safeName},</p>
      <p>Thanks for creating a Robonautsshop account. You can browse robotics parts, kits, and projects, then check out when you’re ready.</p>
      ${site ? `<p><a href="${escapeHtml(site)}/account">View your account</a></p>` : ""}
      <p>— Robonautsshop</p>
    `,
  });
}

export async function sendPasswordResetEmail(args: {
  to: string;
  name: string;
  url: string;
}): Promise<boolean> {
  const safeName = escapeHtml(args.name.trim() || "there");

  return sendEmail({
    to: args.to,
    subject: "Reset your Robonautsshop password",
    html: `
      <p>Hi ${safeName},</p>
      <p>We received a request to reset your Robonautsshop password. This link expires in 1 hour and can be used once.</p>
      <p><a href="${escapeHtml(args.url)}">Choose a new password</a></p>
      <p>If you didn’t ask for this, you can ignore this email — your password won’t change.</p>
      <p>— Robonautsshop</p>
    `,
  });
}

export async function sendVerificationEmail(args: {
  to: string;
  name: string;
  url: string;
}): Promise<boolean> {
  const safeName = escapeHtml(args.name.trim() || "there");

  return sendEmail({
    to: args.to,
    subject: "Verify your Robonautsshop email",
    html: `
      <p>Hi ${safeName},</p>
      <p>Please confirm your email address to finish setting up your Robonautsshop account. You need a verified email to place orders.</p>
      <p><a href="${escapeHtml(args.url)}">Verify my email</a></p>
      <p>If you didn’t create this account, you can ignore this email.</p>
      <p>— Robonautsshop</p>
    `,
  });
}

export async function sendOrderCancelledEmail(args: {
  to: string;
  name: string;
  orderId: string;
  refundPending: boolean;
}): Promise<boolean> {
  const safeName = escapeHtml(args.name.trim() || "there");

  return sendEmail({
    to: args.to,
    subject: `Order cancelled · ${shortOrderId(args.orderId)}`,
    html: `
      <p>Hi ${safeName},</p>
      <p>Your order ${escapeHtml(shortOrderId(args.orderId))} has been cancelled as you requested.</p>
      ${
        args.refundPending
          ? "<p>Since you had already paid with bKash, our team will refund the amount manually. We’ll be in touch if we need anything from you.</p>"
          : ""
      }
      <p>— Robonautsshop</p>
    `,
  });
}

export async function sendBackInStockEmail(args: {
  to: string;
  productName: string;
  variantName: string | null;
  productSlug: string;
}): Promise<boolean> {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const label = args.variantName ? `${args.productName} (${args.variantName})` : args.productName;

  return sendEmail({
    to: args.to,
    subject: `Back in stock: ${label}`,
    html: `
      <p>Good news — <strong>${escapeHtml(label)}</strong> is back in stock at Robonautsshop.</p>
      ${site ? `<p><a href="${escapeHtml(site)}/products/${escapeHtml(args.productSlug)}">View the product</a></p>` : ""}
      <p>Stock is limited, so order soon. You’ll only get this email once.</p>
      <p>— Robonautsshop</p>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload,
): Promise<boolean> {
  const invoice = orderInvoiceFromEmailPayload(payload);
  const html = renderOrderInvoiceHtml(invoice);

  let attachments: Array<{ filename: string; content: Buffer }> | undefined;
  try {
    const pdfBytes = await renderOrderInvoicePdf(invoice);
    attachments = [
      {
        filename: invoicePdfFilename(invoice.orderId),
        content: Buffer.from(pdfBytes),
      },
    ];
  } catch (error) {
    logger.error("email.invoice_pdf_failed", error);
  }

  return sendEmail({
    to: payload.to,
    subject: `Order confirmation · ${shortOrderId(payload.orderId)}`,
    html,
    attachments,
  });
}

/** Abandoned cart reminder (tasks/phase-14-advanced/92-abandoned-carts.md). */
export async function sendAbandonedCartReminderEmail(args: {
  to: string;
  name: string;
  itemCount: number;
}): Promise<boolean> {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const safeName = escapeHtml(args.name.trim() || "there");

  return sendEmail({
    to: args.to,
    subject: "You left something in your cart",
    html: `
      <p>Hi ${safeName},</p>
      <p>You still have ${args.itemCount} item${args.itemCount === 1 ? "" : "s"} waiting in your Robonautsshop cart.</p>
      ${site ? `<p><a href="${escapeHtml(site)}/cart">Finish your order</a></p>` : ""}
      <p>— Robonautsshop</p>
    `,
  });
}

export type LowStockAlertLine = {
  sku: string;
  productName: string;
  availableQuantity: number;
  lowStockThreshold: number;
};

/**
 * Low-stock admin alert (tasks/phase-14-advanced/93-inventory-alerts.md).
 * No-ops when ADMIN_ALERT_EMAIL isn't set, same as the Resend API key check.
 */
export async function sendLowStockAlertEmail(lines: LowStockAlertLine[]): Promise<boolean> {
  const to = process.env.ADMIN_ALERT_EMAIL?.trim();
  if (!to || lines.length === 0) {
    return false;
  }

  const rowsHtml = lines
    .map(
      (line) =>
        `<tr>
          <td style="padding:4px 8px 4px 0;">${escapeHtml(line.productName)} (${escapeHtml(line.sku)})</td>
          <td style="padding:4px 0; text-align:right;">${line.availableQuantity} left (threshold ${line.lowStockThreshold})</td>
        </tr>`,
    )
    .join("");

  return sendEmail({
    to,
    subject: `Low stock alert · ${lines.length} item${lines.length === 1 ? "" : "s"}`,
    html: `
      <p>The following items are at or below their low-stock threshold after a recent order:</p>
      <table style="border-collapse:collapse; width:100%; max-width:480px;">${rowsHtml}</table>
      <p style="margin-top:16px;">— Robonautsshop inventory alerts</p>
    `,
  });
}

import { formatBdt } from "@/lib/catalog/money";
import { getResendClient, getResendFromAddress } from "@/lib/email/client";
import { escapeHtml } from "@/lib/email/html";

export type OrderEmailLine = {
  productName: string;
  quantity: number;
  lineTotal: number;
};

export type OrderEmailPayload = {
  to: string;
  customerName: string;
  orderId: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shippingTotal: number;
  total: number;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingPostalCode?: string | null;
  lines: OrderEmailLine[];
};

/**
 * Fire-and-forget style send: logs and returns false on failure so order /
 * signup flows are never blocked by mail provider outages.
 */
async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
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
    });

    if (error) {
      console.error("[email] Resend rejected send:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Resend send failed:", error);
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
    subject: "Welcome to Robonautshop",
    html: `
      <p>Hi ${safeName},</p>
      <p>Thanks for creating a Robonautshop account. You can browse robotics parts, kits, and projects, then check out when you’re ready.</p>
      ${site ? `<p><a href="${escapeHtml(site)}/account">View your account</a></p>` : ""}
      <p>— Robonautshop</p>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload,
): Promise<boolean> {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const linesHtml = payload.lines
    .map(
      (line) =>
        `<tr>
          <td style="padding:4px 8px 4px 0;">${escapeHtml(line.productName)} × ${line.quantity}</td>
          <td style="padding:4px 0; text-align:right;">${escapeHtml(formatBdt(line.lineTotal))}</td>
        </tr>`,
    )
    .join("");

  const addressLine2 = payload.shippingAddressLine2
    ? `, ${escapeHtml(payload.shippingAddressLine2)}`
    : "";
  const postal = payload.shippingPostalCode
    ? ` · ${escapeHtml(payload.shippingPostalCode)}`
    : "";

  return sendEmail({
    to: payload.to,
    subject: `Order confirmation · ${payload.orderId.slice(0, 8)}`,
    html: `
      <p>Hi ${escapeHtml(payload.customerName.trim() || "there")},</p>
      <p>Here’s a summary of your Robonautshop order.</p>
      <p>
        <strong>Order ID:</strong> ${escapeHtml(payload.orderId)}<br />
        <strong>Order status:</strong> ${escapeHtml(payload.orderStatus)}<br />
        <strong>Payment:</strong> ${escapeHtml(payload.paymentMethod)} · ${escapeHtml(payload.paymentStatus)}
      </p>
      <table style="border-collapse:collapse; width:100%; max-width:480px;">
        ${linesHtml}
        <tr>
          <td style="padding:8px 8px 4px 0; border-top:1px solid #ddd;">Subtotal</td>
          <td style="padding:8px 0 4px; border-top:1px solid #ddd; text-align:right;">${escapeHtml(formatBdt(payload.subtotal))}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px 4px 0;">Delivery</td>
          <td style="padding:4px 0; text-align:right;">${escapeHtml(formatBdt(payload.shippingTotal))}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px 4px 0;"><strong>Total</strong></td>
          <td style="padding:4px 0; text-align:right;"><strong>${escapeHtml(formatBdt(payload.total))}</strong></td>
        </tr>
      </table>
      <p style="margin-top:16px;">
        <strong>Deliver to</strong><br />
        ${escapeHtml(payload.shippingFullName)}<br />
        ${escapeHtml(payload.shippingPhone)}<br />
        ${escapeHtml(payload.shippingAddressLine1)}${addressLine2}<br />
        ${escapeHtml(payload.shippingCity)}${postal}
      </p>
      ${site ? `<p><a href="${escapeHtml(site)}/account/orders">View your orders</a></p>` : ""}
      <p>— Robonautshop</p>
    `,
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
      <p>You still have ${args.itemCount} item${args.itemCount === 1 ? "" : "s"} waiting in your Robonautshop cart.</p>
      ${site ? `<p><a href="${escapeHtml(site)}/cart">Finish your order</a></p>` : ""}
      <p>— Robonautshop</p>
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
      <p style="margin-top:16px;">— Robonautshop inventory alerts</p>
    `,
  });
}

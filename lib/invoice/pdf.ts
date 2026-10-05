import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";

import { invoicePdfFilename, shortOrderId } from "@/lib/invoice/from-order";
import { INVOICE_LOGO_PNG_BASE64 } from "@/lib/invoice/logo-base64";
import type { OrderInvoice } from "@/lib/invoice/types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/** Brand blue from the Robonautshop logo — no black fills. */
const brand = rgb(0.145, 0.325, 0.722);
const brandSoft = rgb(0.9, 0.93, 0.98);
const ink = rgb(0.18, 0.22, 0.3);
const muted = rgb(0.45, 0.5, 0.58);
const line = rgb(0.86, 0.89, 0.93);

/**
 * Helvetica (WinAnsi) cannot encode ৳ or many Unicode punctuation marks.
 * Keep PDF amounts ASCII-safe; HTML email still uses formatBdt().
 */
function formatBdtPdf(amount: number): string {
  return `BDT ${amount.toLocaleString("en-BD")}`;
}

/** Map common Unicode to WinAnsi-safe ASCII for StandardFonts. */
function toWinAnsi(text: string): string {
  return text
    .replaceAll("৳", "BDT ")
    .replaceAll("—", "-")
    .replaceAll("–", "-")
    .replaceAll("−", "-")
    .replaceAll("·", "|")
    .replaceAll("…", "...")
    .replaceAll("’", "'")
    .replaceAll("‘", "'")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replace(/[^\x20-\x7E]/g, "?");
}

function formatInvoiceDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color = ink,
) {
  page.drawText(toWinAnsi(text), { x, y, size, font, color });
}

function truncate(font: PDFFont, text: string, size: number, maxWidth: number): string {
  const safe = toWinAnsi(text);
  if (font.widthOfTextAtSize(safe, size) <= maxWidth) {
    return safe;
  }
  let truncated = safe;
  while (truncated.length > 1 && font.widthOfTextAtSize(`${truncated}...`, size) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}...`;
}

/** Workers-safe base64 decode (no Node Buffer required). */
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * On-the-fly PDF invoice — clean layout with logo and blue accents (no black).
 * Returns raw PDF bytes — never stored in R2.
 */
export async function renderOrderInvoicePdf(invoice: OrderInvoice): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let logo: PDFImage | null = null;
  try {
    logo = await doc.embedPng(base64ToBytes(INVOICE_LOGO_PNG_BASE64));
  } catch (error) {
    console.error("[invoice] Failed to embed logo PNG:", error);
  }

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  // ---- Header: logo + brand + title (white background, blue accent) ----
  const logoSize = 44;
  if (logo) {
    page.drawImage(logo, {
      x: MARGIN,
      y: y - logoSize + 6,
      width: logoSize,
      height: logoSize,
    });
  }

  const textX = MARGIN + (logo ? logoSize + 12 : 0);
  drawText(page, "Robonautshop", textX, y - 6, bold, 16, brand);
  drawText(page, "Invoice / Order confirmation", textX, y - 26, bold, 12, ink);
  drawText(
    page,
    `Order ${shortOrderId(invoice.orderId)}  |  ${formatInvoiceDate(invoice.createdAt)}`,
    textX,
    y - 42,
    regular,
    10,
    muted,
  );

  y -= 58;

  // Blue accent line
  page.drawRectangle({
    x: MARGIN,
    y,
    width: CONTENT_WIDTH,
    height: 2.5,
    color: brand,
  });
  y -= 20;

  drawText(
    page,
    `Hi ${invoice.customerName.trim() || "there"}, thanks for your order. Here is your invoice summary.`,
    MARGIN,
    y,
    regular,
    11,
    muted,
  );
  y -= 28;

  // Meta columns
  drawText(page, "ORDER DETAILS", MARGIN, y, bold, 8, brand);
  drawText(page, "BILL TO", MARGIN + CONTENT_WIDTH / 2, y, bold, 8, brand);
  y -= 16;

  const metaLeft = [
    `Order ID: ${invoice.orderId}`,
    `Status: ${invoice.orderStatus}`,
    `Payment: ${invoice.paymentMethod} | ${invoice.paymentStatus}`,
  ];
  const metaRight = [invoice.customerName, invoice.customerEmail];

  for (let i = 0; i < Math.max(metaLeft.length, metaRight.length); i++) {
    if (metaLeft[i]) {
      drawText(
        page,
        truncate(regular, metaLeft[i], 10, CONTENT_WIDTH / 2 - 12),
        MARGIN,
        y,
        regular,
        10,
      );
    }
    if (metaRight[i]) {
      drawText(
        page,
        truncate(regular, metaRight[i], 10, CONTENT_WIDTH / 2 - 12),
        MARGIN + CONTENT_WIDTH / 2,
        y,
        regular,
        10,
      );
    }
    y -= 14;
  }
  y -= 16;

  // Table header — soft blue, not black
  const colItem = MARGIN;
  const colQty = MARGIN + 280;
  const colUnit = MARGIN + 340;
  const colTotal = MARGIN + CONTENT_WIDTH;

  ensureSpace(40);
  page.drawRectangle({
    x: MARGIN,
    y: y - 6,
    width: CONTENT_WIDTH,
    height: 22,
    color: brandSoft,
  });
  drawText(page, "ITEM", colItem + 8, y, bold, 8, brand);
  drawText(page, "QTY", colQty, y, bold, 8, brand);
  drawText(page, "UNIT", colUnit, y, bold, 8, brand);
  const totalLabel = "TOTAL";
  drawText(
    page,
    totalLabel,
    colTotal - bold.widthOfTextAtSize(totalLabel, 8),
    y,
    bold,
    8,
    brand,
  );
  y -= 24;

  for (const item of invoice.lines) {
    ensureSpace(36);
    const name = truncate(bold, item.productName, 10, 250);
    drawText(page, name, colItem + 8, y, bold, 10);
    drawText(page, `SKU ${item.sku}`, colItem + 8, y - 12, regular, 8, muted);

    drawText(page, String(item.quantity), colQty + 4, y - 4, regular, 10);

    const unit = formatBdtPdf(item.unitPrice);
    drawText(page, unit, colUnit, y - 4, regular, 10);

    const total = formatBdtPdf(item.lineTotal);
    const safeTotal = toWinAnsi(total);
    drawText(
      page,
      safeTotal,
      colTotal - bold.widthOfTextAtSize(safeTotal, 10),
      y - 4,
      bold,
      10,
    );

    y -= 28;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: MARGIN + CONTENT_WIDTH, y },
      thickness: 0.5,
      color: line,
    });
    y -= 12;
  }

  y -= 8;
  ensureSpace(90);

  const totalsX = MARGIN + CONTENT_WIDTH - 220;
  const valueX = MARGIN + CONTENT_WIDTH;

  const drawTotalRow = (label: string, value: string, strong = false) => {
    const font = strong ? bold : regular;
    const size = strong ? 12 : 10;
    const safeValue = toWinAnsi(value);
    drawText(page, label, totalsX, y, font, size, strong ? brand : muted);
    drawText(
      page,
      safeValue,
      valueX - font.widthOfTextAtSize(safeValue, size),
      y,
      font,
      size,
      strong ? brand : ink,
    );
    y -= strong ? 18 : 16;
  };

  drawTotalRow("Subtotal", formatBdtPdf(invoice.subtotal));
  drawTotalRow("Delivery", formatBdtPdf(invoice.shippingTotal));
  if (invoice.discountTotal > 0) {
    const label = invoice.couponCode
      ? `Discount (${invoice.couponCode})`
      : "Discount";
    drawTotalRow(label, `-${formatBdtPdf(invoice.discountTotal)}`);
  }
  page.drawLine({
    start: { x: totalsX, y: y + 8 },
    end: { x: valueX, y: y + 8 },
    thickness: 0.75,
    color: brand,
  });
  drawTotalRow("Total", formatBdtPdf(invoice.total), true);

  y -= 12;
  ensureSpace(100);
  page.drawLine({
    start: { x: MARGIN, y: y + 16 },
    end: { x: MARGIN + CONTENT_WIDTH, y: y + 16 },
    thickness: 0.5,
    color: line,
  });
  drawText(page, "DELIVER TO", MARGIN, y, bold, 8, brand);
  y -= 16;

  const shipLines = [
    invoice.shippingFullName,
    invoice.shippingPhone,
    invoice.shippingAddressLine1,
    invoice.shippingAddressLine2,
    `${invoice.shippingCity}${invoice.shippingPostalCode ? ` ${invoice.shippingPostalCode}` : ""}`,
  ].filter((value): value is string => Boolean(value?.trim()));

  for (const shipLine of shipLines) {
    ensureSpace(16);
    drawText(page, truncate(regular, shipLine, 10, CONTENT_WIDTH), MARGIN, y, regular, 10);
    y -= 14;
  }

  y -= 20;
  ensureSpace(20);
  drawText(page, "- Robonautshop", MARGIN, y, regular, 9, muted);

  return doc.save();
}

export { invoicePdfFilename };

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import { invoicePdfFilename, shortOrderId } from "@/lib/invoice/from-order";
import type { OrderInvoice } from "@/lib/invoice/types";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const ink = rgb(0.09, 0.09, 0.09);
const muted = rgb(0.45, 0.45, 0.45);
const line = rgb(0.89, 0.89, 0.91);
const headerBg = rgb(0.09, 0.09, 0.09);
const white = rgb(1, 1, 1);

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
  // ASCII months only — avoids locale-specific Unicode in PDF fonts.
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

/**
 * On-the-fly PDF invoice matching the HTML invoice sections.
 * Returns raw PDF bytes — never stored in R2.
 */
export async function renderOrderInvoicePdf(invoice: OrderInvoice): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  // Header bar
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 110,
    width: PAGE_WIDTH,
    height: 110,
    color: headerBg,
  });
  drawText(page, "ROBONAUTSHOP", MARGIN, PAGE_HEIGHT - 40, regular, 9, rgb(0.64, 0.64, 0.64));
  drawText(page, "Invoice / Order confirmation", MARGIN, PAGE_HEIGHT - 64, bold, 18, white);
  drawText(
    page,
    `Order ${shortOrderId(invoice.orderId)}  |  ${formatInvoiceDate(invoice.createdAt)}`,
    MARGIN,
    PAGE_HEIGHT - 86,
    regular,
    10,
    rgb(0.83, 0.83, 0.83),
  );
  y = PAGE_HEIGHT - 140;

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
  drawText(page, "ORDER DETAILS", MARGIN, y, bold, 8, muted);
  drawText(page, "BILL TO", MARGIN + CONTENT_WIDTH / 2, y, bold, 8, muted);
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

  // Table header
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
    color: rgb(0.98, 0.98, 0.98),
  });
  drawText(page, "ITEM", colItem + 8, y, bold, 8, muted);
  drawText(page, "QTY", colQty, y, bold, 8, muted);
  drawText(page, "UNIT", colUnit, y, bold, 8, muted);
  const totalLabel = "TOTAL";
  drawText(
    page,
    totalLabel,
    colTotal - bold.widthOfTextAtSize(totalLabel, 8),
    y,
    bold,
    8,
    muted,
  );
  y -= 24;

  for (const item of invoice.lines) {
    ensureSpace(36);
    const name = truncate(bold, item.productName, 10, 250);
    drawText(page, name, colItem + 8, y, bold, 10);
    drawText(page, `SKU ${item.sku}`, colItem + 8, y - 12, regular, 8, muted);

    const qty = String(item.quantity);
    drawText(page, qty, colQty + 4, y - 4, regular, 10);

    const unit = formatBdtPdf(item.unitPrice);
    drawText(page, unit, colUnit, y - 4, regular, 10);

    const total = formatBdtPdf(item.lineTotal);
    drawText(
      page,
      total,
      colTotal - bold.widthOfTextAtSize(toWinAnsi(total), 10),
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
    drawText(page, label, totalsX, y, font, size, strong ? ink : muted);
    drawText(
      page,
      safeValue,
      valueX - font.widthOfTextAtSize(safeValue, size),
      y,
      font,
      size,
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
    color: line,
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
  drawText(page, "DELIVER TO", MARGIN, y, bold, 8, muted);
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

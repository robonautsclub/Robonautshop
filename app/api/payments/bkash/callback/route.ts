import { NextResponse } from "next/server";

import { getRequestDb } from "@/lib/db/request";
import {
  BkashApiError,
  executeBkashPayment,
  queryBkashPayment,
} from "@/lib/payments/bkash";
import {
  discardBkashPendingPayment,
  finalizeBkashPaidOrder,
  getBkashPendingByPaymentId,
  getOrderByBkashPaymentId,
} from "@/lib/server-cart/order-queries";

export const dynamic = "force-dynamic";

function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

function redirectToConfirmation(orderId: string): NextResponse {
  const url = new URL("/checkout/confirmation", siteOrigin());
  url.searchParams.set("orderId", orderId);
  return NextResponse.redirect(url);
}

function redirectToCheckout(error: string): NextResponse {
  const url = new URL("/checkout", siteOrigin());
  url.searchParams.set("paymentError", error);
  return NextResponse.redirect(url);
}

/**
 * bKash Checkout (URL) callback.
 *
 * Orders are created only after Execute Payment (or Query) confirms
 * Completed. Failure/cancel discards the staged pending row and leaves the
 * cart unchanged — no PENDING order is written.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentID = searchParams.get("paymentID") ?? searchParams.get("paymentId");
  const status = (searchParams.get("status") ?? "").toLowerCase();

  if (!paymentID) {
    return redirectToCheckout("Missing bKash payment reference.");
  }

  const db = await getRequestDb();

  const existingOrder = await getOrderByBkashPaymentId(db, paymentID);
  if (existingOrder) {
    return redirectToConfirmation(existingOrder.id);
  }

  const pending = await getBkashPendingByPaymentId(db, paymentID);
  if (!pending) {
    return redirectToCheckout("We could not find that bKash payment.");
  }

  if (status === "failure" || status === "failed") {
    await discardBkashPendingPayment(db, paymentID);
    return redirectToCheckout("bKash payment failed. Your cart is unchanged — try again when ready.");
  }

  if (status === "cancel" || status === "cancelled" || status === "canceled") {
    await discardBkashPendingPayment(db, paymentID);
    return redirectToCheckout("bKash payment was cancelled. Your cart is unchanged.");
  }

  try {
    const executed = await executeBkashPayment(db, paymentID);
    const finalized = await finalizeBkashPaidOrder(db, paymentID, executed.trxID);
    if ("error" in finalized) {
      return redirectToCheckout(finalized.error);
    }
    return redirectToConfirmation(finalized.orderId);
  } catch (executeError) {
    try {
      const queried = await queryBkashPayment(db, paymentID);
      if (queried.transactionStatus === "Completed" && queried.trxID) {
        const finalized = await finalizeBkashPaidOrder(db, paymentID, queried.trxID);
        if ("error" in finalized) {
          return redirectToCheckout(finalized.error);
        }
        return redirectToConfirmation(finalized.orderId);
      }
    } catch {
      // fall through
    }

    await discardBkashPendingPayment(db, paymentID);

    const message =
      executeError instanceof BkashApiError
        ? executeError.message
        : "bKash payment could not be confirmed.";

    return redirectToCheckout(message);
  }
}

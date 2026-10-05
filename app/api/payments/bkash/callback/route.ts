import { NextResponse } from "next/server";

import { getRequestDb } from "@/lib/db/request";
import {
  BkashApiError,
  executeBkashPayment,
  queryBkashPayment,
} from "@/lib/payments/bkash";
import {
  finalizeBkashPaidOrder,
  finalizeBkashUnpaidOrder,
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

function redirectToAccountOrders(orderId?: string, error?: string): NextResponse {
  const url = new URL("/account/orders", siteOrigin());
  if (orderId) {
    url.searchParams.set("orderId", orderId);
  }
  if (error) {
    url.searchParams.set("paymentError", error);
  }
  return NextResponse.redirect(url);
}

/**
 * bKash Checkout (URL) callback.
 *
 * Success: Execute (or Query) → PAID order.
 * Failure/cancel: persist unpaid order (FAILED/CANCELLED) for repay in
 * /account/orders — do not silently discard the attempt (task 102).
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
  if (existingOrder?.paymentStatus === "PAID") {
    return redirectToConfirmation(existingOrder.id);
  }

  const pending = await getBkashPendingByPaymentId(db, paymentID);
  // Repay path: order already exists with this paymentID, no pending row.
  if (!pending && !existingOrder) {
    return redirectToCheckout("We could not find that bKash payment.");
  }

  if (status === "failure" || status === "failed") {
    const result = await finalizeBkashUnpaidOrder(db, paymentID, "FAILED");
    if ("error" in result) {
      return redirectToCheckout(result.error);
    }
    return redirectToAccountOrders(
      result.orderId,
      "bKash payment failed. You can pay again from your orders.",
    );
  }

  if (status === "cancel" || status === "cancelled" || status === "canceled") {
    const result = await finalizeBkashUnpaidOrder(db, paymentID, "CANCELLED");
    if ("error" in result) {
      return redirectToCheckout(result.error);
    }
    return redirectToAccountOrders(
      result.orderId,
      "bKash payment was cancelled. You can pay again from your orders.",
    );
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

    const unpaid = await finalizeBkashUnpaidOrder(db, paymentID, "FAILED");
    if ("error" in unpaid) {
      return redirectToCheckout(unpaid.error);
    }

    const message =
      executeError instanceof BkashApiError
        ? executeError.message
        : "bKash payment could not be confirmed.";

    return redirectToAccountOrders(unpaid.orderId, message);
  }
}

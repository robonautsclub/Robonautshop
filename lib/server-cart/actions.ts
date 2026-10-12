"use server";

import { getServerSession } from "@/lib/auth/session";
import type { CartLineInput } from "@/lib/cart/types";
import { getRequestDb } from "@/lib/db/request";
import { limitAction } from "@/lib/rate-limit/action";
import {
  getServerCartLines,
  mergeGuestCartIntoServerCart,
  setServerCartLines,
} from "@/lib/server-cart/queries";
import {
  getOrderForCustomer,
  listOrdersForCustomer,
  placeOrderFromServerCart,
  repayBkashOrder,
  type CustomerOrderSummary,
  type OrderItemRecord,
  type OrderRecord,
  type PlaceOrderInput,
  type PlaceOrderResult,
  type RepayBkashResult,
} from "@/lib/server-cart/order-queries";

/**
 * Every action here re-checks the session itself — "No guest orders" and
 * "never trust the browser" apply to the action boundary too, not just the
 * page-level route guards in tasks 78a/78b. A signed-out caller gets an
 * empty/no-op result, never an error that leaks whether something exists.
 */
async function requireUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user.id ?? null;
}

/** Orders and bKash repay attempts per user (tasks/phase-18-hardening/113). */
const PLACE_ORDER_LIMIT = { limit: 5, windowMs: 60 * 1000 };

export async function getMyCartAction(): Promise<CartLineInput[]> {
  const userId = await requireUserId();
  if (!userId) {
    return [];
  }

  const db = await getRequestDb();
  return getServerCartLines(db, userId);
}

/** Full-replace sync — see lib/server-cart/queries.ts `setServerCartLines`. */
export async function syncMyCartAction(lines: CartLineInput[]): Promise<void> {
  const userId = await requireUserId();
  if (!userId) {
    return;
  }

  const db = await getRequestDb();
  await setServerCartLines(db, userId, lines);
}

/** Called once on the guest → signed-in transition (tasks/phase-12-wire-up/78b). */
export async function mergeGuestCartAction(
  guestLines: CartLineInput[],
): Promise<CartLineInput[]> {
  const userId = await requireUserId();
  if (!userId) {
    return [];
  }

  const db = await getRequestDb();
  return mergeGuestCartIntoServerCart(db, userId, guestLines);
}

export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "You must be signed in to place an order." };
  }

  const limited = await limitAction("place-order", PLACE_ORDER_LIMIT, userId);
  if (limited) {
    return { ok: false, error: limited };
  }

  const db = await getRequestDb();
  return placeOrderFromServerCart(db, userId, input);
}

export async function getMyOrderAction(
  orderId: string,
): Promise<{ order: OrderRecord; items: OrderItemRecord[] } | null> {
  const userId = await requireUserId();
  if (!userId) {
    return null;
  }

  const db = await getRequestDb();
  return getOrderForCustomer(db, userId, orderId);
}

export async function getMyOrdersAction(): Promise<CustomerOrderSummary[]> {
  const userId = await requireUserId();
  if (!userId) {
    return [];
  }

  const db = await getRequestDb();
  return listOrdersForCustomer(db, userId);
}

export async function repayBkashOrderAction(
  orderId: string,
): Promise<RepayBkashResult> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "You must be signed in to repay an order." };
  }

  const limited = await limitAction("repay-order", PLACE_ORDER_LIMIT, userId);
  if (limited) {
    return { ok: false, error: limited };
  }

  const db = await getRequestDb();
  return repayBkashOrder(db, userId, orderId);
}

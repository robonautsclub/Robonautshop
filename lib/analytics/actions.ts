"use server";

import { getRequestDb } from "@/lib/db/request";
import { recordAnalyticsEvent } from "@/lib/analytics/queries";

/** Client-callable — CartProvider fires this on add, fire-and-forget. */
export async function recordAddToCartAction(productId: string): Promise<void> {
  const db = await getRequestDb();
  await recordAnalyticsEvent(db, { type: "ADD_TO_CART", productId });
}

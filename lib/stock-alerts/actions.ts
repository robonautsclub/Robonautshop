"use server";

import { getRequestDb } from "@/lib/db/request";
import { limitAction } from "@/lib/rate-limit/action";
import { backInStockSchema } from "@/lib/stock-alerts/schemas";
import { subscribeBackInStock, type SubscribeResult } from "@/lib/stock-alerts/queries";

/** Open to guests (email only), so it is rate limited per client IP. */
export async function subscribeBackInStockAction(input: unknown): Promise<SubscribeResult> {
  const limited = await limitAction("back-in-stock", { limit: 5, windowMs: 10 * 60 * 1000 });
  if (limited) {
    return { ok: false, error: limited };
  }

  const parsed = backInStockSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const db = await getRequestDb();
  return subscribeBackInStock(db, parsed.data);
}

"use server";

import { requirePermission } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { runAbandonedCartReminders } from "@/lib/abandoned-carts/run";

/** Admin-only manual trigger — the real schedule is the Cron Trigger in custom-worker.ts. */
export async function runAbandonedCartRemindersAction(): Promise<{ sent: number }> {
  await requirePermission("orders.manage");
  const db = await getRequestDb();
  const sent = await runAbandonedCartReminders(db);
  return { sent };
}

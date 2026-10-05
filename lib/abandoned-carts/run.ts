import { getAbandonedCarts, markReminderSent } from "@/lib/abandoned-carts/queries";
import type { Database } from "@/lib/db";
import { sendAbandonedCartReminderEmail } from "@/lib/email/send";

/**
 * Finds idle carts and emails reminders — called from the Cron Trigger
 * (custom-worker.ts) and available as a manual admin action
 * (lib/abandoned-carts/actions.ts) for testing without waiting a day.
 */
export async function runAbandonedCartReminders(db: Database): Promise<number> {
  const abandoned = await getAbandonedCarts(db);
  let sent = 0;

  for (const cart of abandoned) {
    const ok = await sendAbandonedCartReminderEmail({
      to: cart.email,
      name: cart.name,
      itemCount: cart.itemCount,
    });
    if (ok) {
      sent += 1;
    }
    // Mark as reminded regardless of send success — a misconfigured mail
    // provider shouldn't make this job retry forever for the same user.
    await markReminderSent(db, cart.userId);
  }

  return sent;
}

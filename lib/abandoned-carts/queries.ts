import { eq, sql } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { cartItems } from "@/lib/db/schema/cart-items";
import { cartReminders } from "@/lib/db/schema/cart-reminders";
import { users } from "@/lib/db/schema/users";

export type AbandonedCart = {
  userId: string;
  email: string;
  name: string;
  itemCount: number;
  lastUpdatedAt: string;
};

/**
 * Abandoned cart detection (tasks/phase-14-advanced/92-abandoned-carts.md):
 * a signed-in customer's server cart (lib/server-cart/) with no activity
 * for `idleHours`, who hasn't already been reminded in the last
 * `cooldownHours`.
 */
export async function getAbandonedCarts(
  db: Database,
  idleHours = 24,
  cooldownHours = 72,
): Promise<AbandonedCart[]> {
  const idleSince = new Date(Date.now() - idleHours * 60 * 60 * 1000).toISOString();
  const cooldownSince = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString();

  const candidates = await db
    .select({
      userId: cartItems.userId,
      lastUpdatedAt: sql<string>`max(${cartItems.updatedAt})`,
      itemCount: sql<number>`count(*)`,
    })
    .from(cartItems)
    .groupBy(cartItems.userId)
    .having(sql`max(${cartItems.updatedAt}) < ${idleSince}`);

  if (candidates.length === 0) {
    return [];
  }

  const reminderRows = await db.select().from(cartReminders);
  const lastReminderByUser = new Map(
    reminderRows.map((row) => [row.userId, row.lastSentAt]),
  );

  const results: AbandonedCart[] = [];
  for (const candidate of candidates) {
    const lastSent = lastReminderByUser.get(candidate.userId);
    if (lastSent && lastSent > cooldownSince) {
      continue;
    }

    const userRows = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, candidate.userId))
      .limit(1);
    const user = userRows[0];
    if (!user) {
      continue;
    }

    results.push({
      userId: candidate.userId,
      email: user.email,
      name: user.name,
      itemCount: Number(candidate.itemCount),
      lastUpdatedAt: candidate.lastUpdatedAt,
    });
  }

  return results;
}

export async function markReminderSent(db: Database, userId: string): Promise<void> {
  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(cartReminders)
    .where(eq(cartReminders.userId, userId))
    .limit(1);

  if (existing[0]) {
    await db.update(cartReminders).set({ lastSentAt: now }).where(eq(cartReminders.userId, userId));
    return;
  }

  await db.insert(cartReminders).values({ userId, lastSentAt: now });
}


import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "@/lib/db/schema/users";

/**
 * One row per user, tracking the last abandoned-cart reminder email sent
 * (tasks/phase-14-advanced/92-abandoned-carts.md) — prevents re-sending a
 * reminder every time the detection job runs while a cart is still idle.
 */
export const cartReminders = sqliteTable("cart_reminders", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  lastSentAt: text("last_sent_at").notNull(),
});

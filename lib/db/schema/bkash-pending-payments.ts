import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "@/lib/db/schema/users";

/**
 * Staging row for an in-flight bKash Checkout (URL) payment.
 *
 * No `orders` row is created until Execute Payment succeeds — abandoned or
 * failed checkouts must not leave PENDING / PAYMENT_PENDING orders in the DB.
 * `payload` is a JSON snapshot of validated lines + shipping + totals.
 */
export const bkashPendingPayments = sqliteTable(
  "bkash_pending_payments",
  {
    /** Becomes the order id when payment completes. */
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** bKash paymentID from Create Payment. */
    paymentId: text("payment_id").notNull().unique(),
    payload: text("payload").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (table) => [
    index("bkash_pending_payments_user_id_idx").on(table.userId),
    index("bkash_pending_payments_payment_id_idx").on(table.paymentId),
  ],
);

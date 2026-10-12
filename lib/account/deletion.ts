import { and, eq, notInArray, or } from "drizzle-orm";

import type { Database } from "@/lib/db";
import { runBatch } from "@/lib/db/batch";
import { bkashPendingPayments } from "@/lib/db/schema/bkash-pending-payments";
import { cartItems } from "@/lib/db/schema/cart-items";
import { cartReminders } from "@/lib/db/schema/cart-reminders";
import { orders } from "@/lib/db/schema/orders";
import { productReviews } from "@/lib/db/schema/product-reviews";
import type { OrderStatus } from "@/lib/db/schema/shared";
import { userAddresses } from "@/lib/db/schema/user-addresses";
import { accounts, sessions, users, verifications } from "@/lib/db/schema/users";
import { wishlistItems } from "@/lib/db/schema/wishlist-items";

/** Orders in these states are finished; anything else blocks deletion. */
const FINISHED_ORDER_STATUSES: OrderStatus[] = ["DELIVERED", "CANCELLED", "REFUNDED"];

export const ANONYMIZED_NAME = "Deleted customer";

export type DeleteAccountResult = { ok: true } | { ok: false; error: string };

/**
 * Deletes a customer account but keeps the business record (task 133).
 *
 * KEPT: the `users` row (orders reference it), each order's lines, totals,
 * coupon, payment status and bKash ids, and the delivery city.
 * ANONYMIZED: user name/email/phone/image, and each order's shipping name,
 * phone, street address, postcode, coordinates and delivery notes.
 * DELETED: sessions, linked login accounts (so nobody can sign in again),
 * verification/reset tokens, saved addresses, wishlist, cart, cart
 * reminders, reviews and pending bKash attempts.
 *
 * Blocked while any order is still in progress. All writes are one atomic
 * D1 batch. Callers must already have re-authenticated the user.
 */
export async function deleteCustomerAccount(
  db: Database,
  userId: string,
): Promise<DeleteAccountResult> {
  const rows = await db
    .select({ email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const user = rows[0];
  if (!user) {
    return { ok: false, error: "Account not found." };
  }
  if (user.role !== "CUSTOMER") {
    return { ok: false, error: "Only customer accounts can be deleted here." };
  }

  const inProgress = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.userId, userId), notInArray(orders.status, FINISHED_ORDER_STATUSES)))
    .limit(1);
  if (inProgress.length > 0) {
    return {
      ok: false,
      error:
        "You have an order in progress. Cancel it or wait until it is delivered before deleting your account.",
    };
  }

  const now = new Date();
  await runBatch(db, [
    db.delete(sessions).where(eq(sessions.userId, userId)),
    db.delete(accounts).where(eq(accounts.userId, userId)),
    db.delete(verifications).where(or(eq(verifications.value, userId), eq(verifications.identifier, user.email))),
    db.delete(userAddresses).where(eq(userAddresses.userId, userId)),
    db.delete(wishlistItems).where(eq(wishlistItems.userId, userId)),
    db.delete(cartItems).where(eq(cartItems.userId, userId)),
    db.delete(cartReminders).where(eq(cartReminders.userId, userId)),
    db.delete(productReviews).where(eq(productReviews.userId, userId)),
    db.delete(bkashPendingPayments).where(eq(bkashPendingPayments.userId, userId)),
    db
      .update(orders)
      .set({
        shippingFullName: ANONYMIZED_NAME,
        shippingPhone: "-",
        shippingAddressLine1: "Removed",
        shippingAddressLine2: null,
        shippingPostalCode: null,
        shippingLat: null,
        shippingLng: null,
        specialInstructions: null,
      })
      .where(eq(orders.userId, userId)),
    db
      .update(users)
      .set({
        name: ANONYMIZED_NAME,
        email: `deleted-${userId}@deleted.invalid`,
        emailVerified: false,
        phone: null,
        image: null,
        updatedAt: now,
      })
      .where(eq(users.id, userId)),
  ]);

  return { ok: true };
}

import { and, eq, inArray, isNull } from "drizzle-orm";

import { getAvailableQuantity } from "@/lib/catalog/types";
import type { Database } from "@/lib/db";
import { backInStockSubscriptions } from "@/lib/db/schema/back-in-stock";
import { inventory } from "@/lib/db/schema/inventory";
import { productVariants } from "@/lib/db/schema/product-variants";
import { products } from "@/lib/db/schema/products";
import { sendBackInStockEmail } from "@/lib/email/send";

export type SubscribeResult = { ok: true } | { ok: false; error: string };

/**
 * Records a sign-up for an out-of-stock product/variant. Re-subscribing with
 * the same email is a silent no-op (one subscription per email per variant),
 * so the caller can always show the same confirmation. Stock and product
 * checks happen here, server-side.
 */
export async function subscribeBackInStock(
  db: Database,
  input: { productId: string; variantId: string | null; email: string },
): Promise<SubscribeResult> {
  const product = (
    await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, input.productId), eq(products.status, "PUBLISHED")))
      .limit(1)
  )[0];
  if (!product) {
    return { ok: false, error: "Product not found." };
  }

  if (input.variantId) {
    const variant = (
      await db
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(
          and(eq(productVariants.id, input.variantId), eq(productVariants.productId, input.productId)),
        )
        .limit(1)
    )[0];
    if (!variant) {
      return { ok: false, error: "That option doesn't exist." };
    }
  }

  const stockRows = await db
    .select()
    .from(inventory)
    .where(
      and(
        eq(inventory.productId, input.productId),
        input.variantId ? eq(inventory.variantId, input.variantId) : isNull(inventory.variantId),
      ),
    );
  if (stockRows.some((row) => getAvailableQuantity(row) > 0)) {
    return { ok: false, error: "This item is in stock right now." };
  }

  await db
    .insert(backInStockSubscriptions)
    .values({
      id: crypto.randomUUID(),
      productId: input.productId,
      variantId: input.variantId,
      variantKey: input.variantId ?? "",
      email: input.email,
    })
    .onConflictDoNothing();
  return { ok: true };
}

type Sender = (args: {
  to: string;
  productName: string;
  variantName: string | null;
  productSlug: string;
}) => Promise<boolean>;

/**
 * After stock was added: emails everyone waiting on this inventory row, once.
 * Subscriptions are claimed (sentAt set) in one UPDATE before sending, so
 * concurrent adjustments can't double-send; a failed send is released so the
 * next restock retries it. Returns how many emails went out.
 */
export async function notifyBackInStock(
  db: Database,
  inventoryId: string,
  send: Sender = sendBackInStockEmail,
): Promise<number> {
  const row = (await db.select().from(inventory).where(eq(inventory.id, inventoryId)).limit(1))[0];
  if (!row || getAvailableQuantity(row) <= 0) {
    return 0;
  }

  const waiting = await db
    .select({ id: backInStockSubscriptions.id })
    .from(backInStockSubscriptions)
    .where(
      and(
        eq(backInStockSubscriptions.productId, row.productId),
        eq(backInStockSubscriptions.variantKey, row.variantId ?? ""),
        isNull(backInStockSubscriptions.sentAt),
      ),
    );
  if (waiting.length === 0) {
    return 0;
  }

  const claimed = await db
    .update(backInStockSubscriptions)
    .set({ sentAt: new Date().toISOString() })
    .where(
      and(
        inArray(
          backInStockSubscriptions.id,
          waiting.map((entry) => entry.id),
        ),
        isNull(backInStockSubscriptions.sentAt),
      ),
    )
    .returning({ id: backInStockSubscriptions.id, email: backInStockSubscriptions.email });
  if (claimed.length === 0) {
    return 0;
  }

  const product = (
    await db
      .select({ name: products.name, slug: products.slug })
      .from(products)
      .where(eq(products.id, row.productId))
      .limit(1)
  )[0];
  const variantName = row.variantId
    ? ((
        await db
          .select({ name: productVariants.name })
          .from(productVariants)
          .where(eq(productVariants.id, row.variantId))
          .limit(1)
      )[0]?.name ?? null)
    : null;
  if (!product) {
    return 0;
  }

  let sent = 0;
  for (const subscription of claimed) {
    const delivered = await send({
      to: subscription.email,
      productName: product.name,
      variantName,
      productSlug: product.slug,
    });
    if (delivered) {
      sent += 1;
    } else {
      await db
        .update(backInStockSubscriptions)
        .set({ sentAt: null })
        .where(eq(backInStockSubscriptions.id, subscription.id));
    }
  }
  return sent;
}

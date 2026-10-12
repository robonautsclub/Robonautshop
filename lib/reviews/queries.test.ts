import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/lib/db";
import { categories } from "@/lib/db/schema/categories";
import { orderItems } from "@/lib/db/schema/order-items";
import { orders } from "@/lib/db/schema/orders";
import { products } from "@/lib/db/schema/products";
import { users } from "@/lib/db/schema/users";
import {
  getReviewsForProduct,
  getReviewSummariesForProducts,
  getReviewSummaryForProduct,
  setReviewStatus,
  upsertReview,
} from "@/lib/reviews/queries";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  const now = new Date();
  await db.insert(users).values([
    { id: "u1", name: "Buyer", email: "b@example.com", createdAt: now, updatedAt: now },
    { id: "u2", name: "Visitor", email: "v@example.com", createdAt: now, updatedAt: now },
  ]);
  await db.insert(categories).values({ id: "c1", name: "Parts", slug: "parts" });
  await db.insert(products).values({
    id: "p1", name: "N20", slug: "n20", sku: "N20", description: "", shortDescription: "",
    categoryId: "c1", price: 300, status: "PUBLISHED",
  });
  await db.insert(orders).values({
    id: "o1", userId: "u1", status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "BKASH",
    subtotal: 300, shippingTotal: 60, total: 360, shippingFullName: "B", shippingPhone: "01700000000",
    shippingAddressLine1: "House 1", shippingCity: "Dhaka",
  });
  await db.insert(orderItems).values({
    id: "l1", orderId: "o1", productId: "p1", variantId: null, productName: "N20", sku: "N20",
    quantity: 1, unitPrice: 300, lineTotal: 300,
  });
});

afterAll(async () => {
  await dispose();
});

describe("review moderation", () => {
  it("keeps a new review out of the page and the rating until approved", async () => {
    const buyer = await upsertReview(db, { userId: "u1", productId: "p1", rating: 5, body: "Great motor, works well." });
    const visitor = await upsertReview(db, { userId: "u2", productId: "p1", rating: 1, body: "Did not buy but complaining." });
    expect(buyer.status).toBe("PENDING");

    expect(await getReviewsForProduct(db, "p1")).toEqual([]);
    expect(await getReviewSummaryForProduct(db, "p1")).toEqual({ count: 0, averageRating: 0 });

    await setReviewStatus(db, buyer.id, "APPROVED");
    await setReviewStatus(db, visitor.id, "APPROVED");
    const reviews = await getReviewsForProduct(db, "p1");
    expect(reviews.find((r) => r.userId === "u1")?.verifiedPurchase).toBe(true);
    expect(reviews.find((r) => r.userId === "u2")?.verifiedPurchase).toBe(false);
    expect(await getReviewSummaryForProduct(db, "p1")).toEqual({ count: 2, averageRating: 3 });

    // A hidden review disappears from the list and the rating.
    await setReviewStatus(db, visitor.id, "HIDDEN");
    expect(await getReviewsForProduct(db, "p1")).toHaveLength(1);
    expect(await getReviewSummaryForProduct(db, "p1")).toEqual({ count: 1, averageRating: 5 });
    expect((await getReviewSummariesForProducts(db, ["p1"])).get("p1")).toEqual({ count: 1, averageRating: 5 });
  });

  it("sends an edited review back to moderation", async () => {
    const edited = await upsertReview(db, { userId: "u1", productId: "p1", rating: 4, body: "Updated: still good after a month." });
    expect(edited.status).toBe("PENDING");
    expect(await getReviewsForProduct(db, "p1")).toEqual([]);
  });

  it("reports an unknown review", async () => {
    expect(await setReviewStatus(db, "missing", "APPROVED")).toMatchObject({ ok: false });
  });
});

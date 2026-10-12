import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import { users } from "@/lib/db/schema/users";
import { listOrdersForAdmin } from "@/lib/server-cart/order-queries";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

const baseOrder = {
  paymentMethod: "bkash",
  subtotal: 1000,
  shippingTotal: 60,
  total: 1060,
  shippingAddressLine1: "House 1",
  shippingCity: "Dhaka",
};

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  const now = new Date();
  await db.insert(users).values([
    { id: "u1", name: "Nusrat", email: "nusrat@example.com", createdAt: now, updatedAt: now },
    { id: "u2", name: "Rafi", email: "rafi_50%@example.com", createdAt: now, updatedAt: now },
  ]);
  await db.insert(orders).values([
    { ...baseOrder, id: "ord-a", userId: "u1", status: "PAID", paymentStatus: "PAID", shippingFullName: "Nusrat Jahan", shippingPhone: "01711000000", createdAt: "2026-10-01T09:00:00.000Z" },
    { ...baseOrder, id: "ord-b", userId: "u2", status: "SHIPPED", paymentStatus: "PAID", shippingFullName: "Rafi Ahmed", shippingPhone: "01811000000", createdAt: "2026-10-03T09:00:00.000Z" },
  ]);
});

afterAll(async () => {
  await dispose();
});

const ids = async (filters: Parameters<typeof listOrdersForAdmin>[1]) =>
  (await listOrdersForAdmin(db, filters)).map((row) => row.order.id).sort();

describe("listOrdersForAdmin filters", () => {
  it("returns everything without filters", async () => {
    expect(await ids({})).toEqual(["ord-a", "ord-b"]);
  });

  it("searches phone, name and account email", async () => {
    expect(await ids({ q: "01811" })).toEqual(["ord-b"]);
    expect(await ids({ q: "jahan" })).toEqual(["ord-a"]);
    expect(await ids({ q: "nusrat@" })).toEqual(["ord-a"]);
  });

  it("treats LIKE wildcards literally", async () => {
    expect(await ids({ q: "50%" })).toEqual(["ord-b"]);
    expect(await ids({ q: "%" })).toEqual(["ord-b"]);
  });

  it("filters by status and inclusive date range", async () => {
    expect(await ids({ status: "SHIPPED" })).toEqual(["ord-b"]);
    expect(await ids({ from: "2026-10-01", to: "2026-10-01" })).toEqual(["ord-a"]);
  });
});

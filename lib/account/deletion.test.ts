import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { ANONYMIZED_NAME, deleteCustomerAccount } from "@/lib/account/deletion";
import type { Database } from "@/lib/db";
import { orders } from "@/lib/db/schema/orders";
import type { OrderStatus } from "@/lib/db/schema/shared";
import { userAddresses } from "@/lib/db/schema/user-addresses";
import { accounts, sessions, users } from "@/lib/db/schema/users";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

async function seed(orderStatus: OrderStatus | null, role: "CUSTOMER" | "ADMIN" = "CUSTOMER") {
  await db.delete(orders);
  await db.delete(userAddresses);
  await db.delete(sessions);
  await db.delete(accounts);
  await db.delete(users);
  const now = new Date();
  await db.insert(users).values({
    id: "u1",
    name: "Real Name",
    email: "real@example.com",
    phone: "01700000000",
    role,
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(accounts).values({
    id: "a1",
    userId: "u1",
    providerId: "credential",
    accountId: "u1",
    password: "hash",
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(sessions).values({
    id: "s1",
    userId: "u1",
    token: "tok",
    expiresAt: new Date(Date.now() + 100000),
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(userAddresses).values({
    id: "ad1",
    userId: "u1",
    fullName: "Real Name",
    phone: "01700000000",
    addressLine1: "House 1",
    city: "Dhaka",
  });
  if (orderStatus) {
    await db.insert(orders).values({
      id: "o1",
      userId: "u1",
      status: orderStatus,
      paymentStatus: "PAID",
      paymentMethod: "BKASH",
      subtotal: 100,
      shippingTotal: 60,
      total: 160,
      shippingFullName: "Real Name",
      shippingPhone: "01700000000",
      shippingAddressLine1: "House 1, Road 1",
      shippingCity: "Dhaka",
      specialInstructions: "Call first",
    });
  }
}

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
});

beforeEach(async () => {
  await seed("DELIVERED");
});

afterAll(async () => {
  await dispose();
});

describe("deleteCustomerAccount", () => {
  it("anonymizes the user and orders, and removes login and personal data", async () => {
    expect(await deleteCustomerAccount(db, "u1")).toEqual({ ok: true });

    const user = (await db.select().from(users).where(eq(users.id, "u1")))[0];
    expect(user).toMatchObject({ name: ANONYMIZED_NAME, phone: null, email: "deleted-u1@deleted.invalid" });
    expect(await db.select().from(accounts)).toHaveLength(0);
    expect(await db.select().from(sessions)).toHaveLength(0);
    expect(await db.select().from(userAddresses)).toHaveLength(0);

    const order = (await db.select().from(orders).where(eq(orders.id, "o1")))[0];
    expect(order).toMatchObject({
      shippingFullName: ANONYMIZED_NAME,
      shippingPhone: "-",
      shippingAddressLine1: "Removed",
      specialInstructions: null,
      shippingCity: "Dhaka",
      total: 160,
      paymentStatus: "PAID",
    });
  });

  it("blocks deletion while an order is in progress and changes nothing", async () => {
    await seed("PROCESSING");
    expect(await deleteCustomerAccount(db, "u1")).toMatchObject({ ok: false });
    expect((await db.select().from(users))[0].name).toBe("Real Name");
    expect(await db.select().from(sessions)).toHaveLength(1);
  });

  it("allows deletion with no orders", async () => {
    await seed(null);
    expect(await deleteCustomerAccount(db, "u1")).toEqual({ ok: true });
  });

  it("refuses to delete an admin account", async () => {
    await seed(null, "ADMIN");
    expect(await deleteCustomerAccount(db, "u1")).toMatchObject({ ok: false });
  });
});

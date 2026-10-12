import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { assignUserRole } from "@/lib/admin/user-roles";
import type { Database } from "@/lib/db";
import { accounts, users } from "@/lib/db/schema/users";
import { createTestDb } from "@/lib/test/d1";

let db: Database;
let dispose: () => Promise<void>;

async function role(id: string) {
  return (await db.select().from(users).where(eq(users.id, id)))[0].role;
}

beforeAll(async () => {
  ({ db, dispose } = await createTestDb());
  const now = new Date();
  const base = { createdAt: now, updatedAt: now };
  await db.insert(users).values([
    { id: "admin", name: "Admin", email: "admin@example.com", emailVerified: true, role: "ADMIN", ...base },
    { id: "cust", name: "Cust", email: "cust@example.com", emailVerified: true, ...base },
    { id: "unverified", name: "U", email: "u@example.com", emailVerified: false, ...base },
    { id: "social", name: "S", email: "s@example.com", emailVerified: true, ...base },
  ]);
  await db.insert(accounts).values([
    { id: "a1", userId: "cust", providerId: "credential", accountId: "cust", ...base },
    { id: "a2", userId: "unverified", providerId: "credential", accountId: "unverified", ...base },
    { id: "a3", userId: "social", providerId: "google", accountId: "g1", ...base },
    { id: "a4", userId: "admin", providerId: "credential", accountId: "admin", ...base },
  ]);
});

afterAll(async () => {
  await dispose();
});

describe("assignUserRole", () => {
  it("promotes a verified password account and is case-insensitive on email", async () => {
    expect(await assignUserRole(db, "admin", " CUST@example.com ", "ORDER_MANAGER")).toEqual({ ok: true, role: "ORDER_MANAGER" });
    expect(await role("cust")).toBe("ORDER_MANAGER");
  });

  it("refuses unverified emails, social-only accounts and unknown emails", async () => {
    expect(await assignUserRole(db, "admin", "u@example.com", "STAFF")).toMatchObject({ ok: false });
    expect(await assignUserRole(db, "admin", "s@example.com", "STAFF")).toMatchObject({ ok: false });
    expect(await assignUserRole(db, "admin", "nobody@example.com", "STAFF")).toMatchObject({ ok: false });
    expect(await role("unverified")).toBe("CUSTOMER");
  });

  it("blocks changing your own role and demoting the last admin", async () => {
    expect(await assignUserRole(db, "admin", "admin@example.com", "CUSTOMER")).toMatchObject({ ok: false });
    // Another actor tries to demote the only admin.
    expect(await assignUserRole(db, "cust", "admin@example.com", "STAFF")).toEqual({
      ok: false,
      error: "There must always be at least one admin.",
    });
    expect(await role("admin")).toBe("ADMIN");
  });

  it("removes back-office access with CUSTOMER", async () => {
    expect(await assignUserRole(db, "admin", "cust@example.com", "CUSTOMER")).toMatchObject({ ok: true });
    expect(await role("cust")).toBe("CUSTOMER");
  });
});

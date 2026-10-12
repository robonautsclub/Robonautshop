import { and, count, eq, ne } from "drizzle-orm";

import type { Database } from "@/lib/db";
import type { UserRole } from "@/lib/db/schema/shared";
import { accounts, users } from "@/lib/db/schema/users";

export type BackOfficeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

export type AssignRoleResult = { ok: true; role: UserRole } | { ok: false; error: string };

export async function listBackOfficeUsers(db: Database): Promise<BackOfficeUser[]> {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(ne(users.role, "CUSTOMER"))
    .orderBy(users.name);
}

/**
 * Sets the role of an existing account, found by email (task 146).
 *
 * Rules: you can't change your own role; the target must have a verified
 * email and an email/password login (back-office accounts never use social
 * sign-in, same as admins); and the last ADMIN can't be demoted. Callers
 * must already have checked users.manage.
 */
export async function assignUserRole(
  db: Database,
  actorId: string,
  email: string,
  role: UserRole,
): Promise<AssignRoleResult> {
  const target = (
    await db
      .select({ id: users.id, role: users.role, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1)
  )[0];
  if (!target) {
    return { ok: false, error: "No account with that email. They need to register first." };
  }
  if (target.id === actorId) {
    return { ok: false, error: "You can't change your own role." };
  }

  if (role !== "CUSTOMER") {
    if (!target.emailVerified) {
      return { ok: false, error: "That account hasn't verified its email yet." };
    }
    const credential = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.userId, target.id), eq(accounts.providerId, "credential")))
      .limit(1);
    if (credential.length === 0) {
      return { ok: false, error: "Staff accounts need an email and password login, not social sign-in." };
    }
  }

  if (target.role === "ADMIN" && role !== "ADMIN") {
    const [admins] = await db.select({ value: count() }).from(users).where(eq(users.role, "ADMIN"));
    if ((admins?.value ?? 0) <= 1) {
      return { ok: false, error: "There must always be at least one admin." };
    }
  }

  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, target.id));
  return { ok: true, role };
}

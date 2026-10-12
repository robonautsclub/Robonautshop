"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assignUserRole, type AssignRoleResult } from "@/lib/admin/user-roles";
import { requirePermission } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { USER_ROLE_VALUES } from "@/lib/db/schema/shared";

const assignRoleSchema = z.object({
  email: z.email("Enter a valid email address."),
  role: z.enum(USER_ROLE_VALUES, "Choose a role."),
});

/** Needs users.manage (ADMIN only) — checked here, not just by hiding the page. */
export async function assignUserRoleAction(input: unknown): Promise<AssignRoleResult> {
  const session = await requirePermission("users.manage");
  const parsed = assignRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const db = await getRequestDb();
  const result = await assignUserRole(db, session.user.id, parsed.data.email, parsed.data.role);
  if (result.ok) revalidatePath("/admin/users");
  return result;
}

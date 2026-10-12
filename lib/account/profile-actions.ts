"use server";

import { eq } from "drizzle-orm";

import { profileSchema, type ProfileInput } from "@/lib/auth/schemas";
import { getServerSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { users } from "@/lib/db/schema";

export type UpdateProfileResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof ProfileInput, string>> };

/** Updates only the signed-in user's own name and phone; the id comes from the session. */
export async function updateMyProfileAction(input: ProfileInput): Promise<UpdateProfileResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, error: "You must be signed in to edit your profile." };
  }

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ProfileInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "name" || key === "phone") {
        fieldErrors[key] ??= issue.message;
      }
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    const db = await getRequestDb();
    await db
      .update(users)
      .set({
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));
  } catch (error) {
    console.error("[account] profile update failed:", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  return { ok: true };
}

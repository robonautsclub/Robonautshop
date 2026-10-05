"use server";

import { revalidatePath } from "next/cache";

import { getServerSession } from "@/lib/auth/session";
import { getRequestDb } from "@/lib/db/request";
import { toggleWishlistItem } from "@/lib/wishlist/queries";

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user.id ?? null;
}

export type ToggleWishlistResult =
  | { ok: true; wishlisted: boolean }
  | { ok: false; error: string };

export async function toggleWishlistAction(productId: string): Promise<ToggleWishlistResult> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "Sign in to save items to your wishlist." };
  }

  const db = await getRequestDb();
  const wishlisted = await toggleWishlistItem(db, userId, productId);
  revalidatePath("/account/wishlist");
  return { ok: true, wishlisted };
}

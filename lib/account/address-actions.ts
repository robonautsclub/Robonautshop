"use server";

import { addressSchema, type AddressInput } from "@/lib/auth/schemas";
import { getServerSession } from "@/lib/auth/session";
import {
  createAddressForUser,
  deleteAddressForUser,
  listAddressesForUser,
  updateAddressForUser,
  type UserAddressRecord,
} from "@/lib/account/address-queries";
import { getRequestDb } from "@/lib/db/request";

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user.id ?? null;
}

function fieldErrorsFromZod(
  issues: ReadonlyArray<{ path: readonly PropertyKey[]; message: string }>,
): Partial<Record<keyof AddressInput, string>> {
  const fieldErrors: Partial<Record<keyof AddressInput, string>> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (
      key === "fullName" ||
      key === "phone" ||
      key === "addressLine1" ||
      key === "addressLine2" ||
      key === "city" ||
      key === "postalCode"
    ) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export async function getMyAddressesAction(): Promise<UserAddressRecord[]> {
  const userId = await requireUserId();
  if (!userId) {
    return [];
  }
  const db = await getRequestDb();
  return listAddressesForUser(db, userId);
}

export async function createMyAddressAction(
  input: AddressInput,
): Promise<
  | { ok: true; address: UserAddressRecord }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof AddressInput, string>> }
> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "You must be signed in to save an address." };
  }

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const db = await getRequestDb();
  const address = await createAddressForUser(db, userId, parsed.data);
  return { ok: true, address };
}

export async function updateMyAddressAction(
  addressId: string,
  input: AddressInput,
): Promise<
  | { ok: true; address: UserAddressRecord }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof AddressInput, string>> }
> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "You must be signed in to update an address." };
  }

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const db = await getRequestDb();
  const address = await updateAddressForUser(db, userId, addressId, parsed.data);
  if (!address) {
    return { ok: false, error: "Address not found." };
  }
  return { ok: true, address };
}

export async function deleteMyAddressAction(
  addressId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false, error: "You must be signed in to remove an address." };
  }

  const db = await getRequestDb();
  const deleted = await deleteAddressForUser(db, userId, addressId);
  if (!deleted) {
    return { ok: false, error: "Address not found." };
  }
  return { ok: true };
}

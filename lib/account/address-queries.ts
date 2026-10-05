import { and, desc, eq } from "drizzle-orm";

import type { AddressInput } from "@/lib/auth/schemas";
import type { Database } from "@/lib/db";
import { userAddresses } from "@/lib/db/schema/user-addresses";

export type UserAddressRecord = typeof userAddresses.$inferSelect;

export type AddressBookInput = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode?: string | null;
};

export async function listAddressesForUser(
  db: Database,
  userId: string,
): Promise<UserAddressRecord[]> {
  return db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, userId))
    .orderBy(desc(userAddresses.isDefault), desc(userAddresses.updatedAt));
}

export async function createAddressForUser(
  db: Database,
  userId: string,
  input: AddressInput,
): Promise<UserAddressRecord> {
  const existing = await listAddressesForUser(db, userId);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const isDefault = existing.length === 0;

  await db.insert(userAddresses).values({
    id,
    userId,
    fullName: input.fullName,
    phone: input.phone,
    addressLine1: input.addressLine1,
    addressLine2: input.addressLine2?.trim() || null,
    city: input.city,
    postalCode: input.postalCode?.trim() || null,
    isDefault,
    createdAt: now,
    updatedAt: now,
  });

  const rows = await db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.id, id))
    .limit(1);
  return rows[0]!;
}

export async function updateAddressForUser(
  db: Database,
  userId: string,
  addressId: string,
  input: AddressInput,
): Promise<UserAddressRecord | null> {
  const rows = await db
    .select()
    .from(userAddresses)
    .where(and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)))
    .limit(1);
  const existing = rows[0];
  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  await db
    .update(userAddresses)
    .set({
      fullName: input.fullName,
      phone: input.phone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2?.trim() || null,
      city: input.city,
      postalCode: input.postalCode?.trim() || null,
      updatedAt: now,
    })
    .where(and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)));

  const updated = await db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.id, addressId))
    .limit(1);
  return updated[0] ?? null;
}

export async function deleteAddressForUser(
  db: Database,
  userId: string,
  addressId: string,
): Promise<boolean> {
  const rows = await db
    .select()
    .from(userAddresses)
    .where(and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)))
    .limit(1);
  const existing = rows[0];
  if (!existing) {
    return false;
  }

  await db
    .delete(userAddresses)
    .where(and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)));

  if (existing.isDefault) {
    const remaining = await listAddressesForUser(db, userId);
    const next = remaining[0];
    if (next) {
      await db
        .update(userAddresses)
        .set({ isDefault: true, updatedAt: new Date().toISOString() })
        .where(eq(userAddresses.id, next.id));
    }
  }

  return true;
}

/**
 * Upsert shipping snapshot into the address book: match on phone + line1 + city
 * (case-insensitive trim), otherwise insert. Marks the matched/new row default.
 */
export async function upsertShippingAddressForUser(
  db: Database,
  userId: string,
  address: AddressBookInput,
): Promise<void> {
  const now = new Date().toISOString();
  const phone = address.phone.trim();
  const line1 = address.addressLine1.trim();
  const city = address.city.trim();
  const line2 = address.addressLine2?.trim() || null;
  const postal = address.postalCode?.trim() || null;

  const existing = await listAddressesForUser(db, userId);
  const match = existing.find(
    (row) =>
      row.phone.trim() === phone &&
      row.addressLine1.trim().toLowerCase() === line1.toLowerCase() &&
      row.city.trim().toLowerCase() === city.toLowerCase(),
  );

  await db
    .update(userAddresses)
    .set({ isDefault: false, updatedAt: now })
    .where(eq(userAddresses.userId, userId));

  if (match) {
    await db
      .update(userAddresses)
      .set({
        fullName: address.fullName.trim(),
        phone,
        addressLine1: line1,
        addressLine2: line2,
        city,
        postalCode: postal,
        isDefault: true,
        updatedAt: now,
      })
      .where(eq(userAddresses.id, match.id));
    return;
  }

  await db.insert(userAddresses).values({
    id: crypto.randomUUID(),
    userId,
    fullName: address.fullName.trim(),
    phone,
    addressLine1: line1,
    addressLine2: line2,
    city,
    postalCode: postal,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  });
}

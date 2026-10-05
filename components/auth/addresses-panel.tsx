"use client";

import { type FormEvent, useMemo, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import {
  createMyAddressAction,
  deleteMyAddressAction,
  updateMyAddressAction,
} from "@/lib/account/address-actions";
import type { UserAddressRecord } from "@/lib/account/address-queries";
import { addressSchema, type AddressInput } from "@/lib/auth/schemas";

type FieldErrors = Partial<Record<keyof AddressInput | "form", string>>;

type AddressesPanelProps = {
  initialAddresses: UserAddressRecord[];
};

type FormValues = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
};

function emptyForm(): FormValues {
  return {
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
  };
}

function formFromAddress(address: UserAddressRecord): FormValues {
  return {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    city: address.city,
    postalCode: address.postalCode ?? "",
  };
}

export function AddressesPanel({ initialAddresses }: AddressesPanelProps) {
  const [addresses, setAddresses] = useState<UserAddressRecord[]>(initialAddresses);
  const latestAddress = addresses[0] ?? null;
  const [editingId, setEditingId] = useState<string | null>(latestAddress?.id ?? null);
  const [values, setValues] = useState<FormValues>(() =>
    latestAddress ? formFromAddress(latestAddress) : emptyForm(),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isEditing = Boolean(editingId);

  const heading = useMemo(
    () => (isEditing ? "Edit address" : "Add address"),
    [isEditing],
  );

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function applyAddressList(next: UserAddressRecord[]) {
    setAddresses(next);
    const latest = next[0] ?? null;
    setEditingId(latest?.id ?? null);
    setValues(latest ? formFromAddress(latest) : emptyForm());
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const parsed = addressSchema.safeParse({
      fullName: values.fullName,
      phone: values.phone,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 || undefined,
      city: values.city,
      postalCode: values.postalCode || "",
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (
          key === "fullName" ||
          key === "phone" ||
          key === "addressLine1" ||
          key === "addressLine2" ||
          key === "city" ||
          key === "postalCode"
        ) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setPending(true);
    const wasEditing = Boolean(editingId);

    const result = editingId
      ? await updateMyAddressAction(editingId, parsed.data)
      : await createMyAddressAction(parsed.data);

    setPending(false);

    if (!result.ok) {
      setErrors({
        form: result.error,
        ...result.fieldErrors,
      });
      return;
    }

    const without = addresses.filter((row) => row.id !== result.address.id);
    const withoutDefault = result.address.isDefault
      ? without.map((row) => ({ ...row, isDefault: false }))
      : without;
    const next = [result.address, ...withoutDefault];
    setAddresses(next);
    setEditingId(result.address.id);
    setValues(formFromAddress(result.address));
    setStatus(wasEditing ? "Address updated." : "Address saved.");
  }

  async function removeAddress(id: string) {
    setStatus(null);
    setPending(true);
    const result = await deleteMyAddressAction(id);
    setPending(false);

    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }

    let next = addresses.filter((address) => address.id !== id);
    if (next.length > 0 && !next.some((row) => row.isDefault)) {
      next = next.map((row, index) =>
        index === 0 ? { ...row, isDefault: true } : row,
      );
    }
    applyAddressList(next);
    setStatus("Address removed.");
  }

  function startNewAddress() {
    setEditingId(null);
    setValues(emptyForm());
    setErrors({});
    setStatus(null);
  }

  function loadAddressIntoForm(address: UserAddressRecord) {
    setEditingId(address.id);
    setValues(formFromAddress(address));
    setErrors({});
    setStatus(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form className="space-y-4 rounded-xl border p-5" onSubmit={onSubmit} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Your latest saved address is loaded. Edit any field and save."
                : "Bangladesh-friendly fields. Saved to your account in the database."}
            </p>
          </div>
          {isEditing ? (
            <Button type="button" variant="outline" size="sm" onClick={startNewAddress}>
              Add new
            </Button>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address-name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="address-name"
            name="fullName"
            value={values.fullName}
            onChange={(event) => setField("fullName", event.target.value)}
            className={fieldClassName(Boolean(errors.fullName))}
          />
          {errors.fullName ? (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address-phone" className="text-sm font-medium">
            Mobile phone
          </label>
          <input
            id="address-phone"
            name="phone"
            inputMode="numeric"
            placeholder="01XXXXXXXXX"
            value={values.phone}
            onChange={(event) => setField("phone", event.target.value)}
            className={fieldClassName(Boolean(errors.phone))}
          />
          {errors.phone ? (
            <p className="text-sm text-destructive">{errors.phone}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address-line1" className="text-sm font-medium">
            Address line 1
          </label>
          <input
            id="address-line1"
            name="addressLine1"
            value={values.addressLine1}
            onChange={(event) => setField("addressLine1", event.target.value)}
            className={fieldClassName(Boolean(errors.addressLine1))}
          />
          {errors.addressLine1 ? (
            <p className="text-sm text-destructive">{errors.addressLine1}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address-line2" className="text-sm font-medium">
            Address line 2 (optional)
          </label>
          <input
            id="address-line2"
            name="addressLine2"
            value={values.addressLine2}
            onChange={(event) => setField("addressLine2", event.target.value)}
            className={fieldClassName(Boolean(errors.addressLine2))}
          />
          {errors.addressLine2 ? (
            <p className="text-sm text-destructive">{errors.addressLine2}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="address-city" className="text-sm font-medium">
              City / district
            </label>
            <input
              id="address-city"
              name="city"
              placeholder="Dhaka"
              value={values.city}
              onChange={(event) => setField("city", event.target.value)}
              className={fieldClassName(Boolean(errors.city))}
            />
            {errors.city ? (
              <p className="text-sm text-destructive">{errors.city}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="address-postal" className="text-sm font-medium">
              Postal code (optional)
            </label>
            <input
              id="address-postal"
              name="postalCode"
              inputMode="numeric"
              placeholder="1205"
              value={values.postalCode}
              onChange={(event) => setField("postalCode", event.target.value)}
              className={fieldClassName(Boolean(errors.postalCode))}
            />
            {errors.postalCode ? (
              <p className="text-sm text-destructive">{errors.postalCode}</p>
            ) : null}
          </div>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : isEditing ? "Save changes" : "Save address"}
        </Button>
        {errors.form ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.form}
          </p>
        ) : null}
        {status ? (
          <p className="text-sm text-muted-foreground" role="status">
            {status}
          </p>
        ) : null}
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Saved addresses</h2>
        {addresses.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-sm text-muted-foreground">
            No addresses yet. Add one with the form.
          </p>
        ) : (
          <ul className="space-y-3">
            {addresses.map((address) => (
              <li key={address.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium">{address.fullName}</p>
                  {address.isDefault ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      Default
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{address.phone}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.city}
                  {address.postalCode ? ` · ${address.postalCode}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => loadAddressIntoForm(address)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => removeAddress(address.id)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

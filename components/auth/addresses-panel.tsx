"use client";

import { type FormEvent, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { addressSchema, type AddressInput } from "@/lib/auth/schemas";

type FieldErrors = Partial<Record<keyof AddressInput | "form", string>>;

type SavedAddress = AddressInput & { id: string };

export function AddressesPanel() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const formData = new FormData(event.currentTarget);
    const parsed = addressSchema.safeParse({
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      addressLine1: formData.get("addressLine1"),
      addressLine2: formData.get("addressLine2") || undefined,
      city: formData.get("city"),
      postalCode: formData.get("postalCode") || "",
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
    setAddresses((current) => [
      ...current,
      { ...parsed.data, id: crypto.randomUUID() },
    ]);
    setStatus("Address saved in this browser session only. Nothing was persisted.");
    event.currentTarget.reset();
  }

  function removeAddress(id: string) {
    setAddresses((current) => current.filter((address) => address.id !== id));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form className="space-y-4 rounded-xl border p-5" onSubmit={onSubmit} noValidate>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Add address</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bangladesh-friendly fields. Local React state only — refresh clears
            the list.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address-name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="address-name"
            name="fullName"
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
              className={fieldClassName(Boolean(errors.postalCode))}
            />
            {errors.postalCode ? (
              <p className="text-sm text-destructive">{errors.postalCode}</p>
            ) : null}
          </div>
        </div>

        <Button type="submit">Save address (session only)</Button>
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
                <p className="font-medium">{address.fullName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {address.phone}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.city}
                  {address.postalCode ? ` · ${address.postalCode}` : ""}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => removeAddress(address.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

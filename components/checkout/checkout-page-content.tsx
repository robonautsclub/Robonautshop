"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { useCart } from "@/components/cart/cart-provider";
import { CheckoutLocationPicker } from "@/components/checkout/checkout-location-picker";
import type { MapCoordinates } from "@/components/checkout/location-map-picker";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState } from "@/components/product";
import { Button, buttonVariants } from "@/components/ui/button";
import { addressSchema } from "@/lib/auth/schemas";
import { formatBdt } from "@/lib/catalog";
import {
  estimateShippingBdt,
  PAYMENT_METHODS,
  type PaymentMethodId,
} from "@/lib/checkout/types";
import { placeOrderAction } from "@/lib/server-cart/actions";
import { cn } from "@/lib/utils";

type AddressErrors = Partial<
  Record<
    | "fullName"
    | "phone"
    | "addressLine1"
    | "addressLine2"
    | "city"
    | "postalCode"
    | "form",
    string
  >
>;

export function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentErrorFromUrl = searchParams.get("paymentError");
  const { hydrated, resolvedLines, subtotal, clearCart } = useCart();
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [cityDraft, setCityDraft] = useState("Dhaka");
  const [postalCode, setPostalCode] = useState("");
  const [pinnedLocation, setPinnedLocation] = useState<MapCoordinates | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("COD");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [errors, setErrors] = useState<AddressErrors>({});
  const [status, setStatus] = useState<string | null>(null);

  const shipping = useMemo(
    () => estimateShippingBdt(cityDraft),
    [cityDraft],
  );
  const total = subtotal + shipping.amount;

  if (!hydrated) {
    return (
      <PageContainer as="section" className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">Loading cart…</p>
      </PageContainer>
    );
  }

  if (resolvedLines.length === 0) {
    return (
      <PageContainer as="section" className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <div className="mt-6">
          <CatalogEmptyState
            title="Your cart is empty"
            description="Add products before checking out."
            actionHref="/products"
            actionLabel="Browse products"
          />
        </div>
      </PageContainer>
    );
  }

  async function onPlaceOrder(event: FormEvent<HTMLFormElement>) {
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
      const nextErrors: AddressErrors = {};
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
    setStatus("Placing order…");

    // Prices, stock, and the shipping total are all recomputed server-side
    // from the signed-in user's real cart — this request only carries the
    // delivery details (AGENTS.md "Pricing": never trust the client).
    const result = await placeOrderAction({
      address: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2,
        city: parsed.data.city,
        postalCode: parsed.data.postalCode || undefined,
      },
      location: pinnedLocation ?? undefined,
      paymentMethod,
      specialInstructions: specialInstructions.trim() || undefined,
    });

    if (!result.ok) {
      setErrors({ form: result.error });
      setStatus(null);
      return;
    }

    // bKash: keep the cart until payment succeeds and the order is created
    // in the callback. COD/Nagad: order already exists — clear local cart.
    if (result.redirectUrl) {
      setStatus("Redirecting to bKash…");
      window.location.assign(result.redirectUrl);
      return;
    }

    clearCart();
    setStatus("Order placed. Redirecting…");
    router.push(`/checkout/confirmation?orderId=${result.orderId}`);
  }

  return (
    <PageContainer as="section" className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Choose Cash on Delivery or pay online with bKash Checkout. Prices and
          stock are confirmed on the server when you place the order.
        </p>
        {(errors.form || paymentErrorFromUrl) && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {errors.form ?? paymentErrorFromUrl}
          </p>
        )}
      </div>

      <form
        onSubmit={onPlaceOrder}
        noValidate
        className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]"
      >
        <div className="space-y-8">
          <section className="space-y-4 rounded-xl border p-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Delivery address
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Type an address or pin it on the map to auto-fill road, area,
                city, and postal code.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="checkout-name" className="text-sm font-medium">
                  Full name
                </label>
                <input
                  id="checkout-name"
                  name="fullName"
                  className={fieldClassName(Boolean(errors.fullName))}
                />
                {errors.fullName ? (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                ) : null}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="checkout-phone" className="text-sm font-medium">
                  Mobile phone
                </label>
                <input
                  id="checkout-phone"
                  name="phone"
                  inputMode="numeric"
                  placeholder="01XXXXXXXXX"
                  className={fieldClassName(Boolean(errors.phone))}
                />
                {errors.phone ? (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                ) : null}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="checkout-line1" className="text-sm font-medium">
                  Road / street
                </label>
                <input
                  id="checkout-line1"
                  name="addressLine1"
                  value={addressLine1}
                  onChange={(event) => setAddressLine1(event.target.value)}
                  className={fieldClassName(Boolean(errors.addressLine1))}
                />
                {errors.addressLine1 ? (
                  <p className="text-sm text-destructive">
                    {errors.addressLine1}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="checkout-line2" className="text-sm font-medium">
                  Area / landmark (optional)
                </label>
                <input
                  id="checkout-line2"
                  name="addressLine2"
                  value={addressLine2}
                  onChange={(event) => setAddressLine2(event.target.value)}
                  className={fieldClassName(Boolean(errors.addressLine2))}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="checkout-city" className="text-sm font-medium">
                  City / district
                </label>
                <input
                  id="checkout-city"
                  name="city"
                  value={cityDraft}
                  onChange={(event) => setCityDraft(event.target.value)}
                  className={fieldClassName(Boolean(errors.city))}
                />
                {errors.city ? (
                  <p className="text-sm text-destructive">{errors.city}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="checkout-postal" className="text-sm font-medium">
                  Postal code (optional)
                </label>
                <input
                  id="checkout-postal"
                  name="postalCode"
                  inputMode="numeric"
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  className={fieldClassName(Boolean(errors.postalCode))}
                />
                {errors.postalCode ? (
                  <p className="text-sm text-destructive">{errors.postalCode}</p>
                ) : null}
              </div>

              <CheckoutLocationPicker
                value={pinnedLocation}
                onChange={setPinnedLocation}
                onResolvedAddress={(resolved) => {
                  setAddressLine1(resolved.addressLine1);
                  setAddressLine2(resolved.addressLine2 ?? "");
                  setCityDraft(resolved.city);
                  setPostalCode(resolved.postalCode ?? "");
                  setErrors((current) => ({
                    ...current,
                    addressLine1: undefined,
                    addressLine2: undefined,
                    city: undefined,
                    postalCode: undefined,
                  }));
                }}
              />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border p-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Delivery charge
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Mock city-based charge — not a Pathao/Steadfast quote.
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{shipping.method}</span>
                <span className="font-semibold">
                  {shipping.amount > 0 ? formatBdt(shipping.amount) : "—"}
                </span>
              </div>
              <p className="mt-2 text-muted-foreground">{shipping.note}</p>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border p-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Special instructions
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Optional notes for delivery — gate code, preferred time, landmark
                details, and similar.
              </p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="checkout-instructions" className="sr-only">
                Special instructions
              </label>
              <textarea
                id="checkout-instructions"
                name="specialInstructions"
                rows={3}
                value={specialInstructions}
                onChange={(event) => setSpecialInstructions(event.target.value)}
                maxLength={500}
                placeholder="e.g. Call on arrival, leave with security…"
                className={cn(fieldClassName(false), "min-h-24 resize-y")}
              />
              <p className="text-xs text-muted-foreground">
                {specialInstructions.length}/500
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border p-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Payment method
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Selection only. No payment is processed.
              </p>
            </div>
            <fieldset className="space-y-3">
              <legend className="sr-only">Choose payment method</legend>
              {PAYMENT_METHODS.map((method) => {
                const selected = paymentMethod === method.id;
                return (
                  <label
                    key={method.id}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-lg border p-3",
                      selected && "border-foreground",
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selected}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        {method.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {method.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-xl border p-5">
          <h2 className="text-lg font-semibold tracking-tight">Order summary</h2>
          <ul className="space-y-3 text-sm">
            {resolvedLines.map((line) => (
              <li key={line.key} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {line.name} × {line.quantity}
                </span>
                <span className="font-medium">{formatBdt(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBdt(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Delivery charge</span>
              <span>
                {shipping.amount > 0 ? formatBdt(shipping.amount) : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatBdt(total)}</span>
            </div>
          </div>

          {errors.form ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.form}
            </p>
          ) : null}

          <Button type="submit" className="w-full">
            Place order
          </Button>
          <Link
            href="/cart"
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Back to cart
          </Link>

          {status ? (
            <p className="text-sm text-muted-foreground" role="status">
              {status}
            </p>
          ) : null}
        </aside>
      </form>
    </PageContainer>
  );
}

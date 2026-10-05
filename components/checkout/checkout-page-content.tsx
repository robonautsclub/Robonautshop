"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { fieldClassName } from "@/components/auth/auth-form-shell";
import { useCart } from "@/components/cart/cart-provider";
import { CheckoutLocationPicker } from "@/components/checkout/checkout-location-picker";
import type { MapCoordinates } from "@/components/checkout/location-map-picker";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogEmptyState } from "@/components/product";
import { Button, buttonVariants } from "@/components/ui/button";
import { getMyAddressesAction } from "@/lib/account/address-actions";
import type { UserAddressRecord } from "@/lib/account/address-queries";
import { addressSchema } from "@/lib/auth/schemas";
import { formatBdt } from "@/lib/catalog";
import {
  estimateShippingBdt,
  PAYMENT_METHODS,
  type PaymentMethodId,
} from "@/lib/checkout/types";
import { previewCouponAction } from "@/lib/coupons/actions";
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
  const [savedAddresses, setSavedAddresses] = useState<UserAddressRecord[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
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
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(
    null,
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getMyAddressesAction().then((addresses) => {
      if (cancelled) {
        return;
      }
      setSavedAddresses(addresses);
      const preferred =
        addresses.find((row) => row.isDefault) ?? addresses[0] ?? null;
      if (preferred) {
        setSelectedAddressId(preferred.id);
        setFullName(preferred.fullName);
        setPhone(preferred.phone);
        setAddressLine1(preferred.addressLine1);
        setAddressLine2(preferred.addressLine2 ?? "");
        setCityDraft(preferred.city);
        setPostalCode(preferred.postalCode ?? "");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const shipping = useMemo(
    () => estimateShippingBdt(cityDraft),
    [cityDraft],
  );
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + shipping.amount - discountAmount);

  async function applyCoupon() {
    setCouponError(null);
    if (!couponInput.trim()) {
      return;
    }
    setCouponChecking(true);
    const result = await previewCouponAction(couponInput, subtotal);
    setCouponChecking(false);

    if (!result.ok) {
      setCouponError(result.error);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon({ code: result.code, discountAmount: result.discountAmount });
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  function applySavedAddress(addressId: string) {
    setSelectedAddressId(addressId);
    if (!addressId) {
      return;
    }
    const address = savedAddresses.find((row) => row.id === addressId);
    if (!address) {
      return;
    }
    setFullName(address.fullName);
    setPhone(address.phone);
    setAddressLine1(address.addressLine1);
    setAddressLine2(address.addressLine2 ?? "");
    setCityDraft(address.city);
    setPostalCode(address.postalCode ?? "");
    setErrors((current) => ({
      ...current,
      fullName: undefined,
      phone: undefined,
      addressLine1: undefined,
      addressLine2: undefined,
      city: undefined,
      postalCode: undefined,
    }));
  }

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
      couponCode: appliedCoupon?.code,
    });

    if (!result.ok) {
      setErrors({ form: result.error });
      setStatus(null);
      return;
    }

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
                Use a previous address, type a new one, or pin it on the map.
              </p>
            </div>

            {savedAddresses.length > 0 ? (
              <div className="space-y-1.5">
                <label
                  htmlFor="checkout-saved-address"
                  className="text-sm font-medium"
                >
                  Use previous address
                </label>
                <select
                  id="checkout-saved-address"
                  value={selectedAddressId}
                  onChange={(event) => applySavedAddress(event.target.value)}
                  className={fieldClassName(false)}
                >
                  <option value="">Enter a new address</option>
                  {savedAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.fullName} · {address.addressLine1},{" "}
                      {address.city}
                      {address.isDefault ? " (default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="checkout-name" className="text-sm font-medium">
                  Full name
                </label>
                <input
                  id="checkout-name"
                  name="fullName"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setSelectedAddressId("");
                  }}
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
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setSelectedAddressId("");
                  }}
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
                  onChange={(event) => {
                    setAddressLine1(event.target.value);
                    setSelectedAddressId("");
                  }}
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
                  onChange={(event) => {
                    setAddressLine2(event.target.value);
                    setSelectedAddressId("");
                  }}
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
                  onChange={(event) => {
                    setCityDraft(event.target.value);
                    setSelectedAddressId("");
                  }}
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
                  onChange={(event) => {
                    setPostalCode(event.target.value);
                    setSelectedAddressId("");
                  }}
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
                  setSelectedAddressId("");
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
                Optional notes for delivery — gate code, preferred time,
                landmark details, and similar.
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
                Cash on Delivery places the order immediately. bKash redirects
                you to complete payment.
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
          <div className="space-y-1.5 border-t pt-3">
            <label htmlFor="checkout-coupon" className="text-sm font-medium">
              Coupon code
            </label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-foreground/20 bg-muted/30 px-3 py-2 text-sm">
                <span className="font-medium">{appliedCoupon.code} applied</span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  id="checkout-coupon"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Enter code"
                  className={fieldClassName(Boolean(couponError))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void applyCoupon()}
                  disabled={couponChecking}
                >
                  {couponChecking ? "Checking…" : "Apply"}
                </Button>
              </div>
            )}
            {couponError ? <p className="text-sm text-destructive">{couponError}</p> : null}
          </div>

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
            {discountAmount > 0 ? (
              <div className="flex justify-between gap-3 text-emerald-700 dark:text-emerald-400">
                <span>Discount</span>
                <span>-{formatBdt(discountAmount)}</span>
              </div>
            ) : null}
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

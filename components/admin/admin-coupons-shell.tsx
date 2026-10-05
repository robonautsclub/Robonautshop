"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AdminDeleteTrigger } from "@/components/admin/admin-confirm-delete-dialog";
import {
  AdminField,
  AdminFormDialog,
  fieldClassName,
} from "@/components/admin/admin-form-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminStatusBadge,
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { formatBdt } from "@/lib/catalog";
import {
  createCouponAction,
  deleteCouponAction,
  toggleCouponActiveAction,
} from "@/lib/coupons/actions";
import type { CouponRecord } from "@/lib/coupons/queries";
import { couponSchema } from "@/lib/coupons/schemas";

/**
 * Unlike the other admin shells (still local-state demos), coupons write
 * real rows to D1 — checkout actually validates against them, so there's
 * no demo-only path that would work.
 */
export function AdminCouponsShell({ coupons }: { coupons: CouponRecord[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const parsed = couponSchema.safeParse({
      code: formData.get("code"),
      type: formData.get("type"),
      value: formData.get("value"),
      minSubtotal: formData.get("minSubtotal") || undefined,
      maxUses: formData.get("maxUses") || undefined,
      active: true,
      expiresAt: formData.get("expiresAt") || undefined,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid coupon.");
      return;
    }

    setSubmitting(true);
    const result = await createCouponAction(parsed.data);
    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setShowCreate(false);
    setStatus(`Coupon ${result.coupon.code} created.`);
    router.refresh();
  }

  async function onToggleActive(coupon: CouponRecord) {
    await toggleCouponActiveAction(coupon.id, !coupon.active);
    router.refresh();
  }

  async function onDelete(coupon: CouponRecord) {
    await deleteCouponAction(coupon.id);
    setStatus(`Coupon ${coupon.code} deleted.`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coupons"
        description={`${coupons.length} coupon${coupons.length === 1 ? "" : "s"} · Real, enforced at checkout.`}
        actions={
          <Button type="button" size="sm" onClick={() => setShowCreate(true)}>
            New coupon
          </Button>
        }
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Code</AdminTh>
          <AdminTh>Discount</AdminTh>
          <AdminTh>Min. subtotal</AdminTh>
          <AdminTh>Uses</AdminTh>
          <AdminTh>Status</AdminTh>
          <AdminTh className="text-right">Actions</AdminTh>
        </AdminTableHead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-muted/30">
              <AdminTd className="font-mono text-xs font-medium">{coupon.code}</AdminTd>
              <AdminTd>
                {coupon.type === "PERCENT" ? `${coupon.value}%` : formatBdt(coupon.value)}
              </AdminTd>
              <AdminTd>{coupon.minSubtotal ? formatBdt(coupon.minSubtotal) : "—"}</AdminTd>
              <AdminTd>
                {coupon.usedCount}
                {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
              </AdminTd>
              <AdminTd>
                <AdminStatusBadge tone={coupon.active ? "success" : "neutral"}>
                  {coupon.active ? "Active" : "Inactive"}
                </AdminStatusBadge>
              </AdminTd>
              <AdminTd className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void onToggleActive(coupon)}
                  >
                    {coupon.active ? "Deactivate" : "Activate"}
                  </Button>
                  <AdminDeleteTrigger
                    itemLabel={`the coupon “${coupon.code}”`}
                    title="Delete coupon?"
                    description={`Are you sure you want to delete “${coupon.code}”? This cannot be undone.`}
                    buttonLabel="Delete"
                    buttonVariant="destructive"
                    onConfirm={() => void onDelete(coupon)}
                  />
                </div>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      {status ? (
        <p className="text-sm text-muted-foreground" role="status">
          {status}
        </p>
      ) : null}

      <AdminFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Create coupon"
        noun="coupon"
        description="Real coupon — enforced server-side at checkout immediately."
        submitLabel={submitting ? "Creating…" : "Create coupon"}
        onSubmit={onCreateSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField id="admin-coupon-code" label="Code">
            <input
              id="admin-coupon-code"
              name="code"
              placeholder="WELCOME10"
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-coupon-type" label="Type">
            <select id="admin-coupon-type" name="type" defaultValue="PERCENT" className={fieldClassName()}>
              <option value="PERCENT">Percent off</option>
              <option value="FIXED">Fixed BDT off</option>
            </select>
          </AdminField>
          <AdminField id="admin-coupon-value" label="Value">
            <input
              id="admin-coupon-value"
              name="value"
              type="number"
              min={1}
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-coupon-min" label="Min. subtotal (BDT, optional)">
            <input
              id="admin-coupon-min"
              name="minSubtotal"
              type="number"
              min={0}
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-coupon-max" label="Max uses (optional)">
            <input
              id="admin-coupon-max"
              name="maxUses"
              type="number"
              min={1}
              className={fieldClassName()}
            />
          </AdminField>
          <AdminField id="admin-coupon-expires" label="Expires on (optional)">
            <input
              id="admin-coupon-expires"
              name="expiresAt"
              type="date"
              className={fieldClassName()}
            />
          </AdminField>
        </div>

        {formError ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}
      </AdminFormDialog>
    </div>
  );
}

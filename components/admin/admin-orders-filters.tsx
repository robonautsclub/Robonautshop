import Link from "next/link";

import { fieldClassName } from "@/components/admin/admin-form-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { ORDER_STATUS_VALUES, PAYMENT_STATUS_VALUES } from "@/lib/db/schema/shared";
import { hasAdminOrderFilters, type AdminOrderFilters } from "@/lib/orders/admin-filters";
import { cn } from "@/lib/utils";

/**
 * Plain GET form, so filters live in the URL and survive a reload or a
 * shared link (tasks/phase-19-admin-catalog/126). No client JS needed.
 */
export function AdminOrdersFilters({ filters }: { filters: AdminOrderFilters }) {
  return (
    <form method="get" action="/admin/orders" className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
      <label className="space-y-1 text-xs font-medium">
        Search
        <input
          type="search"
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Order ID, name, phone or email"
          className={fieldClassName()}
        />
      </label>
      <label className="space-y-1 text-xs font-medium">
        Order status
        <select name="status" defaultValue={filters.status ?? ""} className={fieldClassName()}>
          <option value="">Any</option>
          {ORDER_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-medium">
        Payment
        <select name="payment" defaultValue={filters.payment ?? ""} className={fieldClassName()}>
          <option value="">Any</option>
          {PAYMENT_STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-medium">
        From
        <input type="date" name="from" defaultValue={filters.from ?? ""} className={fieldClassName()} />
      </label>
      <label className="space-y-1 text-xs font-medium">
        To
        <input type="date" name="to" defaultValue={filters.to ?? ""} className={fieldClassName()} />
      </label>
      <div className="flex items-end gap-2">
        <Button type="submit" size="sm">
          Apply
        </Button>
        {hasAdminOrderFilters(filters) ? (
          <Link href="/admin/orders" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}

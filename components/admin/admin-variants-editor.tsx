"use client";

import { Plus } from "lucide-react";

import { fieldClassName } from "@/components/admin/admin-form-dialog";
import { Button } from "@/components/ui/button";

export type AdminVariantDraft = {
  /** Set for variants already saved; new rows have none. */
  id?: string;
  name: string;
  sku: string;
  price: string;
};

/**
 * Variant rows for the product dialog (tasks/phase-19-admin-catalog/119).
 * Saved variants can be edited but not removed here — they may be in carts,
 * kits or past orders; archive the product instead.
 */
export function AdminVariantsEditor({
  variants,
  onChange,
}: {
  variants: AdminVariantDraft[];
  onChange: (variants: AdminVariantDraft[]) => void;
}) {
  function update(index: number, patch: Partial<AdminVariantDraft>) {
    onChange(variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)));
  }

  return (
    <fieldset className="space-y-3 border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <legend className="text-sm font-semibold tracking-tight">Variants (optional)</legend>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onChange([...variants, { name: "", sku: "", price: "" }])}
        >
          <Plus aria-hidden className="size-4" />
          Add variant
        </Button>
      </div>
      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No variants — stock is tracked for the product itself.
        </p>
      ) : (
        <ul className="space-y-2">
          {variants.map((variant, index) => (
            <li key={variant.id ?? `new-${index}`} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_8rem_auto]">
              <label className="space-y-1 text-xs font-medium">
                Name
                <input
                  value={variant.name}
                  onChange={(event) => update(index, { name: event.target.value })}
                  placeholder="200 RPM"
                  className={fieldClassName()}
                />
              </label>
              <label className="space-y-1 text-xs font-medium">
                SKU
                <input
                  value={variant.sku}
                  onChange={(event) => update(index, { sku: event.target.value })}
                  placeholder="N20-200"
                  className={fieldClassName()}
                />
              </label>
              <label className="space-y-1 text-xs font-medium">
                Price (blank = product)
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={variant.price}
                  onChange={(event) => update(index, { price: event.target.value })}
                  className={fieldClassName()}
                />
              </label>
              <div className="flex items-end">
                {variant.id ? (
                  <span className="pb-2 text-xs text-muted-foreground">Saved</span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onChange(variants.filter((_, i) => i !== index))}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}

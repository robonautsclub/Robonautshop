"use client";

import { type FormEvent, type ReactNode, useState } from "react";

import { AdminDialog } from "@/components/admin/admin-dialog";
import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";

/**
 * Shown when an admin form has no real save handler yet (mock-backed
 * sections). Never claim "saved" for data that was not persisted
 * (tasks/phase-18-hardening/118, AGENTS.md §49).
 */
export const PREVIEW_ONLY_MESSAGE = "Preview only — changes are not saved yet.";

type AdminFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  noun: string;
  children: ReactNode;
  submitLabel?: string;
  description?: string;
  className?: string;
  /**
   * When provided, replaces the default local submit with a real handler —
   * used by features backed by actual D1 writes (e.g. coupons).
   */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export function AdminFormDialog({
  open,
  onOpenChange,
  title,
  noun,
  children,
  submitLabel = "Save",
  description,
  className,
  onSubmit: onSubmitProp,
}: AdminFormDialogProps) {
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (onSubmitProp) {
      onSubmitProp(event);
      return;
    }
    event.preventDefault();
    setMessage(`${PREVIEW_ONLY_MESSAGE} “${noun}” was not stored.`);
  }

  const previewOnly = !onSubmitProp;

  return (
    <AdminDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setMessage(null);
        onOpenChange(next);
      }}
      title={title}
      description={
        previewOnly
          ? [description, "Preview — this section isn't connected to the database yet."]
              .filter(Boolean)
              .join(" ")
          : description
      }
      className={className}
    >
      <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
        {children}
        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <Button type="submit">{submitLabel}</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
        {message ? (
          <p
            className="rounded-md border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
            role="status"
          >
            {message}
          </p>
        ) : null}
      </form>
    </AdminDialog>
  );
}

export function AdminField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

export { fieldClassName };

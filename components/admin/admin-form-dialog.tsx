"use client";

import { type FormEvent, type ReactNode, useState } from "react";

import { AdminDialog } from "@/components/admin/admin-dialog";
import { AdminFormNote } from "@/components/admin/admin-shell-note";
import { fieldClassName } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";

type AdminFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  noun: string;
  children: ReactNode;
  submitLabel?: string;
  description?: string;
  className?: string;
};

export function AdminFormDialog({
  open,
  onOpenChange,
  title,
  noun,
  children,
  submitLabel = "Save (demo)",
  description,
  className,
}: AdminFormDialogProps) {
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      `Demo only — this ${noun} was not saved. Persistence comes in a later phase.`,
    );
  }

  return (
    <AdminDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setMessage(null);
        onOpenChange(next);
      }}
      title={title}
      description={
        description ??
        "Form shell only. Submitting will not persist to a database."
      }
      className={className}
    >
      <AdminFormNote noun={noun} />
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
          <p className="text-sm text-muted-foreground" role="status">
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

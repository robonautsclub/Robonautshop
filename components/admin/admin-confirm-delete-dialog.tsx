"use client";

import { useState, type ReactNode } from "react";

import { AdminDialog } from "@/components/admin/admin-dialog";
import { Button } from "@/components/ui/button";

type AdminConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** e.g. "this product", "Arduino Nano", "these kit components" */
  itemLabel: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export function AdminConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Confirm deletion",
  itemLabel,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: AdminConfirmDeleteDialogProps) {
  return (
    <AdminDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        description ??
        `Are you sure you want to delete ${itemLabel}? This cannot be undone.`
      }
      className="sm:max-w-md"
    >
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Keep it
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </AdminDialog>
  );
}

type AdminDeleteTriggerProps = {
  itemLabel: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  buttonLabel?: string;
  buttonVariant?: "ghost" | "outline" | "destructive";
  buttonSize?: "sm" | "default" | "xs";
  onConfirm: () => void;
  className?: string;
  children?: ReactNode;
};

/**
 * Destructive action button that always asks for confirmation first.
 */
export function AdminDeleteTrigger({
  itemLabel,
  title,
  description,
  confirmLabel,
  buttonLabel = "Delete",
  buttonVariant = "outline",
  buttonSize = "sm",
  onConfirm,
  className,
  children,
}: AdminDeleteTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children ?? buttonLabel}
      </Button>
      <AdminConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        itemLabel={itemLabel}
        description={description}
        confirmLabel={confirmLabel ?? buttonLabel}
        onConfirm={onConfirm}
      />
    </>
  );
}

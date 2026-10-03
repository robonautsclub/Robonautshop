"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { AdminShellNote } from "@/components/admin/admin-shell-note";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Base UI Sheet can mismatch useId during SSR hydration.
 * Mount only after the client is ready.
 */
export function AdminMobileNav() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open admin menu"
        disabled
      >
        <Menu />
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open admin menu"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>Admin menu</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto p-4">
          <AdminShellNote />
          <AdminNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

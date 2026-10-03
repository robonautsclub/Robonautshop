"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
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
      <SheetContent side="left" className="h-full w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Admin menu</SheetTitle>
        </SheetHeader>
        <AdminSidebar
          className="h-full min-h-0"
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

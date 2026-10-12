"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { SiteLogo } from "@/components/brand/site-logo";
import { ProductSearchBox } from "@/components/layout/product-search-box";
import { storeNavLinks } from "@/components/layout/nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type MobileNavSheetProps = {
  pathname: string;
};

/**
 * Base UI Sheet generates useId values that can mismatch during SSR hydration.
 * Render a static placeholder on the server / first paint, then mount the Sheet
 * only after the client has hydrated.
 */
export function MobileNavSheet({ pathname }: MobileNavSheetProps) {
  const { hydrated: authHydrated, isSignedIn } = useAuth();
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
        className="md:hidden"
        aria-label="Open menu"
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
            className="md:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="sr-only">Robonautsshop</SheetTitle>
          <SiteLogo href="/" size="sm" />
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {storeNavLinks.map((link) => (
            <SheetClose
              key={link.href}
              nativeButton={false}
              render={<Link href={link.href} />}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                isActive(pathname, link.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </SheetClose>
          ))}
          {authHydrated && !isSignedIn ? (
            <SheetClose
              nativeButton={false}
              render={<Link href="/user/login" />}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
            >
              Sign in
            </SheetClose>
          ) : null}
          {authHydrated && isSignedIn ? (
            <SheetClose
              nativeButton={false}
              render={<Link href="/account" />}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
            >
              Account
            </SheetClose>
          ) : null}
        </nav>
        <div className="mt-4 space-y-2 px-4">
          <p className="text-xs font-medium">Search products</p>
          <ProductSearchBox
            inputId="mobile-search"
            label="Search products"
            placeholder="Name, SKU…"
            inputClassName="h-9"
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

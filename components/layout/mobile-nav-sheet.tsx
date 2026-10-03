"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { SiteLogo } from "@/components/brand/site-logo";
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
    <Sheet>
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
          <SheetTitle className="sr-only">Robonautshop</SheetTitle>
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
              render={<Link href="/login" />}
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
        <form
          action="/products"
          method="get"
          className="mt-4 space-y-2 px-4"
          role="search"
        >
          <label htmlFor="mobile-search" className="text-xs font-medium">
            Search products
          </label>
          <input
            id="mobile-search"
            name="q"
            type="search"
            placeholder="Name, SKU…"
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button
            type="submit"
            className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground"
          >
            Search
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

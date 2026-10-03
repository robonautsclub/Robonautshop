"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, UserRound } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { NavbarSearch } from "@/components/layout/navbar-search";
import { storeNavLinks } from "@/components/layout/nav-links";
import { PageContainer } from "@/components/layout/page-container";
import { Button, buttonVariants } from "@/components/ui/button";
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

export function Navbar() {
  const pathname = usePathname();
  const { hydrated, itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <PageContainer className="flex h-14 items-center gap-3">
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
              <SheetTitle>Robonautshop</SheetTitle>
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
              <SheetClose
                nativeButton={false}
                render={<Link href="/login" />}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
              >
                Sign in
              </SheetClose>
              <SheetClose
                nativeButton={false}
                render={<Link href="/register" />}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
              >
                Create account
              </SheetClose>
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

        <Link href="/" className="text-base font-semibold tracking-tight">
          Robonautshop
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {storeNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium",
                isActive(pathname, link.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <NavbarSearch />
          <div className="hidden items-center gap-1 sm:flex">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                isActive(pathname, "/login") && "bg-muted",
              )}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                isActive(pathname, "/register") && "bg-muted",
              )}
            >
              Register
            </Link>
          </div>
          <Link
            href="/cart"
            aria-label={
              hydrated && itemCount > 0 ? `Cart, ${itemCount} items` : "Cart"
            }
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative",
            )}
          >
            <ShoppingCart />
            {hydrated && itemCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              isActive(pathname, "/account") && "bg-muted",
            )}
          >
            <UserRound />
          </Link>
        </div>
      </PageContainer>
    </header>
  );
}

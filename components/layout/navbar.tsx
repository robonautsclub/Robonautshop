"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, UserRound } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { SiteLogo } from "@/components/brand/site-logo";
import { useCart } from "@/components/cart/cart-provider";
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet";
import { NavbarSearch } from "@/components/layout/navbar-search";
import { storeNavLinks } from "@/components/layout/nav-links";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const { hydrated: cartHydrated, itemCount } = useCart();
  const { hydrated: authHydrated, isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <PageContainer className="flex h-14 items-center gap-3">
        <MobileNavSheet pathname={pathname} />

        <SiteLogo href="/" size="sm" priority />

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
          <Link
            href="/cart"
            aria-label={
              cartHydrated && itemCount > 0
                ? `Cart, ${itemCount} items`
                : "Cart"
            }
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative",
            )}
          >
            <ShoppingCart />
            {cartHydrated && itemCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>

          {authHydrated && !isSignedIn ? (
            <Link
              href="/user/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                isActive(pathname, "/user/login") && "bg-muted",
              )}
            >
              Sign in
            </Link>
          ) : null}

          {authHydrated && isSignedIn ? (
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
          ) : null}
        </div>
      </PageContainer>
    </header>
  );
}

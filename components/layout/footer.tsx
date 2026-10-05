import Link from "next/link";
import type { ReactNode } from "react";
import { Lock, Mail, MapPin, Phone } from "lucide-react";

import { SiteLogo } from "@/components/brand/site-logo";
import { PageContainer } from "@/components/layout/page-container";
import { storeNavLinks } from "@/components/layout/nav-links";
import { cn } from "@/lib/utils";

const helpLinks = [
  { href: "/docs", label: "Help & docs" },
  { href: "/guides", label: "Robot guides" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/cart", label: "Cart" },
  { href: "/account", label: "Account" },
  { href: "/account/orders", label: "Order tracking" },
  { href: "/builder", label: "Robot Builder" },
] as const;

const paymentMethods = [
  {
    id: "bkash",
    label: "bKash",
    className:
      "border-[#E2136E]/25 bg-[#E2136E]/10 text-[#9B0B4A] dark:text-[#FF7AB5]",
  },
] as const;

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.94_0.02_250),transparent_50%),linear-gradient(180deg,oklch(0.985_0.008_240),oklch(0.97_0.01_240))]"
      />

      <PageContainer className="relative flex flex-col gap-6 py-8 sm:py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(2,minmax(0,1fr))]">
          <div className="max-w-md space-y-2.5 sm:col-span-2 lg:col-span-1">
            <SiteLogo href="/" size="md" />
            <p className="text-sm leading-snug text-muted-foreground">
              Robotics parts, kits, and guided builds for students, makers, and
              competition teams across Bangladesh.
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin
                  className="size-3.5 shrink-0 text-foreground/70"
                  aria-hidden
                />
                <span>Dhaka, Bangladesh · Nationwide courier delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone
                  className="size-3.5 shrink-0 text-foreground/70"
                  aria-hidden
                />
                <a
                  href="tel:+8801700000000"
                  className="transition-colors hover:text-foreground"
                >
                  +880 1700-000000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail
                  className="size-3.5 shrink-0 text-foreground/70"
                  aria-hidden
                />
                <a
                  href="mailto:hello@robonautsshop.com"
                  className="transition-colors hover:text-foreground"
                >
                  hello@robonautsshop.com
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-foreground/80 uppercase">
              Shop
            </p>
            <nav className="flex flex-col gap-1" aria-label="Shop">
              {storeNavLinks.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </nav>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-foreground/80 uppercase">
              Help
            </p>
            <nav className="flex flex-col gap-1" aria-label="Help">
              {helpLinks.map((link) => (
                <FooterLink key={link.href} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p>© {year} Robonautsshop</p>
            <span className="hidden h-3 w-px bg-border sm:inline-block" aria-hidden />
            <p className="inline-flex items-center gap-1.5 text-xs">
              <Lock className="size-3 shrink-0" aria-hidden />
              <span>Pay with</span>
              {paymentMethods.map((method) => (
                <span
                  key={method.id}
                  className={cn(
                    "inline-flex h-5 items-center rounded border px-1.5 text-[10px] font-semibold tracking-tight",
                    method.className,
                  )}
                >
                  {method.label}
                </span>
              ))}
            </p>
          </div>
          <p className="sm:text-right">
            Developed by{" "}
            <a
              href="https://github.com/salahakramfuad"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
            >
              Mohammad Salah
            </a>
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}

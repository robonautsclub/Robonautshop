import Link from "next/link";
import type { ReactNode } from "react";
import { Lock, Mail, MapPin, Phone } from "lucide-react";

import { SiteLogo } from "@/components/brand/site-logo";
import { PageContainer } from "@/components/layout/page-container";
import { storeNavLinks } from "@/components/layout/nav-links";
import { cn } from "@/lib/utils";

const helpLinks = [
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
  {
    id: "nagad",
    label: "Nagad",
    className:
      "border-[#F68712]/30 bg-[#F68712]/10 text-[#9A4E00] dark:text-[#FFB86A]",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    className: "border-foreground/15 bg-muted/60 text-foreground",
  },
  {
    id: "sslcommerz",
    label: "SSLCOMMERZ",
    className:
      "border-sky-500/25 bg-sky-500/10 text-sky-800 dark:text-sky-300",
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
                  href="mailto:hello@robonautshop.com"
                  className="transition-colors hover:text-foreground"
                >
                  hello@robonautshop.com
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

        <div className="space-y-2.5 rounded-xl border bg-background/70 p-3.5 sm:p-4">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-foreground/80 uppercase">
                Payment methods
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                bKash, Nagad, Cash on Delivery, or SSLCOMMERZ when live.
              </p>
            </div>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lock className="size-3.5" aria-hidden />
              Payment secrets stay with the gateway
            </p>
          </div>

          <ul className="flex flex-wrap gap-2" aria-label="Accepted payments">
            {paymentMethods.map((method) => (
              <li key={method.id}>
                <span
                  className={cn(
                    "inline-flex h-8 items-center rounded-lg border px-2.5 text-xs font-semibold tracking-tight",
                    method.className,
                  )}
                >
                  {method.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-1.5 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Robonautshop</p>
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

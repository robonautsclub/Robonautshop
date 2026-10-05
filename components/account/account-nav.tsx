import Link from "next/link";

import { cn } from "@/lib/utils";

const accountLinks = [
  { href: "/account", label: "Overview", exact: true },
  { href: "/account/addresses", label: "Addresses", exact: false },
  { href: "/account/orders", label: "Orders", exact: false },
] as const;

type AccountNavProps = {
  pathname: string;
};

export function AccountNav({ pathname }: AccountNavProps) {
  return (
    <nav aria-label="Account" className="flex flex-wrap gap-2">
      {accountLinks.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium",
              active
                ? "border-foreground bg-foreground text-background"
                : "hover:border-foreground/30",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

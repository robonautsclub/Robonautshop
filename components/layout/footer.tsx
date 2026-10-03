import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { storeNavLinks } from "@/components/layout/nav-links";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <PageContainer className="flex flex-col gap-8 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm space-y-2">
            <p className="font-semibold tracking-tight">Robonautshop</p>
            <p className="text-sm text-muted-foreground">
              Robotics parts for builders in Bangladesh, ready to expand to
              customers elsewhere later.
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            {storeNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-sm text-muted-foreground">© {year} Robonautshop</p>
      </PageContainer>
    </footer>
  );
}

import { Download } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminExportLinkProps = {
  /** Export route path, e.g. "/admin/orders/export". */
  href: string;
  /** Current filters to carry into the export. */
  params?: Record<string, string | undefined>;
};

/** Plain download link (a full request, not client navigation) to a CSV export route. */
export function AdminExportLink({ href, params = {} }: AdminExportLinkProps) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();

  return (
    <a
      href={query ? `${href}?${query}` : href}
      download
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
    >
      <Download className="size-3.5" aria-hidden />
      Export CSV
    </a>
  );
}

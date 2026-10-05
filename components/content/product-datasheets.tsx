import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";

import type { ProductDatasheet } from "@/lib/content";

type ProductDatasheetsProps = {
  datasheets: ProductDatasheet[];
};

export function ProductDatasheets({ datasheets }: ProductDatasheetsProps) {
  if (datasheets.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight">Datasheets</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Official docs and pinout references for this part.
      </p>
      <ul className="mt-4 space-y-3">
        {datasheets.map((sheet) => (
          <li key={sheet.id}>
            <a
              href={sheet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:border-foreground/20"
            >
              <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium tracking-tight">
                  {sheet.title}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {sheet.fileType}
                  </span>
                </p>
                {sheet.notes ? (
                  <p className="mt-1 text-sm text-muted-foreground">{sheet.notes}</p>
                ) : null}
              </div>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Looking for build steps? See{" "}
        <Link href="/tutorials" className="underline-offset-2 hover:underline">
          tutorials
        </Link>
        .
      </p>
    </section>
  );
}

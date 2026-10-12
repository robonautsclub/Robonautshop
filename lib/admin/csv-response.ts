import { NextResponse } from "next/server";

import { csvFilename, toCsv, type CsvCell } from "@/lib/admin/csv";

/** Builds the download response for an admin CSV export. */
export function csvResponse(
  baseName: string,
  headers: readonly string[],
  rows: readonly CsvCell[][],
): NextResponse {
  return new NextResponse(toCsv(headers, rows), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename(baseName)}"`,
      "Cache-Control": "no-store",
    },
  });
}

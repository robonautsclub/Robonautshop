import { describe, expect, it } from "vitest";

import { csvFilename, escapeCsvCell, toCsv } from "@/lib/admin/csv";

describe("escapeCsvCell", () => {
  it("neutralizes spreadsheet formulas in text", () => {
    expect(escapeCsvCell("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)");
    expect(escapeCsvCell("+8801700000000")).toBe("'+8801700000000");
    expect(escapeCsvCell("-1+1")).toBe("'-1+1");
    expect(escapeCsvCell("@cmd")).toBe("'@cmd");
    expect(escapeCsvCell("\t=1")).toBe("'\t=1");
  });

  it("keeps real numbers numeric, including negatives", () => {
    expect(escapeCsvCell(-5)).toBe("-5");
    expect(escapeCsvCell(1360)).toBe("1360");
    expect(escapeCsvCell(Number.NaN)).toBe("");
  });

  it("quotes commas, quotes and line breaks", () => {
    expect(escapeCsvCell('He said "hi", then left')).toBe('"He said ""hi"", then left"');
    expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
    expect(escapeCsvCell("=1,2")).toBe('"\'=1,2"');
  });

  it("writes empty cells for null and undefined", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
  });
});

describe("toCsv", () => {
  it("adds a BOM and CRLF line endings for Excel", () => {
    const csv = toCsv(["Name", "Total"], [["Rahim, Uddin", 100], ["=cmd", 5]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toBe('﻿Name,Total\r\n"Rahim, Uddin",100\r\n\'=cmd,5\r\n');
  });
});

describe("csvFilename", () => {
  it("builds a dated, safe filename", () => {
    expect(csvFilename("orders", new Date("2026-10-12T10:00:00Z"))).toBe("orders-2026-10-12.csv");
    expect(csvFilename("../x", new Date("2026-10-12T10:00:00Z"))).toBe("x-2026-10-12.csv");
  });
});

import { describe, expect, it } from "vitest";

import {
  buildCompareRows,
  COMPARE_MAX,
  parseCompareSlugs,
  toggleCompareSlug,
} from "@/lib/compare/rows";

describe("toggleCompareSlug", () => {
  it("adds, removes and caps at the maximum", () => {
    let slugs: string[] = [];
    for (let i = 0; i < COMPARE_MAX; i++) {
      slugs = toggleCompareSlug(slugs, `p-${i}`).slugs;
    }
    expect(slugs).toHaveLength(COMPARE_MAX);

    const over = toggleCompareSlug(slugs, "extra");
    expect(over).toEqual({ slugs, full: true });

    expect(toggleCompareSlug(slugs, "p-0").slugs).toEqual(["p-1", "p-2", "p-3"]);
  });
});

describe("parseCompareSlugs", () => {
  it("drops invalid, duplicate and excess entries", () => {
    expect(parseCompareSlugs(null)).toEqual([]);
    expect(parseCompareSlugs("nope")).toEqual([]);
    expect(parseCompareSlugs('["a","a","B C",1,"b","c","d","e"]')).toEqual(["a", "b", "c", "d"]);
  });
});

describe("buildCompareRows", () => {
  it("lines up spec keys across products and flags differences", () => {
    const rows = buildCompareRows([
      { RPM: "100", Voltage: "6V" },
      { RPM: "300", Voltage: "6V", Torque: "2kg" },
    ]);
    expect(rows).toEqual([
      { label: "RPM", values: ["100", "300"], differs: true },
      { label: "Voltage", values: ["6V", "6V"], differs: false },
      { label: "Torque", values: [null, "2kg"], differs: false },
    ]);
  });
});

import { describe, expect, it } from "vitest";

import { buildListHref, parseMultiParam, parsePageParam } from "@/lib/catalog/list-url";

describe("parsePageParam", () => {
  it("defaults to page 1 for missing or invalid values", () => {
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("-3")).toBe(1);
    expect(parsePageParam("abc")).toBe(1);
    expect(parsePageParam("3")).toBe(3);
  });
});

describe("buildListHref", () => {
  it("keeps filters, drops empty values and omits page 1", () => {
    expect(buildListHref("/products", { q: "nano", sort: "", category: "sensors" }, 1)).toBe(
      "/products?q=nano&category=sensors",
    );
    expect(buildListHref("/products", { q: "nano" }, 2)).toBe("/products?q=nano&page=2");
    expect(buildListHref("/products", {}, 1)).toBe("/products");
  });
});

describe("multi-value params", () => {
  it("round-trips repeated params", () => {
    expect(buildListHref("/products", { brand: ["Acme", "Other"] }, 2)).toBe(
      "/products?brand=Acme&brand=Other&page=2",
    );
    expect(parseMultiParam(["Acme", " ", "Acme"])).toEqual(["Acme"]);
    expect(parseMultiParam("Acme")).toEqual(["Acme"]);
    expect(parseMultiParam(undefined)).toEqual([]);
  });
});

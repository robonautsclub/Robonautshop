import { describe, expect, it } from "vitest";

import { addRecentSlug, parseRecentSlugs, RECENTLY_VIEWED_MAX } from "@/lib/catalog/recently-viewed";

describe("recently viewed", () => {
  it("puts the newest first and de-duplicates", () => {
    let list: string[] = [];
    for (const slug of ["a", "b", "c", "a"]) list = addRecentSlug(list, slug);
    expect(list).toEqual(["a", "c", "b"]);
  });

  it("caps the list length", () => {
    let list: string[] = [];
    for (let i = 0; i < RECENTLY_VIEWED_MAX + 3; i++) list = addRecentSlug(list, `p-${i}`);
    expect(list).toHaveLength(RECENTLY_VIEWED_MAX);
    expect(list[0]).toBe(`p-${RECENTLY_VIEWED_MAX + 2}`);
  });

  it("ignores corrupt or invalid stored data", () => {
    expect(parseRecentSlugs(null)).toEqual([]);
    expect(parseRecentSlugs("not json")).toEqual([]);
    expect(parseRecentSlugs('{"a":1}')).toEqual([]);
    expect(parseRecentSlugs('["ok-slug","Bad Slug",5,"<script>"]')).toEqual(["ok-slug"]);
  });
});

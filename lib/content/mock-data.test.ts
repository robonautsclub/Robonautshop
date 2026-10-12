import { describe, expect, it } from "vitest";

import { mockProducts, mockProjects } from "@/lib/catalog/mock-data";
import {
  codeExamples,
  docPages,
  productDatasheets,
  robotGuides,
  tutorials,
} from "@/lib/content/mock-data";

const productSlugs = new Set(mockProducts.map((product) => product.slug));
const projectSlugs = new Set(mockProjects.map((project) => project.slug));

describe("mock content", () => {
  it("only links to products that exist in the catalog", () => {
    const referenced = [
      ...tutorials.flatMap((item) => item.relatedProductSlugs),
      ...codeExamples.flatMap((item) => item.productSlugs),
      ...productDatasheets.map((item) => item.productSlug),
    ];
    for (const slug of referenced) {
      expect(productSlugs.has(slug), slug).toBe(true);
    }
  });

  it("only links to projects that exist in the catalog", () => {
    const referenced = [
      ...tutorials.flatMap((item) => item.relatedProjectSlugs),
      ...codeExamples.flatMap((item) => item.projectSlugs),
      ...robotGuides.flatMap((item) => (item.projectSlug ? [item.projectSlug] : [])),
    ];
    for (const slug of referenced) {
      expect(projectSlugs.has(slug), slug).toBe(true);
    }
  });

  it("has a build guide for every catalog project", () => {
    const guided = new Set(robotGuides.map((guide) => guide.projectSlug));
    for (const slug of projectSlugs) {
      expect(guided.has(slug), slug).toBe(true);
    }
  });

  it("uses unique slugs and ids", () => {
    for (const items of [tutorials, robotGuides, docPages]) {
      const slugs = items.map((item) => item.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
    const ids = [...codeExamples, ...productDatasheets].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

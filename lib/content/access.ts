import {
  codeExamples,
  docPages,
  productDatasheets,
  robotGuides,
  tutorials,
} from "@/lib/content/mock-data";
import type {
  CodeExample,
  DocPage,
  ProductDatasheet,
  RobotGuide,
  Tutorial,
} from "@/lib/content/types";

export function getTutorials(): Tutorial[] {
  return tutorials;
}

export function getTutorialBySlug(slug: string): Tutorial | null {
  return tutorials.find((item) => item.slug === slug) ?? null;
}

export function getRobotGuides(): RobotGuide[] {
  return robotGuides;
}

export function getRobotGuideBySlug(slug: string): RobotGuide | null {
  return robotGuides.find((item) => item.slug === slug) ?? null;
}

export function getRobotGuideByProjectSlug(projectSlug: string): RobotGuide | null {
  return robotGuides.find((item) => item.projectSlug === projectSlug) ?? null;
}

export function getDocPages(): DocPage[] {
  return docPages;
}

export function getDocPageBySlug(slug: string): DocPage | null {
  return docPages.find((item) => item.slug === slug) ?? null;
}

export function getDocPagesGrouped(): Array<{ section: string; pages: DocPage[] }> {
  const order: string[] = [];
  const map = new Map<string, DocPage[]>();

  for (const page of docPages) {
    if (!map.has(page.section)) {
      order.push(page.section);
      map.set(page.section, []);
    }
    map.get(page.section)!.push(page);
  }

  return order.map((section) => ({ section, pages: map.get(section)! }));
}

export function getDatasheetsForProductSlug(productSlug: string): ProductDatasheet[] {
  return productDatasheets.filter((item) => item.productSlug === productSlug);
}

export function getCodeExamplesForProductSlug(productSlug: string): CodeExample[] {
  return codeExamples.filter((item) => item.productSlugs.includes(productSlug));
}

export function getCodeExamplesForProjectSlug(projectSlug: string): CodeExample[] {
  return codeExamples.filter((item) => item.projectSlugs.includes(projectSlug));
}

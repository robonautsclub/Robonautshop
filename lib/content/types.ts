/**
 * Learning / help content types (Phase 13).
 * Mock-backed for now — not D1 tables yet (tasks 80–84 out of scope: D1).
 */

export type ContentDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type Tutorial = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  body: string[];
  difficulty: ContentDifficulty;
  estimatedMinutes: number;
  relatedProductSlugs: string[];
  relatedProjectSlugs: string[];
};

export type RobotGuide = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  body: string[];
  /** Links this guide to a catalog robot project when set. */
  projectSlug: string | null;
  difficulty: ContentDifficulty;
};

export type DocPage = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  body: string[];
  /** Group label on the docs index (e.g. Orders, Shipping). */
  section: string;
};

export type ProductDatasheet = {
  id: string;
  productSlug: string;
  title: string;
  /** External or placeholder URL — metadata only, no R2 upload in this phase. */
  url: string;
  fileType: "PDF" | "HTML" | "LINK";
  notes: string | null;
};

export type CodeExample = {
  id: string;
  title: string;
  language: string;
  description: string;
  code: string;
  productSlugs: string[];
  projectSlugs: string[];
};

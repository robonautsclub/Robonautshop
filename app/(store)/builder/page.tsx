import type { Metadata } from "next";

import { BuilderEntry } from "@/components/builder/builder-entry";
import { getProjects, type ProjectSkillLevel } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Robot Builder",
};

const SKILL_LEVELS: ProjectSkillLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "COMPETITION",
];

function parseSkill(
  value: string | undefined,
): ProjectSkillLevel | "ALL" {
  if (!value) {
    return "ALL";
  }

  return SKILL_LEVELS.includes(value as ProjectSkillLevel)
    ? (value as ProjectSkillLevel)
    : "ALL";
}

type BuilderPageProps = {
  searchParams: Promise<{ skill?: string }>;
};

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  const params = await searchParams;
  const activeSkill = parseSkill(params.skill);
  const projects =
    activeSkill === "ALL"
      ? getProjects()
      : getProjects({ skillLevel: activeSkill });

  return <BuilderEntry projects={projects} activeSkill={activeSkill} />;
}

import type { ProjectSkillLevel } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const LABELS: Record<ProjectSkillLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  COMPETITION: "Competition",
};

type SkillLevelBadgeProps = {
  skillLevel: ProjectSkillLevel;
  className?: string;
};

export function SkillLevelBadge({
  skillLevel,
  className,
}: SkillLevelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {LABELS[skillLevel]}
    </span>
  );
}

import {
  sumRequirementLineTotals,
  type RequirementLine,
} from "@/lib/catalog";

/** Single pricing helper for Robot Builder totals. */
export function calculateBuildTotal(lines: RequirementLine[]): number {
  return sumRequirementLineTotals(lines);
}

export function getUnavailableLines(lines: RequirementLine[]): RequirementLine[] {
  return lines.filter((line) => line.availableQuantity < line.quantity);
}

export function getAvailableLines(lines: RequirementLine[]): RequirementLine[] {
  return lines.filter((line) => line.availableQuantity >= line.quantity);
}

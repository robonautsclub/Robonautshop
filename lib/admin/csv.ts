/**
 * The one CSV writer for admin exports (task 149).
 *
 * - Cells that start with = + - @ (or a tab / carriage return) are prefixed
 *   with an apostrophe so spreadsheets never run them as formulas
 *   (CSV/formula injection). Real numbers are written as-is.
 * - Cells containing commas, quotes or line breaks are quoted.
 * - A UTF-8 byte-order mark is added so Excel reads Bangla / accented text.
 */

export type CsvCell = string | number | boolean | null | undefined;

const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function escapeCsvCell(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";

  const text = FORMULA_PREFIX.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(headers: readonly string[], rows: readonly CsvCell[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}

/** Safe download filename like `orders-2026-10-12.csv`. */
export function csvFilename(base: string, now: Date = new Date()): string {
  return `${base.replace(/[^a-z0-9-]/gi, "")}-${now.toISOString().slice(0, 10)}.csv`;
}

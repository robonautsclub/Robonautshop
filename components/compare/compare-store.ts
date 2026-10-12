"use client";

import { useSyncExternalStore } from "react";

import { COMPARE_KEY, parseCompareSlugs, toggleCompareSlug } from "@/lib/compare/rows";

/**
 * Tiny localStorage-backed store (slugs only) shared by every compare toggle
 * and the /compare page. Storage can be blocked, so reads and writes are
 * wrapped and fall back to an in-memory list.
 */
const CHANGE_EVENT = "robonautsshop:compare-change";
const EMPTY: string[] = [];

let cache: { raw: string | null; slugs: string[] } = { raw: null, slugs: EMPTY };
let memoryRaw: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(COMPARE_KEY);
  } catch (error) {
    console.error("[compare] storage unavailable:", error);
    return memoryRaw;
  }
}

function getSnapshot(): string[] {
  const raw = readRaw();
  if (raw !== cache.raw) {
    cache = { raw, slugs: raw ? parseCompareSlugs(raw) : EMPTY };
  }
  return cache.slugs;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function write(slugs: string[]) {
  const raw = JSON.stringify(slugs);
  memoryRaw = raw;
  try {
    window.localStorage.setItem(COMPARE_KEY, raw);
  } catch (error) {
    console.error("[compare] could not save selection:", error);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useCompareSlugs(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/** Toggles a product; returns false when the list is already full. */
export function toggleCompare(slug: string): boolean {
  const result = toggleCompareSlug(getSnapshot(), slug);
  if (result.full) return false;
  write(result.slugs);
  return true;
}

export function clearCompare() {
  write([]);
}

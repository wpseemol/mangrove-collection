"use client";

import { useState } from "react";

const STORAGE_KEY = "mc-recent-searches";
const LIMIT = 6;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string").slice(0, LIMIT) : [];
  } catch {
    return [];
  }
}

function write(items: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode or full storage: recent searches just aren't kept.
  }
}

/** Search terms kept in this browser, newest first. */
export function useRecentSearches() {
  const [items, setItems] = useState<string[]>(read);

  const update = (next: string[]) => {
    setItems(next);
    write(next);
  };

  return {
    items,
    remember: (term: string) => {
      const value = term.trim();
      if (value.length < 2) return;
      update([value, ...items.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, LIMIT));
    },
    remove: (term: string) => update(items.filter((item) => item !== term)),
    clear: () => update([]),
  };
}

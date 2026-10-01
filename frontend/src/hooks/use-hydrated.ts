"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during prerender and the first client render, true afterwards.
 * Guards UI that depends on localStorage (cart, auth) against hydration mismatches.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

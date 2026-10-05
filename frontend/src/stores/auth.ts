import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/lib/types";

/**
 * `unknown` until `/auth/session` has answered. The real session is the HttpOnly
 * cookie set by the API; `user` is only a cached profile so the header can
 * render instantly, and it is reconciled with the server on every page load.
 */
export type AuthStatus = "unknown" | "authenticated" | "guest";

type AuthState = {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: "unknown",
      setUser: (user) => set({ user, status: "authenticated" }),
      clear: () => set({ user: null, status: "guest" }),
    }),
    {
      name: "mc-auth",
      version: 2,
      // Older versions stored a Bearer token here; drop everything but the profile.
      migrate: (persisted) => ({ user: (persisted as { user?: User | null } | undefined)?.user ?? null }),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

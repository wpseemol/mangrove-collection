import { create } from 'zustand'

import type { User } from '@/lib/types'

// Earlier builds kept a Bearer token in localStorage; remove it so it can't be read by scripts.
if (typeof window !== 'undefined') window.localStorage.removeItem('mc-dashboard-auth')

/**
 * In-memory only. The session itself is the API's HttpOnly cookie; this mirrors
 * the user returned by `/auth/session` so components can read it synchronously.
 */
type AuthState = {
  user: User | null
  setUser: (user: User) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}))

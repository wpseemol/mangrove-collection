import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { AdminSettings, Category, CategoryIcon, SessionResponse } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

export const sessionQueryKey = ['session'] as const

/**
 * Asks the API who owns the session cookie (200 for guests too) and mirrors the
 * answer in the auth store. Refetched on focus, so signing out on the storefront
 * (which shares the cookie) also signs the dashboard out.
 */
export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const session = await api<SessionResponse>('/auth/session')
      const store = useAuthStore.getState()
      if (session.user) store.setUser(session.user)
      else store.clear()
      return session
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

export const categoriesQueryKey = ['admin', 'categories'] as const

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: () => api<{ data: Category[] }>('/admin/categories').then((r) => r.data),
  })
}

export const settingsQueryKey = ['admin', 'settings'] as const

export function useAdminSettings() {
  return useQuery({
    queryKey: settingsQueryKey,
    queryFn: () => api<{ data: AdminSettings }>('/admin/settings').then((r) => r.data),
  })
}

export function useCategoryIcons() {
  return useQuery({
    queryKey: ['category-icons'],
    queryFn: () => api<{ data: CategoryIcon[] }>('/category-icons').then((r) => r.data),
    staleTime: Infinity,
  })
}

import { useQuery } from '@tanstack/react-query'

import { ApiError, api } from '@/lib/api'
import type {
  AdminSettings,
  Banner,
  Category,
  CategoryIcon,
  CmsPage,
  OrderList,
  PaymentAccount,
  PaymentQueue,
  SessionResponse,
} from '@/lib/types'
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

export const paymentAccountsQueryKey = ['admin', 'payment-accounts'] as const

export function usePaymentAccounts() {
  return useQuery({
    queryKey: paymentAccountsQueryKey,
    queryFn: () => api<{ data: PaymentAccount[] }>('/admin/payment-accounts').then((r) => r.data),
  })
}

export const paymentsQueryKey = ['admin', 'payments'] as const

/** Number of submitted transaction IDs waiting for review, polled for the sidebar badge. */
export function useAwaitingPaymentsCount(enabled = true) {
  return useQuery({
    queryKey: [...paymentsQueryKey, 'awaiting-count'],
    queryFn: () => api<PaymentQueue>('/admin/payments', { query: { status: 'submitted', per_page: 1 } }).then((r) => r.counts.submitted),
    refetchInterval: 60_000,
    enabled,
  })
}

export const ordersQueryKey = ['admin', 'orders'] as const

/** New orders that nobody has started on yet, polled for the sidebar badge. */
export function usePendingOrdersCount(enabled = true) {
  return useQuery({
    queryKey: [...ordersQueryKey, 'pending-count'],
    queryFn: () => api<OrderList>('/admin/orders', { query: { status: 'pending', per_page: 1 } }).then((r) => r.counts.pending),
    refetchInterval: 60_000,
    enabled,
  })
}

export const reviewsQueryKey = ['admin', 'reviews'] as const

export const subscribersQueryKey = ['admin', 'newsletter-subscribers'] as const

export const bannersQueryKey = ['admin', 'banners'] as const

export function useBanners() {
  return useQuery({
    queryKey: bannersQueryKey,
    queryFn: () => api<{ data: Banner[] }>('/admin/banners').then((r) => r.data),
  })
}

export const homePageQueryKey = ['admin', 'pages', 'home'] as const
export const aboutPageQueryKey = ['admin', 'pages', 'about'] as const

/** A CMS page by slug, or null when it hasn't been created yet. */
function useCmsPage(queryKey: readonly ['admin', 'pages', string]) {
  return useQuery({
    queryKey,
    queryFn: () =>
      api<{ data: CmsPage }>(`/admin/pages/${queryKey[2]}`)
        .then((r) => r.data)
        .catch((error) => {
          if (error instanceof ApiError && error.status === 404) return null
          throw error
        }),
  })
}

export const useHomePage = () => useCmsPage(homePageQueryKey)
export const useAboutPage = () => useCmsPage(aboutPageQueryKey)

export function useCategoryIcons() {
  return useQuery({
    queryKey: ['category-icons'],
    queryFn: () => api<{ data: CategoryIcon[] }>('/category-icons').then((r) => r.data),
    staleTime: Infinity,
  })
}

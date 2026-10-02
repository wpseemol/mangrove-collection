import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Category } from '@/lib/types'

export const categoriesQueryKey = ['admin', 'categories'] as const

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: () => api<{ data: Category[] }>('/admin/categories').then((r) => r.data),
  })
}

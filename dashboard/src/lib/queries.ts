import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Category, CategoryIcon } from '@/lib/types'

export const categoriesQueryKey = ['admin', 'categories'] as const

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: () => api<{ data: Category[] }>('/admin/categories').then((r) => r.data),
  })
}

export function useCategoryIcons() {
  return useQuery({
    queryKey: ['category-icons'],
    queryFn: () => api<{ data: CategoryIcon[] }>('/category-icons').then((r) => r.data),
    staleTime: Infinity,
  })
}

import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'

import { api } from '@/lib/api'
import { isStaff, type User } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

/** Re-validates the stored token with `/auth/me` and keeps customers out of the dashboard. */
export function ProtectedRoute() {
  const location = useLocation()
  const { token, setUser, clear } = useAuthStore()

  const { data: user, isPending, isError } = useQuery({
    queryKey: ['me', token],
    queryFn: () => api<{ data: User }>('/auth/me').then((r) => r.data),
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (!user) return
    if (isStaff(user)) setUser(user)
    else clear()
  }, [user, setUser, clear])

  if (!token || isError) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (isPending || !isStaff(user)) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return <Outlet />
}

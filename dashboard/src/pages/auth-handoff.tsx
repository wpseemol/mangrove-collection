import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { toast } from 'sonner'

import { api } from '@/lib/api'
import { isStaff, type User } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

/**
 * Landing page for staff who signed in on the storefront: it receives
 * `#token=...` (a fragment, so it never reaches any server log), verifies it
 * and stores it as the dashboard session.
 */
export function AuthHandoffPage() {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token'))

  useEffect(() => {
    window.history.replaceState(null, '', window.location.pathname)
  }, [])

  const { data: user, isError } = useQuery({
    queryKey: ['handoff', token],
    queryFn: async () => {
      const { data } = await api<{ data: User }>('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      if (isStaff(data)) useAuthStore.getState().setAuth(token!, data)
      return data
    },
    enabled: Boolean(token),
    retry: false,
    gcTime: 0,
  })

  const denied = !token || isError || (user !== undefined && !isStaff(user))

  useEffect(() => {
    if (denied) toast.error('Your session could not be verified. Please sign in.')
  }, [denied])

  if (denied) return <Navigate to="/login" replace />
  if (user) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" />
      Opening dashboard…
    </div>
  )
}

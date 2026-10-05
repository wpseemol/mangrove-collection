import { Loader2, RefreshCw, ServerCrash } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router'

import { Button } from '@/components/ui/button'
import { useSession } from '@/lib/queries'
import { isStaff } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

/** Checks the session cookie with `/auth/session` and keeps customers out of the dashboard. */
export function ProtectedRoute() {
  const location = useLocation()
  const { isPending, isError, refetch, isRefetching } = useSession()
  const user = useAuthStore((state) => state.user)

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError && !user) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
        <ServerCrash className="size-8 text-muted-foreground" />
        <p className="font-medium">Can't reach the Mangrove Collection API.</p>
        <p className="max-w-sm text-sm text-muted-foreground">Check your connection, or that the API server is running, then try again.</p>
        <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={isRefetching ? 'animate-spin' : undefined} /> Try again
        </Button>
      </div>
    )
  }

  // Signed out, session expired, or a customer account: the login page explains which.
  if (!isStaff(user)) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}

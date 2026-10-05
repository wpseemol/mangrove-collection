import { ShieldAlert } from 'lucide-react'
import { Link, Outlet } from 'react-router'

import { Button } from '@/components/ui/button'
import { isAdmin } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

/**
 * Admin-only pages. The API enforces the same rule (`role:admin`), so this only
 * spares managers a page full of 403 errors.
 */
export function RequireAdmin() {
  const user = useAuthStore((state) => state.user)

  if (!isAdmin(user)) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <ShieldAlert className="size-5" />
        </span>
        <div>
          <p className="font-medium">Admins only</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Your account ({user?.role}) can manage the catalog, but only an admin can change site settings.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  return <Outlet />
}

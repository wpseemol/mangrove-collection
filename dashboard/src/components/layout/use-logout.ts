import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { api } from '@/lib/api'
import { sessionQueryKey } from '@/lib/queries'
import { useAuthStore } from '@/stores/auth'

/** Ends the shared session, so this also signs the user out of the storefront. */
export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined)
    useAuthStore.getState().clear()
    queryClient.clear()
    queryClient.setQueryData(sessionQueryKey, { authenticated: false, user: null })
    navigate('/login', { replace: true })
  }
}

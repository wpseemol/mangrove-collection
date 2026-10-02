import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined)
    useAuthStore.getState().clear()
    queryClient.clear()
    navigate('/login', { replace: true })
  }
}

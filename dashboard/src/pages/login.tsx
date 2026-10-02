import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'

import { AuthLayout } from '@/components/auth/auth-layout'
import { PasswordInput } from '@/components/auth/password-input'
import { FormField } from '@/components/form-field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api'
import { sessionQueryKey, useSession } from '@/lib/queries'
import { isStaff, type AuthResponse } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { isPending: checkingSession } = useSession()
  const { user, setUser } = useAuthStore()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const mutation = useMutation({
    mutationFn: () => api<AuthResponse>('/auth/dashboard/login', { method: 'POST', body: { login, password } }),
    onSuccess: (response) => {
      setUser(response.user)
      queryClient.setQueryData(sessionQueryKey, { authenticated: true, user: response.user })
      navigate(from, { replace: true })
    },
  })

  // Staff already signed in (here or on the storefront, which shares the session cookie).
  if (isStaff(user)) return <Navigate to={from} replace />

  if (checkingSession) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  const error = mutation.error instanceof ApiError ? mutation.error : null
  const loginError = error?.field('login')
  const generalError = mutation.isError && !loginError && !error?.field('password') ? mutation.error.message : null

  return (
    <AuthLayout title="Sign in to dashboard" subtitle="Use your staff email or phone number to continue.">
      {user && !generalError && (
        <Alert className="mb-4">
          <AlertDescription>
            You're signed in as {user.email}, which isn't a staff account. Sign in with an admin or manager account to continue.
          </AlertDescription>
        </Alert>
      )}
      {generalError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
      >
        <FormField id="login" label="Email or phone" error={loginError}>
          <Input
            id="login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoComplete="username"
            placeholder="admin@mangrove-collection.com"
            className="h-10"
            autoFocus
            required
            aria-invalid={Boolean(loginError) || undefined}
          />
        </FormField>
        <FormField
          id="password"
          label="Password"
          error={error?.field('password')}
          hint={
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </FormField>
        <Button type="submit" size="lg" className="h-10 w-full shadow-md shadow-primary/30" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Only staff accounts (admin or manager) can access the dashboard.
      </p>
    </AuthLayout>
  )
}

import { useMutation } from '@tanstack/react-query'
import { CircleCheck, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { AuthLayout } from '@/components/auth/auth-layout'
import { PasswordInput } from '@/components/auth/password-input'
import { FormField } from '@/components/form-field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      api<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: { token, email, password, password_confirmation: confirmation },
      }),
  })

  const error = mutation.error instanceof ApiError ? mutation.error : null

  return (
    <AuthLayout title="Choose a new password" subtitle="Your new password must be at least 8 characters.">
      {!token ? (
        <Alert variant="destructive">
          <AlertDescription>
            This reset link is invalid.{' '}
            <Link to="/forgot-password" className="underline">
              Request a new one
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : mutation.isSuccess ? (
        <div className="text-center">
          <CircleCheck className="mx-auto mb-3 size-12 text-brand" />
          <p className="text-sm text-gray-700">Your password has been reset. You can now sign in.</p>
          <Button asChild className="mt-5">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
        >
          <FormField id="email" label="Email" error={error?.field('email')}>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-10" required />
          </FormField>
          <FormField id="password" label="New password" error={error?.field('password')}>
            <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
          </FormField>
          <FormField id="password_confirmation" label="Confirm new password">
            <PasswordInput id="password_confirmation" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" required />
          </FormField>
          <Button type="submit" size="lg" className="h-10 w-full shadow-md shadow-primary/30" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Reset password
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}

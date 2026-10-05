import { useMutation } from '@tanstack/react-query'
import { Loader2, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { AuthLayout } from '@/components/auth/auth-layout'
import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, ApiError } from '@/lib/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  const mutation = useMutation({
    mutationFn: () => api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { email } }),
  })

  const error = mutation.error instanceof ApiError ? mutation.error : null

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your staff email and we'll send you a reset link.">
      {mutation.isSuccess ? (
        <div className="text-center">
          <MailCheck className="mx-auto mb-3 size-12 text-brand" />
          <p className="text-sm text-foreground/80">{mutation.data.message}</p>
          <Button asChild variant="link" className="mt-4">
            <Link to="/login">Back to sign in</Link>
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
          <FormField id="email" label="Email" error={error?.field('email') ?? error?.message}>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-10" required />
          </FormField>
          <Button type="submit" size="lg" className="h-10 w-full shadow-md shadow-primary/30" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Send reset link
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}

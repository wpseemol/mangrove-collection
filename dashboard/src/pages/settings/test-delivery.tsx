import { useMutation } from '@tanstack/react-query'
import { Loader2, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError, api, errorMessage } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const CHANNELS = {
  mail: {
    title: 'Send a test email',
    description: 'Uses the saved settings, so save your changes first.',
    label: 'Send to',
    field: 'to',
    type: 'email',
    placeholder: 'you@example.com',
    endpoint: '/admin/settings/test-mail',
    pattern: /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/,
    invalid: 'Enter a valid email address.',
  },
  sms: {
    title: 'Send a test SMS',
    description: 'Uses the saved settings, so save your changes first.',
    label: 'Phone number',
    field: 'phone',
    type: 'tel',
    placeholder: '01712-345678',
    endpoint: '/admin/settings/test-sms',
    pattern: /^\+?[0-9][0-9\s\-()]{5,19}$/,
    invalid: 'Enter a valid phone number.',
  },
} as const

export function TestDelivery({ channel }: { channel: keyof typeof CHANNELS }) {
  const config = CHANNELS[channel]
  const user = useAuthStore((state) => state.user)
  const [to, setTo] = useState(() => (channel === 'mail' ? (user?.email ?? '') : (user?.phone ?? '')))
  const [error, setError] = useState<string>()

  const send = useMutation({
    mutationFn: () => api<{ message: string }>(config.endpoint, { method: 'POST', body: { [config.field]: to.trim() } }),
    onSuccess: (r) => toast.success(r.message),
    onError: (e) => {
      if (e instanceof ApiError && e.field(config.field)) setError(e.field(config.field))
      else toast.error(errorMessage(e))
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = to.trim()
    const message = config.pattern.test(value) ? undefined : config.invalid
    setError(message)
    if (!message) send.mutate()
  }

  const id = `test-${channel}`

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} noValidate className="space-y-3">
          <FormField id={id} label={config.label} error={error}>
            <Input
              id={id}
              type={config.type}
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                setError(undefined)
              }}
              placeholder={config.placeholder}
              maxLength={255}
              aria-invalid={Boolean(error)}
            />
          </FormField>
          <Button type="submit" variant="outline" className="w-full" disabled={send.isPending}>
            {send.isPending ? <Loader2 className="animate-spin" /> : <Send />} Send test
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

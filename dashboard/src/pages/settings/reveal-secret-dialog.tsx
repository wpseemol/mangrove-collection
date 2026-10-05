import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ApiError, api, errorMessage } from '@/lib/api'

export function RevealSecretDialog({
  settingKey,
  label,
  open,
  onOpenChange,
  onRevealed,
}: {
  settingKey: string
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRevealed: (value: string | null) => void
}) {
  const id = `reveal-${settingKey}`
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>()

  const reveal = useMutation({
    mutationFn: () =>
      api<{ data: { key: string; value: string | null } }>('/admin/settings/reveal', { method: 'POST', body: { key: settingKey, password } }),
    onSuccess: ({ data }) => {
      onRevealed(data.value)
      close(false)
    },
    onError: (e) => setError(e instanceof ApiError && e.errors.password ? e.errors.password[0] : errorMessage(e)),
  })

  const close = (next: boolean) => {
    if (!next) {
      setPassword('')
      setShowPassword(false)
      setError(undefined)
    }
    onOpenChange(next)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    // The dialog is portalled out of the settings form, but React still bubbles submit to it.
    event.stopPropagation()
    if (!password) {
      setError('Enter your password.')
      return
    }
    reveal.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LockKeyhole className="size-5" />
            </span>
            <DialogTitle>Show {label.toLowerCase()}</DialogTitle>
            <DialogDescription>For your security, confirm your account password to view this saved secret. It hides again after a minute.</DialogDescription>
          </DialogHeader>

          <FormField id={id} label="Your password" error={error}>
            <div className="relative">
              <Input
                id={id}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(undefined)
                }}
                autoComplete="current-password"
                autoFocus
                aria-invalid={Boolean(error)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={reveal.isPending}>
              {reveal.isPending ? <Loader2 className="animate-spin" /> : <Eye />} Show secret
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

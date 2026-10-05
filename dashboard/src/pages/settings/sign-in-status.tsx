import { CircleAlert, KeyRound, Mail } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { Draft } from './draft'

type State = { label: string; tone: 'on' | 'warn' | 'off' }

function Row({ icon, name, state }: { icon: ReactNode; name: string; state: State }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1 text-sm font-medium">{name}</span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-xs font-medium',
          state.tone === 'on' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          state.tone === 'warn' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          state.tone === 'off' && 'bg-muted text-muted-foreground',
        )}
      >
        {state.label}
      </span>
    </li>
  )
}

/** What the storefront sign-in page will offer with the values currently in the form. */
export function SignInStatus({ draft }: { draft: Draft }) {
  const password: State = draft.password_login_enabled ? { label: 'Active', tone: 'on' } : { label: 'Inactive', tone: 'off' }
  const googleReady = Boolean(draft.google_login_enabled) && String(draft.google_client_id ?? '').trim() !== ''
  const google: State = !draft.google_login_enabled
    ? { label: 'Inactive', tone: 'off' }
    : googleReady
      ? { label: 'Active', tone: 'on' }
      : { label: 'Needs client ID', tone: 'warn' }
  const none = password.tone !== 'on' && google.tone !== 'on'

  return (
    <Card className="h-fit xl:sticky xl:top-20">
      <CardHeader>
        <CardTitle>Customer sign-in</CardTitle>
        <CardDescription>What the storefront login and register pages show.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          <Row icon={<Mail className="size-4" />} name="Email & password" state={password} />
          <Row icon={<KeyRound className="size-4" />} name="Google" state={google} />
        </ul>
        {none && (
          <p className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            No sign-in method is active, so customers can't sign in or register. They can still order as guests.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

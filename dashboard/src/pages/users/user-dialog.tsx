import { useMutation } from '@tanstack/react-query'
import { Copy, Info, Loader2, Wand2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { PasswordInput } from '@/components/auth/password-input'
import { FormField, Optional } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ApiError, api, errorMessage } from '@/lib/api'
import type { AdminUser, UserInput, UserRole } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ROLES, ROLE_ORDER, generatePassword } from '@/pages/users/roles'

type Errors = Partial<Record<keyof UserInput, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function UserDialog({
  open,
  onOpenChange,
  user,
  defaultRole,
  isSelf,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** `null` adds a new user. */
  user: AdminUser | null
  defaultRole: UserRole
  isSelf: boolean
  onSaved: (user: AdminUser) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        {open && <UserForm key={user?.id ?? 'new'} user={user} defaultRole={defaultRole} isSelf={isSelf} onSaved={onSaved} onCancel={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function UserForm({
  user,
  defaultRole,
  isSelf,
  onSaved,
  onCancel,
}: {
  user: AdminUser | null
  defaultRole: UserRole
  isSelf: boolean
  onSaved: (user: AdminUser) => void
  onCancel: () => void
}) {
  const editing = user !== null
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [role, setRole] = useState<UserRole>(user?.role ?? defaultRole)
  const [active, setActive] = useState(user?.is_active ?? true)
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  const save = useMutation({
    mutationFn: (body: UserInput) =>
      api<{ data: AdminUser }>(editing ? `/admin/users/${user.id}` : '/admin/users', { method: editing ? 'PATCH' : 'POST', body }).then((r) => r.data),
    onSuccess: (saved) => {
      toast.success(editing ? `${saved.name} has been updated.` : `${saved.name} has been added as ${ROLES[saved.role].label.toLowerCase()}.`)
      onSaved(saved)
    },
    onError: (e) => {
      if (e instanceof ApiError && Object.keys(e.errors).length) {
        setErrors(Object.fromEntries(Object.entries(e.errors).map(([key, messages]) => [key, messages[0]])))
      }
      toast.error(errorMessage(e))
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const body: UserInput = { name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() || null }
    if (!isSelf) {
      body.role = role
      if (editing) body.is_active = active
    }
    if (password) body.password = password

    const next: Errors = {}
    if (!body.name) next.name = 'Enter a name.'
    if (!EMAIL_PATTERN.test(body.email)) next.email = 'Enter a valid email address.'
    if (!editing && !password) next.password = 'Set a password so they can sign in.'
    else if (password && password.length < 8) next.password = 'Use at least 8 characters.'
    else if (password.length > 128) next.password = 'Use 128 characters or fewer.'
    setErrors(next)
    if (Object.keys(next).length) return

    save.mutate(body)
  }

  const fillPassword = () => {
    const value = generatePassword()
    setPassword(value)
    setErrors((e) => ({ ...e, password: undefined }))
    navigator.clipboard?.writeText(value).then(
      () => toast.success('Password generated and copied. Share it with them securely.'),
      () => toast.success('Password generated. Copy it before saving.'),
    )
  }

  const copyPassword = () => navigator.clipboard?.writeText(password).then(() => toast.success('Password copied.'))

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <DialogHeader>
        <DialogTitle>{editing ? `Edit ${user.name}` : 'Add a user'}</DialogTitle>
        <DialogDescription>
          {editing
            ? 'Update their details, access level or password.'
            : 'Create an account for a new admin, employee or customer. They can sign in right away with the email and password you set.'}
        </DialogDescription>
      </DialogHeader>

      {isSelf ? (
        <p className="flex gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          This is your own account. Another admin has to change your role or status, so you can't lock yourself out.
        </p>
      ) : (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Access level</legend>
          <div role="radiogroup" className="grid gap-2 sm:grid-cols-3">
            {ROLE_ORDER.map((value) => {
              const info = ROLES[value]
              const selected = role === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setRole(value)}
                  className={cn(
                    'flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50',
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <info.icon className={cn('size-4', selected ? 'text-primary' : 'text-muted-foreground')} />
                    {info.label}
                  </span>
                  <span className="text-xs leading-snug text-muted-foreground">{info.access}</span>
                </button>
              )
            })}
          </div>
          {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
          {editing && role !== user.role && (
            <p className="text-xs text-amber-700 dark:text-amber-300">Changing the access level signs them out of every device.</p>
          )}
        </fieldset>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="user-name" label="Full name" error={errors.name} className="sm:col-span-2">
          <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={255} autoComplete="off" aria-invalid={!!errors.name} />
        </FormField>
        <FormField id="user-email" label="Email" error={errors.email}>
          <Input
            id="user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            autoComplete="off"
            aria-invalid={!!errors.email}
          />
        </FormField>
        <FormField id="user-phone" label="Phone" hint={<Optional />} error={errors.phone}>
          <Input
            id="user-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={32}
            placeholder="01XXXXXXXXX"
            autoComplete="off"
            aria-invalid={!!errors.phone}
          />
        </FormField>
      </div>

      {!isSelf && (
        <FormField
          id="user-password"
          label={editing ? 'New password' : 'Password'}
          error={errors.password}
          hint={
            <div className="flex items-center gap-1">
              {password && (
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={copyPassword}>
                  <Copy className="size-3.5" /> Copy
                </Button>
              )}
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={fillPassword}>
                <Wand2 className="size-3.5" /> Generate
              </Button>
            </div>
          }
          description={
            editing
              ? user.has_password
                ? 'Leave empty to keep their current password. Setting one signs them out everywhere.'
                : 'They sign in with Google. Set a password to also allow email sign-in.'
              : 'At least 8 characters. Share it with them privately; they can change it later.'
          }
        >
          <PasswordInput
            id="user-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={128}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
          />
        </FormField>
      )}

      {editing && !isSelf && (
        <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
          <div>
            <Label htmlFor="user-active" className="text-sm">
              Account active
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {active ? 'They can sign in and place orders.' : 'They are signed out and cannot sign in until you turn this back on.'}
            </p>
          </div>
          <Switch id="user-active" checked={active} onCheckedChange={setActive} />
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" />}
          {editing ? 'Save changes' : `Add ${ROLES[role].label.toLowerCase()}`}
        </Button>
      </DialogFooter>
    </form>
  )
}

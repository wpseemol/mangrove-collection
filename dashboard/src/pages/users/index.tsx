import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  ShoppingBag,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, errorMessage } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { usersQueryKey } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import type { AdminUser, UserList, UserRole } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ROLES, ROLE_ORDER, initials } from '@/pages/users/roles'
import { UserDialog } from '@/pages/users/user-dialog'
import { useAuthStore } from '@/stores/auth'

type Tab = 'all' | UserRole
type Status = 'all' | 'active' | 'inactive'

const TABS: Tab[] = ['all', ...ROLE_ORDER]
const STATUSES: Status[] = ['all', 'active', 'inactive']

export function UsersPage() {
  const queryClient = useQueryClient()
  const me = useAuthStore((state) => state.user)
  const [params, setParams] = useSearchParams()

  const tab = (TABS.find((t) => t === params.get('role')) ?? 'all') as Tab
  const status = (STATUSES.find((s) => s === params.get('status')) ?? 'all') as Status
  const page = Math.max(1, Number(params.get('page')) || 1)
  const q = params.get('q') ?? ''
  const [search, setSearch] = useState(q)
  const [editing, setEditing] = useState<AdminUser | 'new' | null>(null)
  const [deleting, setDeleting] = useState<AdminUser[] | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '' || value === 'all') next.delete(key)
      else next.set(key, value)
    }
    if (!('page' in changes)) next.delete('page')
    setParams(next, { replace: true })
    setSelected(new Set())
  }

  useEffect(() => {
    if (search === q) return
    const timer = setTimeout(() => updateParams({ q: search.trim() }), 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const { data, isPending, isFetching } = useQuery({
    queryKey: [...usersQueryKey, { tab, status, q, page }],
    placeholderData: keepPreviousData,
    queryFn: () =>
      api<UserList>('/admin/users', {
        query: { page, per_page: 20, q, role: tab === 'all' ? undefined : tab, status: status === 'all' ? undefined : status },
      }),
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: usersQueryKey })

  const setActive = useMutation({
    mutationFn: ({ users, active }: { users: AdminUser[]; active: boolean }) =>
      Promise.allSettled(users.map((user) => api(`/admin/users/${user.id}`, { method: 'PATCH', body: { is_active: active } }))),
    onSuccess: (results, { users, active }) => {
      const failed = results.filter((r) => r.status === 'rejected')
      const done = users.length - failed.length
      if (done) {
        const who = users.length === 1 ? users[0].name : `${done} users`
        toast.success(active ? `${who} can sign in again.` : `${who} ${done === 1 ? 'has' : 'have'} been deactivated and signed out.`)
      }
      if (failed.length) toast.error(errorMessage((failed[0] as PromiseRejectedResult).reason))
      setSelected(new Set())
      refresh()
    },
  })

  const remove = useMutation({
    mutationFn: (users: AdminUser[]) => Promise.allSettled(users.map((user) => api<void>(`/admin/users/${user.id}`, { method: 'DELETE' }))),
    onSuccess: (results, users) => {
      const failed = results.filter((r) => r.status === 'rejected')
      const done = users.length - failed.length
      if (done) toast.success(users.length === 1 ? `${users[0].name} has been deleted.` : `${done} users deleted.`)
      if (failed.length) toast.error(errorMessage((failed[0] as PromiseRejectedResult).reason))
      setDeleting(null)
      setSelected(new Set())
      refresh()
    },
  })

  const users = data?.data ?? []
  const meta = data?.meta
  const counts = data?.counts
  const total = counts ? ROLE_ORDER.reduce((sum, role) => sum + counts[role], 0) : 0
  const selectable = users.filter((user) => user.id !== me?.id)
  const picked = selectable.filter((user) => selected.has(user.id))
  const allPicked = selectable.length > 0 && picked.length === selectable.length

  const toggle = (id: number, on: boolean) =>
    setSelected((current) => {
      const next = new Set(current)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const deletingOrders = deleting?.reduce((sum, user) => sum + (user.orders_count ?? 0), 0) ?? 0
  const deletingStaff = deleting?.some((user) => user.role !== 'customer') ?? false

  return (
    <>
      <PageHeader
        title="Users"
        description="Everyone who can sign in: your team in the dashboard and customers on the store."
        actions={
          <Button onClick={() => setEditing('new')}>
            <UserPlus /> Add user
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ROLE_ORDER.map((role) => {
          const info = ROLES[role]
          return (
            <button
              key={role}
              type="button"
              onClick={() => updateParams({ role: tab === role ? null : role })}
              className={cn(
                'flex items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-xs transition-colors hover:bg-muted/40',
                tab === role && 'border-primary ring-1 ring-primary',
              )}
            >
              <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset', info.tone)}>
                <info.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl font-semibold tabular-nums">{counts ? counts[role] : '–'}</span>
                <span className="block truncate text-xs text-muted-foreground">{info.plural}</span>
              </span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => updateParams({ status: status === 'inactive' ? null : 'inactive' })}
          className={cn(
            'flex items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-xs transition-colors hover:bg-muted/40',
            status === 'inactive' && 'border-primary ring-1 ring-primary',
          )}
        >
          <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset', TONES.red)}>
            <UserX className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-2xl font-semibold tabular-nums">{counts ? counts.inactive : '–'}</span>
            <span className="block truncate text-xs text-muted-foreground">Deactivated</span>
          </span>
        </button>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
          <Tabs value={tab} onValueChange={(value) => updateParams({ role: value })} className="max-w-full overflow-x-auto">
            <TabsList>
              {TABS.map((t) => {
                const count = t === 'all' ? total : counts?.[t]
                return (
                  <TabsTrigger key={t} value={t} className="gap-1.5">
                    {t === 'all' ? 'All' : ROLES[t].plural}
                    {count ? <span className="rounded-full bg-muted-foreground/15 px-1.5 text-[11px] leading-4 tabular-nums">{count}</span> : null}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={status} onValueChange={(value) => updateParams({ status: value })}>
              <SelectTrigger className="sm:w-40" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Deactivated</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or phone" className="pl-8" aria-label="Search users" />
            </div>
          </div>
        </div>

        {picked.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b bg-primary/5 px-4 py-2.5 text-sm">
            <span className="font-medium">{picked.length} selected</span>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              <X /> Clear
            </Button>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={setActive.isPending} onClick={() => setActive.mutate({ users: picked, active: true })}>
                <UserCheck /> Activate
              </Button>
              <Button variant="outline" size="sm" disabled={setActive.isPending} onClick={() => setActive.mutate({ users: picked, active: false })}>
                {setActive.isPending ? <Loader2 className="animate-spin" /> : <UserX />} Deactivate
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleting(picked)}>
                <Trash2 /> Delete
              </Button>
            </div>
          </div>
        )}

        <div className="hidden grid-cols-[1.25rem_minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_2.25rem] items-center gap-4 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground md:grid">
          <Checkbox
            checked={allPicked ? true : picked.length ? 'indeterminate' : false}
            onCheckedChange={(on) => setSelected(on === true ? new Set(selectable.map((user) => user.id)) : new Set())}
            disabled={!selectable.length}
            aria-label="Select all on this page"
          />
          <span>User</span>
          <span>Access</span>
          <span>Orders</span>
          <span>Last sign-in</span>
          <span className="sr-only">Actions</span>
        </div>

        <ul className={cn('divide-y', isFetching && !isPending && 'opacity-60 transition-opacity')}>
          {isPending ? (
            Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="p-4">
                <Skeleton className="h-10 w-full" />
              </li>
            ))
          ) : users.length ? (
            users.map((user) => {
              const self = user.id === me?.id
              const info = ROLES[user.role]
              return (
                <li
                  key={user.id}
                  className={cn(
                    'grid grid-cols-[1.25rem_minmax(0,1fr)_2.25rem] items-center gap-x-4 gap-y-2 px-4 py-3 md:grid-cols-[1.25rem_minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_2.25rem]',
                    !user.is_active && 'bg-muted/30',
                    selected.has(user.id) && 'bg-primary/5',
                  )}
                >
                  <Checkbox
                    checked={selected.has(user.id)}
                    onCheckedChange={(on) => toggle(user.id, on === true)}
                    disabled={self}
                    aria-label={self ? 'You cannot select your own account' : `Select ${user.name}`}
                  />

                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className={cn('size-9', !user.is_active && 'opacity-50 grayscale')}>
                      <AvatarImage src={user.avatar ?? undefined} alt="" />
                      <AvatarFallback className="bg-secondary text-xs font-medium text-primary">{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                        <span className="truncate">{user.name}</span>
                        {self && (
                          <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', TONES.green)}>
                            You
                          </Badge>
                        )}
                        {!user.is_active && (
                          <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', TONES.red)}>
                            Deactivated
                          </Badge>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                        {user.phone && ` · ${user.phone}`}
                      </p>
                    </div>
                  </div>

                  <div className="col-start-3 row-start-1 md:col-start-auto md:row-start-auto md:hidden">
                    <RowActions user={user} self={self} onEdit={() => setEditing(user)} onToggle={() => setActive.mutate({ users: [user], active: !user.is_active })} onDelete={() => setDeleting([user])} />
                  </div>

                  <div className="col-span-2 col-start-2 flex flex-wrap items-center gap-1.5 md:col-span-1 md:col-start-auto">
                    <Badge variant="outline" className={cn('gap-1 border-0 ring-1 ring-inset', info.tone)}>
                      <info.icon className="size-3" />
                      {info.label}
                    </Badge>
                    {user.google_linked && <span className="text-xs text-muted-foreground">Google</span>}
                  </div>

                  <p className="hidden items-center gap-1.5 text-sm tabular-nums md:flex">
                    <ShoppingBag className="size-3.5 text-muted-foreground" />
                    {user.orders_count ?? 0}
                  </p>

                  <p className="hidden text-xs text-muted-foreground md:block">
                    {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                    <span className="block">Joined {formatDate(user.created_at)}</span>
                  </p>

                  <div className="hidden md:block">
                    <RowActions user={user} self={self} onEdit={() => setEditing(user)} onToggle={() => setActive.mutate({ users: [user], active: !user.is_active })} onDelete={() => setDeleting([user])} />
                  </div>
                </li>
              )
            })
          ) : (
            <li className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <Users className="size-5" />
              </span>
              <div>
                <p className="font-medium">No users found</p>
                <p className="mt-1 text-sm text-muted-foreground">{q || tab !== 'all' || status !== 'all' ? 'Try another tab, filter or search.' : 'Add your first team member.'}</p>
              </div>
            </li>
          )}
        </ul>

        {meta && meta.total > meta.per_page && (
          <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
            <p>
              Showing <span className="font-medium text-foreground">{meta.from}</span>–<span className="font-medium text-foreground">{meta.to}</span> of{' '}
              <span className="font-medium text-foreground">{meta.total}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>
                <ChevronLeft /> Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => updateParams({ page: String(page + 1) })}>
                Next <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <UserDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        user={editing === 'new' ? null : editing}
        defaultRole={tab === 'all' ? 'manager' : tab}
        isSelf={editing !== null && editing !== 'new' && editing.id === me?.id}
        onSaved={() => {
          setEditing(null)
          refresh()
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting?.length === 1 ? `Delete ${deleting[0].name}?` : `Delete ${deleting?.length ?? 0} users?`}
        description={
          <>
            {deleting?.length === 1 ? 'Their account' : 'These accounts'} and saved addresses will be removed permanently and they will be signed out.
            {deletingOrders > 0 && ` Their ${deletingOrders} order${deletingOrders === 1 ? '' : 's'} stay in the store, just no longer linked to an account.`}
            {deletingStaff && ' Staff lose dashboard access right away.'} To keep their history and block sign-in instead, deactivate them.
          </>
        }
        confirmLabel={deleting?.length === 1 ? 'Delete user' : 'Delete users'}
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </>
  )
}

function RowActions({ user, self, onEdit, onToggle, onDelete }: { user: AdminUser; self: boolean; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${user.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onToggle} disabled={self}>
          {user.is_active ? <UserX /> : <UserCheck />} {user.is_active ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete} disabled={self}>
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Download, Loader2, Mail, MailCheck, MailX, Search, Settings2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/page-header'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, errorMessage } from '@/lib/api'
import { API_URL } from '@/lib/config'
import { formatDate } from '@/lib/format'
import { subscribersQueryKey } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import type { NewsletterSubscriber, SubscriberList, SubscriberStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'subscribed', label: 'Subscribed' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
] as const

type Tab = (typeof TABS)[number]['value']

export function SubscribersPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()

  const tab = (TABS.some((t) => t.value === params.get('status')) ? params.get('status') : 'all') as Tab
  const page = Math.max(1, Number(params.get('page')) || 1)
  const q = params.get('q') ?? ''
  const [search, setSearch] = useState(q)
  const [deleting, setDeleting] = useState<NewsletterSubscriber | null>(null)
  const [exporting, setExporting] = useState(false)

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '' || value === 'all') next.delete(key)
      else next.set(key, value)
    }
    if (!('page' in changes)) next.delete('page')
    setParams(next, { replace: true })
  }

  useEffect(() => {
    if (search === q) return
    const timer = setTimeout(() => updateParams({ q: search.trim() }), 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const status = tab === 'all' ? undefined : tab

  const { data, isPending, isFetching } = useQuery({
    queryKey: [...subscribersQueryKey, { tab, q, page }],
    placeholderData: keepPreviousData,
    queryFn: () => api<SubscriberList>('/admin/newsletter-subscribers', { query: { page, per_page: 25, q, status } }),
  })

  const setStatus = useMutation({
    mutationFn: ({ subscriber, status }: { subscriber: NewsletterSubscriber; status: SubscriberStatus }) =>
      api<{ data: NewsletterSubscriber }>(`/admin/newsletter-subscribers/${subscriber.id}`, { method: 'PATCH', body: { status } }).then((r) => r.data),
    onSuccess: (subscriber) => {
      toast.success(subscriber.status === 'subscribed' ? `${subscriber.email} is subscribed again.` : `${subscriber.email} has been unsubscribed.`)
      queryClient.invalidateQueries({ queryKey: subscribersQueryKey })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const remove = useMutation({
    mutationFn: (subscriber: NewsletterSubscriber) => api<void>(`/admin/newsletter-subscribers/${subscriber.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Subscriber deleted.')
      setDeleting(null)
      queryClient.invalidateQueries({ queryKey: subscribersQueryKey })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const exportCsv = async () => {
    setExporting(true)
    try {
      const url = new URL(`${API_URL}/admin/newsletter-subscribers/export`)
      if (q) url.searchParams.set('q', q)
      if (status) url.searchParams.set('status', status)

      const response = await fetch(url, { credentials: 'include', headers: { Accept: 'text/csv', 'X-Requested-With': 'XMLHttpRequest' } })
      if (!response.ok) throw new Error(response.status === 403 ? "You don't have access to export subscribers." : 'Export failed. Please try again.')

      const name = /filename="?([^";]+)"?/.exec(response.headers.get('Content-Disposition') ?? '')?.[1] ?? 'newsletter-subscribers.csv'
      const link = document.createElement('a')
      link.href = URL.createObjectURL(await response.blob())
      link.download = name
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setExporting(false)
    }
  }

  const subscribers = data?.data ?? []
  const meta = data?.meta
  const counts = data?.counts
  const total = counts ? counts.subscribed + counts.unsubscribed : 0

  return (
    <>
      <PageHeader
        title="Subscribers"
        description="People who signed up for the newsletter on the store. Export the list to use it with your email tool."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/home-page?tab=newsletter">
                <Settings2 /> Sign-up card
              </Link>
            </Button>
            <Button onClick={exportCsv} disabled={exporting || total === 0}>
              {exporting ? <Loader2 className="animate-spin" /> : <Download />} Export CSV
            </Button>
          </div>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={(value) => updateParams({ status: value })}>
            <TabsList>
              {TABS.map((t) => {
                const count = t.value === 'all' ? total : counts?.[t.value]
                return (
                  <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                    {t.label}
                    {count ? <span className="rounded-full bg-muted-foreground/15 px-1.5 text-[11px] leading-4 tabular-nums">{count}</span> : null}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>

          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email" className="pl-8" aria-label="Search subscribers" />
          </div>
        </div>

        <ul className={cn('divide-y', isFetching && !isPending && 'opacity-60 transition-opacity')}>
          {isPending ? (
            Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="p-4">
                <Skeleton className="h-10 w-full" />
              </li>
            ))
          ) : subscribers.length ? (
            subscribers.map((subscriber) => {
              const busy = setStatus.isPending && setStatus.variables?.subscriber.id === subscriber.id
              const active = subscriber.status === 'subscribed'
              return (
                <li key={subscriber.id} className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center', !active && 'bg-muted/30')}>
                  <span className={cn('hidden size-10 shrink-0 items-center justify-center rounded-full sm:flex', active ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground')}>
                    {active ? <MailCheck className="size-4" /> : <MailX className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={`mailto:${subscriber.email}`} className="truncate text-sm font-medium hover:text-primary">
                        {subscriber.email}
                      </a>
                      {!active && (
                        <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', TONES.neutral)}>
                          Unsubscribed
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {subscriber.subscribed_at && `Joined ${formatDate(subscriber.subscribed_at)}`}
                      {subscriber.source && ` · from ${subscriber.source}`}
                      {!active && subscriber.unsubscribed_at && ` · unsubscribed ${formatDate(subscriber.unsubscribed_at)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => setStatus.mutate({ subscriber, status: active ? 'unsubscribed' : 'subscribed' })}
                    >
                      {busy ? <Loader2 className="animate-spin" /> : active ? <MailX /> : <MailCheck />}
                      {active ? 'Unsubscribe' : 'Resubscribe'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleting(subscriber)}
                      aria-label={`Delete ${subscriber.email}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              )
            })
          ) : (
            <li className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <Mail className="size-5" />
              </span>
              <div>
                <p className="font-medium">No subscribers found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {q || tab !== 'all' ? 'Try another tab or search.' : 'Sign-ups from the newsletter card above the store footer will appear here.'}
                </p>
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

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && !remove.isPending && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this subscriber?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.email} will be removed from the list permanently. They can still sign up again later. To keep a record that they opted out, unsubscribe them
              instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Keep</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={(e) => {
                e.preventDefault()
                if (deleting) remove.mutate(deleting)
              }}
            >
              {remove.isPending && <Loader2 className="animate-spin" />}
              Delete subscriber
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

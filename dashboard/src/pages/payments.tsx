import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Check, ChevronLeft, ChevronRight, CircleCheck, Copy, ReceiptText, Search, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/page-header'
import { RejectPaymentDialog, VerifyPaymentDialog } from '@/components/payments/review-dialogs'
import { WalletMark } from '@/components/payments/wallet-mark'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { formatWalletNumber, WALLET_METHODS, WALLETS } from '@/lib/payments'
import { isAdmin, type Payment, type PaymentQueue } from '@/lib/types'
import { paymentsQueryKey } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

const TABS = [
  { value: 'submitted', label: 'To verify' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
] as const

type Tab = (typeof TABS)[number]['value']

const STATUS_TONE: Record<Payment['status'], string> = {
  submitted: TONES.sky,
  verified: TONES.green,
  rejected: TONES.red,
}

function timeAgo(value: string): string {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function CopyText({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          toast.error('Copy failed')
        }
      }}
      className="group inline-flex items-center gap-1.5 font-mono text-sm font-medium tracking-wide hover:text-primary"
      title="Copy transaction ID"
    >
      {value}
      {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5 opacity-0 transition-opacity group-hover:opacity-60" />}
    </button>
  )
}

export function PaymentsPage() {
  const [params, setParams] = useSearchParams()
  const admin = isAdmin(useAuthStore((state) => state.user))

  const tab = (TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'submitted') as Tab
  const method = params.get('method') ?? 'all'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const q = params.get('q') ?? ''

  const [search, setSearch] = useState(q)
  const [verifying, setVerifying] = useState<Payment | null>(null)
  const [rejecting, setRejecting] = useState<Payment | null>(null)

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '' || (key !== 'tab' && value === 'all')) next.delete(key)
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

  const { data, isPending, isFetching } = useQuery({
    queryKey: [...paymentsQueryKey, { tab, method, q, page }],
    placeholderData: keepPreviousData,
    refetchInterval: tab === 'submitted' ? 30_000 : false,
    queryFn: () =>
      api<PaymentQueue>('/admin/payments', {
        query: { page, per_page: 20, q, status: tab === 'all' ? undefined : tab, method: method === 'all' ? undefined : method },
      }),
  })

  const payments = data?.data ?? []
  const meta = data?.meta
  const counts = data?.counts

  return (
    <>
      <PageHeader
        title="Payments"
        description="Check each bKash, Nagad or Rocket transaction ID against your wallet statement, then verify or reject it."
        actions={
          admin && (
            <Button variant="outline" asChild>
              <Link to="/payment-accounts">Payment accounts</Link>
            </Button>
          )
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={(value) => updateParams({ tab: value })}>
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                  {t.label}
                  {t.value !== 'all' && counts && counts[t.value] > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 text-[11px] leading-4 tabular-nums',
                        t.value === 'submitted' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/15',
                      )}
                    >
                      {counts[t.value]}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="TrxID, order, phone or name"
                className="pl-8"
                aria-label="Search payments"
              />
            </div>
            <Select value={method} onValueChange={(value) => updateParams({ method: value })}>
              <SelectTrigger className="sm:w-40" aria-label="Filter by wallet">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All wallets</SelectItem>
                {WALLET_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {WALLETS[m].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table className={isFetching && !isPending ? 'opacity-60 transition-opacity' : undefined}>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Order</TableHead>
              <TableHead>Sent to</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="pr-4 text-right">{tab === 'submitted' ? 'Review' : 'Status'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="px-4">
                    <Skeleton className="h-9 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : payments.length ? (
              payments.map((payment) => {
                const order = payment.order
                const mismatch = order && Math.abs(order.total - payment.amount) > 0.009

                return (
                  <TableRow key={payment.id}>
                    <TableCell className="pl-4">
                      <p className="font-mono text-sm font-medium">{order?.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {order?.customer_name} · {order?.customer_phone}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <WalletMark method={payment.method} />
                        <div>
                          <p className="font-mono text-sm">{formatWalletNumber(payment.account_number)}</p>
                          <p className="text-xs text-muted-foreground">{payment.action ?? WALLETS[payment.method].name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CopyText value={payment.transaction_id} />
                      <p className="text-xs text-muted-foreground">
                        from {payment.sender_number ?? '—'} · {timeAgo(payment.created_at)}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium tabular-nums">{formatPrice(payment.amount, payment.currency)}</p>
                      {mismatch && <p className="text-xs text-amber-600">Order now {formatPrice(order?.total, payment.currency)}</p>}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      {payment.status === 'submitted' ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setRejecting(payment)}>
                            <XCircle /> Reject
                          </Button>
                          <Button size="sm" onClick={() => setVerifying(payment)}>
                            <CircleCheck /> Verify
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-0.5">
                          <Badge variant="outline" className={cn('border-0 capitalize ring-1 ring-inset', STATUS_TONE[payment.status])}>
                            {payment.status}
                          </Badge>
                          {payment.reviewer && (
                            <p className="text-xs text-muted-foreground">
                              by {payment.reviewer.name}
                              {payment.reviewed_at ? ` · ${timeAgo(payment.reviewed_at)}` : ''}
                            </p>
                          )}
                          {payment.rejection_reason && (
                            <p className="max-w-56 truncate text-xs text-muted-foreground" title={payment.rejection_reason}>
                              {payment.rejection_reason}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                      <ReceiptText className="size-5" />
                    </span>
                    <div>
                      <p className="font-medium">{tab === 'submitted' && !q ? 'All caught up' : 'No payments found'}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tab === 'submitted' && !q
                          ? 'New bKash, Nagad and Rocket payments appear here for you to verify.'
                          : 'Try another tab, wallet or search.'}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {meta && meta.total > meta.per_page && (
          <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
            <p>
              Showing <span className="font-medium text-foreground">{meta.from}</span>–<span className="font-medium text-foreground">{meta.to}</span>{' '}
              of <span className="font-medium text-foreground">{meta.total}</span>
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

      <VerifyPaymentDialog payment={verifying} onOpenChange={(open) => !open && setVerifying(null)} />
      <RejectPaymentDialog payment={rejecting} onOpenChange={(open) => !open && setRejecting(null)} />
    </>
  )
}

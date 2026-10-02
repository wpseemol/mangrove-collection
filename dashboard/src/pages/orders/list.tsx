import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Loader2, Search, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, errorMessage } from '@/lib/api'
import { formatDate, formatPrice } from '@/lib/format'
import {
  NEXT_STEP,
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  PAYMENT_STATUSES,
  statusToast,
  useUpdateOrder,
} from '@/lib/orders'
import { ordersQueryKey } from '@/lib/queries'
import type { Order, OrderList, OrderStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

type Tab = OrderStatus | 'all'

const TABS: { value: Tab; label: string }[] = [{ value: 'all', label: 'All' }, ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] }))]

export function OrdersPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const tab = (TABS.some((t) => t.value === params.get('status')) ? params.get('status') : 'all') as Tab
  const payment = params.get('payment') ?? 'all'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const q = params.get('q') ?? ''
  const [search, setSearch] = useState(q)

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

  const { data, isPending, isFetching } = useQuery({
    queryKey: [...ordersQueryKey, 'list', { tab, payment, q, page }],
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    queryFn: () =>
      api<OrderList>('/admin/orders', {
        query: { page, per_page: 20, q, status: tab === 'all' ? undefined : tab, payment_status: payment === 'all' ? undefined : payment },
      }),
  })

  const update = useUpdateOrder()
  const advance = (order: Order) => {
    const next = NEXT_STEP[order.status]
    if (!next) return
    update.mutate(
      { id: order.id, status: next.status },
      { onSuccess: (updated) => toast.success(statusToast(updated)), onError: (e) => toast.error(errorMessage(e)) },
    )
  }

  const orders = data?.data ?? []
  const meta = data?.meta
  const counts = data?.counts
  const total = counts ? Object.values(counts).reduce((sum, n) => sum + n, 0) : 0

  return (
    <>
      <PageHeader title="Orders" description="Move each order along as you pack, ship and deliver it. Customers can review products once an order is delivered." />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
          <Tabs value={tab} onValueChange={(value) => updateParams({ status: value })} className="max-w-full overflow-x-auto overflow-y-hidden">
            <TabsList>
              {TABS.map((t) => {
                const count = t.value === 'all' ? total : counts?.[t.value]
                return (
                  <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                    {t.label}
                    {count ? (
                      <span
                        className={cn(
                          'rounded-full px-1.5 text-[11px] leading-4 tabular-nums',
                          t.value === 'pending' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/15',
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order no., name, phone or email" className="pl-8" aria-label="Search orders" />
            </div>
            <Select value={payment} onValueChange={(value) => updateParams({ payment: value })}>
              <SelectTrigger className="sm:w-40" aria-label="Filter by payment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any payment</SelectItem>
                {PAYMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {PAYMENT_STATUS_LABEL[s]}
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
              <TableHead>Customer</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="pr-4 text-right">Next step</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 6 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="px-4">
                    <Skeleton className="h-9 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length ? (
              orders.map((order) => {
                const next = NEXT_STEP[order.status]
                const busy = update.isPending && update.variables?.id === order.id
                return (
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                    <TableCell className="pl-4">
                      <Link to={`/orders/${order.id}`} className="font-mono text-sm font-medium hover:text-primary" onClick={(e) => e.stopPropagation()}>
                        {order.order_number}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)} · {order.items_count ?? 0} item{order.items_count === 1 ? '' : 's'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', PAYMENT_STATUS_TONE[order.payment_status])}>
                        {PAYMENT_STATUS_LABEL[order.payment_status]}
                      </Badge>
                      <p className="mt-0.5 text-xs text-muted-foreground">{PAYMENT_METHOD_LABEL[order.payment_method]}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatPrice(order.total, order.currency)}</TableCell>
                    <TableCell className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {next ? (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => advance(order)}>
                          {busy && <Loader2 className="animate-spin" />}
                          {next.label}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {order.status === 'delivered' ? `Delivered ${formatDate(order.delivered_at)}` : '—'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                      <ShoppingCart className="size-5" />
                    </span>
                    <div>
                      <p className="font-medium">{tab === 'pending' && !q ? 'No new orders' : 'No orders found'}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {q || tab !== 'all' || payment !== 'all' ? 'Try another tab, filter or search.' : 'Orders appear here as soon as customers check out.'}
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
    </>
  )
}

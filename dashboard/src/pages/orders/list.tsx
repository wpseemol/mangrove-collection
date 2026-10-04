import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/status-badge'
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
  openPrint,
  statusToast,
  useBulkOrderStatus,
  useDeleteOrders,
  useUpdateOrder,
} from '@/lib/orders'
import { ordersQueryKey } from '@/lib/queries'
import type { Order, OrderList, OrderStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

type Tab = OrderStatus | 'all'

const TABS: { value: Tab; label: string }[] = [{ value: 'all', label: 'All' }, ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] }))]
const PAGE_SIZES = ['20', '50', '100']
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const today = () => new Date().toISOString().slice(0, 10)

export function OrdersPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const tab = (TABS.some((t) => t.value === params.get('status')) ? params.get('status') : 'all') as Tab
  const payment = params.get('payment') ?? 'all'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const perPage = PAGE_SIZES.includes(params.get('per_page') ?? '') ? Number(params.get('per_page')) : 20
  const from = DATE_PATTERN.test(params.get('from') ?? '') ? params.get('from')! : ''
  const to = DATE_PATTERN.test(params.get('to') ?? '') ? params.get('to')! : ''
  const q = params.get('q') ?? ''
  const [search, setSearch] = useState(q)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<number[] | null>(null)

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
    queryKey: [...ordersQueryKey, 'list', { tab, payment, q, page, perPage, from, to }],
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    queryFn: () =>
      api<OrderList>('/admin/orders', {
        query: {
          page,
          per_page: perPage,
          q,
          status: tab === 'all' ? undefined : tab,
          payment_status: payment === 'all' ? undefined : payment,
          from: from || undefined,
          to: to || undefined,
        },
      }),
  })

  const update = useUpdateOrder()
  const bulkStatus = useBulkOrderStatus()
  const remove = useDeleteOrders()

  const advance = (order: Order) => {
    const next = NEXT_STEP[order.status]
    if (!next) return
    update.mutate({ id: order.id, status: next.status }, { onSuccess: (updated) => toast.success(statusToast(updated)), onError: (e) => toast.error(errorMessage(e)) })
  }

  const orders = useMemo(() => data?.data ?? [], [data])
  const meta = data?.meta
  const counts = data?.counts
  const total = counts ? Object.values(counts).reduce((sum, n) => sum + n, 0) : 0
  const selectedIds = orders.filter((order) => selected.has(order.id)).map((order) => order.id)
  const allSelected = orders.length > 0 && selectedIds.length === orders.length
  const selectedTotal = orders.filter((order) => selected.has(order.id)).reduce((sum, order) => sum + order.total, 0)
  const filtered = Boolean(q || tab !== 'all' || payment !== 'all' || from || to)

  const toggle = (id: number, on: boolean) =>
    setSelected((current) => {
      const next = new Set(current)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const markAll = (status: OrderStatus) =>
    bulkStatus.mutate(
      { ids: selectedIds, status },
      {
        onSuccess: ({ updated, skipped }) => {
          toast.success(`${updated} order${updated === 1 ? '' : 's'} marked ${ORDER_STATUS_LABEL[status].toLowerCase()}${skipped ? ` (${skipped} skipped)` : ''}.`)
          setSelected(new Set())
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    )

  const deleteOrders = (ids: number[]) =>
    remove.mutate(ids, {
      onSuccess: ({ deleted }) => {
        toast.success(`${deleted} order${deleted === 1 ? '' : 's'} deleted. Stock was returned.`)
        setSelected(new Set())
        setConfirmDelete(null)
      },
      onError: (e) => toast.error(errorMessage(e)),
    })

  return (
    <>
      <PageHeader
        title="Orders"
        description="Move each order along as you pack, ship and deliver it. Select orders to print invoices or a delivery sheet."
        actions={
          <Button asChild>
            <Link to="/orders/new">
              <Plus /> New order
            </Link>
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4">
          <Tabs value={tab} onValueChange={(value) => updateParams({ status: value })} className="max-w-full overflow-x-auto overflow-y-hidden">
            <TabsList>
              {TABS.map((t) => {
                const count = t.value === 'all' ? total : counts?.[t.value]
                return (
                  <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                    {t.label}
                    {count ? (
                      <span
                        className={cn('rounded-full px-1.5 text-[11px] leading-4 tabular-nums', t.value === 'pending' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/15')}
                      >
                        {count}
                      </span>
                    ) : null}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative lg:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order no., name, phone or email" className="pl-8" aria-label="Search orders" />
            </div>
            <Select value={payment} onValueChange={(value) => updateParams({ payment: value })}>
              <SelectTrigger className="lg:w-40" aria-label="Filter by payment">
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
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
              <Input type="date" value={from} max={to || today()} onChange={(e) => updateParams({ from: e.target.value })} className="w-38" aria-label="From date" />
              <span className="text-sm text-muted-foreground">to</span>
              <Input type="date" value={to} min={from || undefined} max={today()} onChange={(e) => updateParams({ to: e.target.value })} className="w-38" aria-label="To date" />
            </div>
            <div className="flex items-center gap-2 lg:ml-auto">
              <Button variant="outline" size="sm" onClick={() => updateParams({ from: today(), to: today() })}>
                Today
              </Button>
              {(from || to) && (
                <Button variant="ghost" size="sm" onClick={() => updateParams({ from: null, to: null })}>
                  <X /> Clear dates
                </Button>
              )}
            </div>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b bg-primary/5 px-4 py-2.5">
            <p className="mr-2 text-sm">
              <span className="font-semibold">{selectedIds.length}</span> selected · <span className="tabular-nums">{formatPrice(selectedTotal)}</span>
            </p>
            <Button size="sm" variant="outline" onClick={() => openPrint(selectedIds, 'invoice')}>
              <FileText /> Print invoices
            </Button>
            <Button size="sm" variant="outline" onClick={() => openPrint(selectedIds, 'delivery')}>
              <Truck /> Delivery sheet
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={bulkStatus.isPending}>
                  {bulkStatus.isPending && <Loader2 className="animate-spin" />}
                  Change status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Mark selected as</DropdownMenuLabel>
                {ORDER_STATUSES.filter((s) => s !== 'pending').map((s) => (
                  <DropdownMenuItem key={s} onClick={() => markAll(s)} variant={s === 'cancelled' ? 'destructive' : 'default'}>
                    {ORDER_STATUS_LABEL[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(selectedIds)}>
              <Trash2 /> Delete
            </Button>
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelected(new Set())}>
              Clear selection
            </Button>
          </div>
        )}

        <Table className={isFetching && !isPending ? 'opacity-60 transition-opacity' : undefined}>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allSelected ? true : selectedIds.length ? 'indeterminate' : false}
                  onCheckedChange={(on) => setSelected(on ? new Set(orders.map((o) => o.id)) : new Set())}
                  aria-label="Select all orders on this page"
                  disabled={!orders.length}
                />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Next step</TableHead>
              <TableHead className="w-10 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 6 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8} className="px-4">
                    <Skeleton className="h-9 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length ? (
              orders.map((order) => {
                const next = NEXT_STEP[order.status]
                const busy = update.isPending && update.variables?.id === order.id
                const checked = selected.has(order.id)
                return (
                  <TableRow key={order.id} data-state={checked ? 'selected' : undefined} className="cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={checked} onCheckedChange={(on) => toggle(order.id, on === true)} aria-label={`Select order ${order.order_number}`} />
                    </TableCell>
                    <TableCell>
                      <Link to={`/orders/${order.id}`} className="font-mono text-sm font-medium hover:text-primary" onClick={(e) => e.stopPropagation()}>
                        {order.order_number}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)} · {order.items_count ?? 0} item{order.items_count === 1 ? '' : 's'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{order.customer.name}</p>
                      <a href={`tel:${order.customer.phone}`} onClick={(e) => e.stopPropagation()} className="text-xs text-muted-foreground hover:text-primary">
                        {order.customer.phone}
                      </a>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', PAYMENT_STATUS_TONE[order.payment_status])}>
                        {PAYMENT_STATUS_LABEL[order.payment_status]}
                      </Badge>
                      <p className="mt-0.5 text-xs text-muted-foreground">{PAYMENT_METHOD_LABEL[order.payment_method]}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatPrice(order.total, order.currency)}</TableCell>
                    <TableCell className="hidden text-right lg:table-cell" onClick={(e) => e.stopPropagation()}>
                      {next ? (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => advance(order)}>
                          {busy && <Loader2 className="animate-spin" />}
                          {next.label}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">{order.status === 'delivered' ? `Delivered ${formatDate(order.delivered_at)}` : '—'}</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-4" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="size-8" aria-label={`Actions for ${order.order_number}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                            <Eye /> View details
                          </DropdownMenuItem>
                          {next && (
                            <DropdownMenuItem onClick={() => advance(order)} className="lg:hidden">
                              <ChevronRight /> {next.label}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openPrint([order.id], 'invoice')}>
                            <FileText /> Print invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPrint([order.id], 'delivery')}>
                            <Truck /> Print delivery slip
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete([order.id])}>
                            <Trash2 /> Delete order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8}>
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                      <ShoppingCart className="size-5" />
                    </span>
                    <div>
                      <p className="font-medium">{tab === 'pending' && !q ? 'No new orders' : 'No orders found'}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{filtered ? 'Try another tab, filter or search.' : 'Orders appear here as soon as customers check out.'}</p>
                    </div>
                    {!filtered && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/orders/new">
                          <Plus /> Add an order manually
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {meta && meta.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <p>
                Showing <span className="font-medium text-foreground">{meta.from}</span>–<span className="font-medium text-foreground">{meta.to}</span> of{' '}
                <span className="font-medium text-foreground">{meta.total}</span>
              </p>
              <Select value={String(perPage)} onValueChange={(value) => updateParams({ per_page: value === '20' ? null : value })}>
                <SelectTrigger size="sm" className="w-28" aria-label="Orders per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {meta.last_page > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>
                  <ChevronLeft /> Previous
                </Button>
                <span className="tabular-nums">
                  {page} / {meta.last_page}
                </span>
                <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => updateParams({ page: String(page + 1) })}>
                  Next <ChevronRight />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <AlertDialog open={confirmDelete !== null} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {confirmDelete?.length === 1 ? 'this order' : `${confirmDelete?.length} orders`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Use this for spam, test or duplicate orders. Items go back into stock, the customer is not notified, and the order is removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={(e) => {
                e.preventDefault()
                if (confirmDelete) deleteOrders(confirmDelete)
              }}
            >
              {remove.isPending && <Loader2 className="animate-spin" />}
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, ExternalLink, Loader2, Mail, PackageX, Phone, StickyNote, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/page-header'
import { WalletMark } from '@/components/payments/wallet-mark'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { api, ApiError, errorMessage } from '@/lib/api'
import { STOREFRONT_URL } from '@/lib/config'
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
import { formatWalletNumber } from '@/lib/payments'
import { ordersQueryKey } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import type { Order, OrderStatus, PaymentStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { isUnsafeText, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'

const STEPS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']
const NOTE_MAX = 5000

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function OrderDetailPage() {
  const id = Number(useParams().id)
  const { data: order, isPending, error } = useQuery({
    queryKey: [...ordersQueryKey, 'detail', id],
    queryFn: () => api<{ data: Order }>(`/admin/orders/${id}`).then((r) => r.data),
    enabled: Number.isInteger(id) && id > 0,
    retry: (count, e) => !(e instanceof ApiError && e.status === 404) && count < 2,
  })

  if (!Number.isInteger(id) || id <= 0 || (error instanceof ApiError && error.status === 404)) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <PackageX className="size-10 text-muted-foreground" />
        <p className="font-medium">Order not found</p>
        <Button variant="outline" asChild>
          <Link to="/orders">Back to orders</Link>
        </Button>
      </div>
    )
  }

  if (isPending || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div>
        <Button variant="link" asChild className="mb-1 h-auto px-0 text-muted-foreground">
          <Link to="/orders">
            <ArrowLeft /> All orders
          </Link>
        </Button>
        <PageHeader
          title={`Order ${order.order_number}`}
          description={`Placed ${formatDateTime(order.created_at)}`}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />
              <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', PAYMENT_STATUS_TONE[order.payment_status])}>
                {PAYMENT_STATUS_LABEL[order.payment_status]}
              </Badge>
            </div>
          }
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ItemsCard order={order} />
          {order.payments && order.payments.length > 0 && <PaymentsCard order={order} />}
        </div>
        <div className="space-y-4">
          <StatusCard key={`${order.id}-${order.status}-${order.payment_status}`} order={order} />
          <CustomerCard order={order} />
          <NoteCard key={`${order.id}-note`} order={order} />
        </div>
      </div>
    </>
  )
}

function ItemsCard({ order }: { order: Order }) {
  const address = order.shipping_address

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>Items</CardTitle>
      </CardHeader>
      <ul className="divide-y">
        {order.items?.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-6 py-3">
            <span className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
              {item.image && <img src={item.image} alt="" className="size-full object-cover" />}
            </span>
            <div className="min-w-0 flex-1">
              <a
                href={`${STOREFRONT_URL}/product?slug=${encodeURIComponent(item.product_slug)}`}
                target="_blank"
                rel="noreferrer"
                className="line-clamp-1 text-sm font-medium hover:text-primary"
              >
                {item.product_name}
              </a>
              <p className="text-xs text-muted-foreground">
                {item.variant_title ? `${item.variant_title} · ` : ''}
                {formatPrice(item.unit_price, order.currency)} × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-medium tabular-nums">{formatPrice(item.line_total, order.currency)}</p>
          </li>
        ))}
      </ul>
      <div className="space-y-1.5 border-t bg-muted/30 px-6 py-4 text-sm">
        <Row label="Subtotal" value={formatPrice(order.subtotal, order.currency)} />
        <Row
          label={`Shipping${order.shipping_method ? ` (${order.shipping_method})` : ''}`}
          value={order.shipping_cost > 0 ? formatPrice(order.shipping_cost, order.currency) : 'Free'}
        />
        {order.discount > 0 && <Row label="Discount" value={`− ${formatPrice(order.discount, order.currency)}`} />}
        <Separator className="my-2" />
        <Row label="Total" value={formatPrice(order.total, order.currency)} strong />
        <p className="pt-1 text-xs text-muted-foreground">{PAYMENT_METHOD_LABEL[order.payment_method]}</p>
      </div>
      <div className="grid gap-4 border-t px-6 py-4 text-sm sm:grid-cols-2">
        <div>
          <p className="mb-1 font-medium">Deliver to</p>
          <p>{address.name}</p>
          <p className="text-muted-foreground">{address.phone}</p>
          <p className="mt-1 text-muted-foreground">
            {[address.full_address, address.landmark, address.zone, address.city, address.region].filter(Boolean).join(', ')}
          </p>
        </div>
        {order.customer_note && (
          <div>
            <p className="mb-1 font-medium">Customer note</p>
            <p className="whitespace-pre-line text-muted-foreground">{order.customer_note}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn('flex justify-between gap-4', strong ? 'text-base font-semibold' : 'text-muted-foreground')}>
      <span>{label}</span>
      <span className={cn('tabular-nums', !strong && 'text-foreground')}>{value}</span>
    </div>
  )
}

const REVIEW_TONE = { submitted: TONES.sky, verified: TONES.green, rejected: TONES.red }

function PaymentsCard({ order }: { order: Order }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle>Payment history</CardTitle>
        <CardDescription>Transaction IDs the customer submitted for this order.</CardDescription>
      </CardHeader>
      <ul className="divide-y">
        {order.payments?.map((payment) => (
          <li key={payment.id} className="flex flex-wrap items-center gap-3 px-6 py-3 text-sm">
            <WalletMark method={payment.method} />
            <div className="min-w-0 flex-1">
              <p className="font-mono font-medium tracking-wide">{payment.transaction_id}</p>
              <p className="text-xs text-muted-foreground">
                {formatPrice(payment.amount, payment.currency)} to {formatWalletNumber(payment.account_number)} from {payment.sender_number ?? '—'} ·{' '}
                {formatDateTime(payment.created_at)}
              </p>
              {payment.rejection_reason && <p className="text-xs text-destructive">{payment.rejection_reason}</p>}
            </div>
            <div className="text-right">
              <Badge variant="outline" className={cn('border-0 capitalize ring-1 ring-inset', REVIEW_TONE[payment.status])}>
                {payment.status}
              </Badge>
              {payment.reviewer && <p className="mt-0.5 text-xs text-muted-foreground">by {payment.reviewer.name}</p>}
            </div>
          </li>
        ))}
      </ul>
      {order.payments?.some((p) => p.status === 'submitted') && (
        <div className="border-t px-6 py-3">
          <Button size="sm" variant="outline" asChild>
            <Link to={`/payments?tab=submitted&q=${encodeURIComponent(order.order_number)}`}>Review in Payments</Link>
          </Button>
        </div>
      )}
    </Card>
  )
}

function StatusCard({ order }: { order: Order }) {
  const update = useUpdateOrder()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const next = NEXT_STEP[order.status]
  const current = STEPS.indexOf(order.status)
  const cancelled = order.status === 'cancelled'

  const save = (changes: { status?: OrderStatus; payment_status?: PaymentStatus }) =>
    update.mutate(
      { id: order.id, ...changes },
      {
        onSuccess: (updated) =>
          toast.success(changes.status ? statusToast(updated) : `Payment marked ${PAYMENT_STATUS_LABEL[updated.payment_status].toLowerCase()}.`),
        onError: (e) => toast.error(errorMessage(e)),
      },
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order status</CardTitle>
        <CardDescription>
          {cancelled ? `Cancelled ${formatDateTime(order.cancelled_at)}. Cancelled orders can't be reopened.` : 'The customer sees each change on their order page.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!cancelled && (
          <ol className="space-y-2">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full border text-xs',
                    index <= current ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground',
                  )}
                >
                  {index <= current ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className={index <= current ? 'font-medium' : 'text-muted-foreground'}>{ORDER_STATUS_LABEL[step]}</span>
                {step === 'delivered' && order.delivered_at && <span className="ml-auto text-xs text-muted-foreground">{formatDate(order.delivered_at)}</span>}
              </li>
            ))}
          </ol>
        )}

        {next && (
          <Button className="w-full" disabled={update.isPending} onClick={() => save({ status: next.status })}>
            {update.isPending && update.variables?.status === next.status && <Loader2 className="animate-spin" />}
            {next.label}
          </Button>
        )}

        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="order-status">Status</Label>
            <Select
              value={order.status}
              disabled={cancelled || update.isPending}
              onValueChange={(value) => (value === 'cancelled' ? setConfirmCancel(true) : save({ status: value as OrderStatus }))}
            >
              <SelectTrigger id="order-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ORDER_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payment-status">Payment</Label>
            <Select value={order.payment_status} disabled={update.isPending} onValueChange={(value) => save({ payment_status: value as PaymentStatus })}>
              <SelectTrigger id="payment-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {PAYMENT_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {order.payment_method !== 'cod' && (
              <p className="text-xs text-muted-foreground">Wallet payments are normally confirmed from the Payments page.</p>
            )}
          </div>
        </div>
      </CardContent>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel order {order.order_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Its items go back into stock and the customer is notified. A cancelled order can&apos;t be reopened.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep order</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => save({ status: 'cancelled' })}>
              Cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

function CustomerCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <UserRound className="size-4 text-muted-foreground" /> {order.customer.name}
        </p>
        <a href={`tel:${order.customer.phone}`} className="flex items-center gap-2 hover:text-primary">
          <Phone className="size-4 text-muted-foreground" /> {order.customer.phone}
        </a>
        {order.customer.email && (
          <a href={`mailto:${order.customer.email}`} className="flex items-center gap-2 break-all hover:text-primary">
            <Mail className="size-4 text-muted-foreground" /> {order.customer.email}
          </a>
        )}
        <p className="pt-1 text-xs text-muted-foreground">{order.user ? `Has an account (${order.user.email})` : 'Guest checkout'}</p>
        <a
          href={`${STOREFRONT_URL}/track-order`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 pt-1 text-xs text-muted-foreground hover:text-primary"
        >
          Customer tracking page <ExternalLink className="size-3" />
        </a>
      </CardContent>
    </Card>
  )
}

function NoteCard({ order }: { order: Order }) {
  const update = useUpdateOrder()
  const saved = order.admin_note ?? ''
  const [note, setNote] = useState(saved)
  const [error, setError] = useState<string>()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = note.trim()
    if (text.length > NOTE_MAX) return setError(`Use ${NOTE_MAX} characters or fewer.`)
    if (isUnsafeText(text)) return setError(UNSAFE_TEXT_MESSAGE)
    update.mutate(
      { id: order.id, admin_note: text || null },
      {
        onSuccess: (updated) => {
          setNote(updated.admin_note ?? '')
          toast.success('Note saved.')
        },
        onError: (err) => setError(err instanceof ApiError ? (err.field('admin_note') ?? err.message) : errorMessage(err)),
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="size-4" /> Staff note
        </CardTitle>
        <CardDescription>Only visible to staff.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} noValidate className="space-y-2">
          <Textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
              setError(undefined)
            }}
            rows={3}
            maxLength={NOTE_MAX}
            placeholder="e.g. Customer asked for evening delivery"
            aria-label="Staff note"
            aria-invalid={Boolean(error) || undefined}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" size="sm" variant="outline" disabled={update.isPending || note.trim() === saved.trim()}>
              {update.isPending && <Loader2 className="animate-spin" />}
              Save note
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

import { useQuery } from '@tanstack/react-query'
import { FileText, Loader2, Printer, Truck, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { api, errorMessage } from '@/lib/api'
import { formatDate, formatPrice } from '@/lib/format'
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, type PrintKind } from '@/lib/orders'
import { ordersQueryKey, usePublicSettings } from '@/lib/queries'
import type { Order } from '@/lib/types'
import { cn } from '@/lib/utils'

type Store = { name: string; logo: string | null; phone: string | null; email: string | null; address: string | null; website: string | null }

/** Nothing left to collect once paid; everything else is collected at the door. */
const amountToCollect = (order: Order) => (order.payment_status === 'paid' || order.payment_status === 'refunded' ? 0 : order.total)

const addressLine = (address: Order['shipping_address']) => [address.full_address, address.landmark, address.zone, address.city, address.region].filter(Boolean).join(', ')

export function OrderPrintPage() {
  const [params, setParams] = useSearchParams()
  const kind: PrintKind = params.get('type') === 'delivery' ? 'delivery' : 'invoice'
  const ids = (params.get('ids') ?? '')
    .split(',')
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0)

  const settings = usePublicSettings()
  const { data: orders, isPending, error } = useQuery({
    queryKey: [...ordersQueryKey, 'print', ids],
    queryFn: () => api<{ data: Order[] }>('/admin/orders/print', { query: { ids: ids.join(',') } }).then((r) => r.data),
    enabled: ids.length > 0,
  })

  const s = settings.data ?? {}
  const store: Store = {
    name: String(s.site_name || 'Mangrove Collection'),
    logo: (s.site_logo as string) || null,
    phone: (s.contact_phone as string) || null,
    email: (s.contact_email as string) || null,
    address: (s.contact_address as string) || null,
    website: ((s.storefront_url as string) || '').replace(/^https?:\/\//, '').replace(/\/+$/, '') || null,
  }

  const printed = useRef(false)
  const ready = Boolean(orders && !settings.isPending)
  useEffect(() => {
    document.title = `${kind === 'invoice' ? 'Invoices' : 'Delivery sheet'} – ${store.name}`
    if (!ready || printed.current) return
    printed.current = true
    // Give images (logo, product thumbnails) a moment to load before the print dialog opens.
    const timer = setTimeout(() => window.print(), 600)
    return () => clearTimeout(timer)
  }, [ready, kind, store.name])

  return (
    <div className="min-h-svh bg-muted/40 text-black print:bg-white">
      <style>{`@page { size: A4; margin: 12mm; } @media print { html, body { background: #fff !important; } }`}</style>

      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-background px-4 py-3 text-foreground print:hidden">
        <p className="mr-auto text-sm">
          <span className="font-semibold">{ids.length}</span> order{ids.length === 1 ? '' : 's'}
        </p>
        <div className="flex rounded-md border p-0.5">
          {(['invoice', 'delivery'] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={kind === value ? 'secondary' : 'ghost'}
              onClick={() => {
                const next = new URLSearchParams(params)
                next.set('type', value)
                setParams(next, { replace: true })
              }}
            >
              {value === 'invoice' ? <FileText /> : <Truck />}
              {value === 'invoice' ? 'Invoices' : 'Delivery sheet'}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={() => window.print()} disabled={!ready}>
          <Printer /> Print
        </Button>
        <Button size="sm" variant="ghost" onClick={() => window.close()}>
          <X /> Close
        </Button>
      </div>

      <div className="mx-auto max-w-[210mm] py-6 print:max-w-none print:py-0">
        {!ids.length ? (
          <Message>No orders selected. Select orders on the Orders page and choose a print option.</Message>
        ) : error ? (
          <Message>{errorMessage(error)}</Message>
        ) : isPending || !orders ? (
          <Message>
            <Loader2 className="mx-auto mb-2 size-5 animate-spin" /> Preparing {ids.length} order{ids.length === 1 ? '' : 's'}…
          </Message>
        ) : kind === 'invoice' ? (
          orders.map((order) => <Invoice key={order.id} order={order} store={store} />)
        ) : (
          <DeliverySheet orders={orders} store={store} />
        )}
      </div>
    </div>
  )
}

function Message({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg bg-white p-10 text-center text-sm text-neutral-600 shadow-sm">{children}</p>
}

function StoreHeader({ store, title, subtitle }: { store: Store; title: string; subtitle?: string }) {
  return (
    <header className="flex items-start justify-between gap-6 border-b-2 border-neutral-900 pb-4">
      <div className="flex items-start gap-3">
        {store.logo && <img src={store.logo} alt="" className="h-14 w-auto max-w-40 object-contain" />}
        <div className="text-xs leading-relaxed text-neutral-600">
          <p className="text-lg font-bold text-neutral-900">{store.name}</p>
          {store.address && <p className="max-w-72">{store.address}</p>}
          <p>{[store.phone, store.email, store.website].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold tracking-wide text-neutral-900 uppercase">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-neutral-600">{subtitle}</p>}
      </div>
    </header>
  )
}

function Invoice({ order, store }: { order: Order; store: Store }) {
  const due = amountToCollect(order)
  const address = order.shipping_address

  return (
    <article className="mb-6 break-after-page bg-white p-8 text-sm shadow-sm last:mb-0 print:mb-0 print:p-0 print:shadow-none">
      <StoreHeader store={store} title="Invoice" subtitle={`Printed ${formatDate(new Date().toISOString())}`} />

      <section className="grid grid-cols-3 gap-6 py-5">
        <div>
          <p className="mb-1 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">Invoice to</p>
          <p className="font-semibold">{order.customer.name}</p>
          <p>{order.customer.phone}</p>
          {order.customer.email && <p className="break-all">{order.customer.email}</p>}
        </div>
        <div>
          <p className="mb-1 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">Deliver to</p>
          <p className="font-semibold">{address.name}</p>
          <p>{address.phone}</p>
          <p className="text-neutral-700">{addressLine(address)}</p>
        </div>
        <dl className="space-y-1 text-right">
          <div>
            <dt className="inline text-neutral-500">Order no: </dt>
            <dd className="inline font-mono font-semibold">{order.order_number}</dd>
          </div>
          <div>
            <dt className="inline text-neutral-500">Date: </dt>
            <dd className="inline">{formatDate(order.created_at)}</dd>
          </div>
          <div>
            <dt className="inline text-neutral-500">Status: </dt>
            <dd className="inline">{ORDER_STATUS_LABEL[order.status]}</dd>
          </div>
          <div>
            <dt className="inline text-neutral-500">Payment: </dt>
            <dd className="inline">
              {PAYMENT_METHOD_LABEL[order.payment_method]} ({PAYMENT_STATUS_LABEL[order.payment_status]})
            </dd>
          </div>
        </dl>
      </section>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-neutral-100 text-left text-[11px] tracking-wider text-neutral-600 uppercase print:bg-neutral-100">
            <th className="w-10 px-3 py-2">#</th>
            <th className="px-3 py-2">Product</th>
            <th className="px-3 py-2 text-right">Unit price</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, index) => (
            <tr key={item.id} className="border-b border-neutral-200">
              <td className="px-3 py-2 text-neutral-500">{index + 1}</td>
              <td className="px-3 py-2">
                <p className="font-medium">{item.product_name}</p>
                {item.variant_title && <p className="text-xs text-neutral-500">{item.variant_title}</p>}
              </td>
              <td className="px-3 py-2 text-right tabular-nums">{formatPrice(item.unit_price, order.currency)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{item.quantity}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums">{formatPrice(item.line_total, order.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-4 flex justify-between gap-8">
        <div className="max-w-sm text-xs text-neutral-600">
          {order.customer_note && (
            <>
              <p className="mb-1 font-semibold text-neutral-800">Customer note</p>
              <p className="whitespace-pre-line">{order.customer_note}</p>
            </>
          )}
        </div>
        <dl className="w-64 space-y-1.5 tabular-nums">
          <TotalRow label="Subtotal" value={formatPrice(order.subtotal, order.currency)} />
          <TotalRow label={`Delivery${order.shipping_method ? ` (${order.shipping_method})` : ''}`} value={order.shipping_cost > 0 ? formatPrice(order.shipping_cost, order.currency) : 'Free'} />
          {order.discount > 0 && <TotalRow label="Discount" value={`− ${formatPrice(order.discount, order.currency)}`} />}
          <div className="flex justify-between border-t-2 border-neutral-900 pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total, order.currency)}</dd>
          </div>
          <div className={cn('flex justify-between rounded px-2 py-1.5 font-semibold', due > 0 ? 'bg-neutral-900 text-white print:bg-neutral-900' : 'bg-neutral-100')}>
            <dt>{due > 0 ? 'Amount to collect' : 'Paid'}</dt>
            <dd>{formatPrice(due > 0 ? due : order.total, order.currency)}</dd>
          </div>
        </dl>
      </section>

      <footer className="mt-10 flex items-end justify-between border-t border-dashed border-neutral-300 pt-4 text-xs text-neutral-500">
        <p>Thank you for shopping with {store.name}!</p>
        <p className="w-44 border-t border-neutral-400 pt-1 text-center">Authorised signature</p>
      </footer>
    </article>
  )
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-neutral-700">
      <dt>{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  )
}

function DeliverySheet({ orders, store }: { orders: Order[]; store: Store }) {
  const currency = orders[0]?.currency ?? 'BDT'
  const totalToCollect = orders.reduce((sum, order) => sum + amountToCollect(order), 0)
  const totalItems = orders.reduce((sum, order) => sum + (order.items?.reduce((n, item) => n + item.quantity, 0) ?? 0), 0)

  return (
    <>
      <article className="mb-6 break-after-page bg-white p-8 text-xs shadow-sm print:mb-0 print:p-0 print:shadow-none">
        <StoreHeader store={store} title="Delivery sheet" subtitle={`${formatDate(new Date().toISOString())} · ${orders.length} parcels`} />

        <div className="grid grid-cols-3 gap-6 py-4 text-sm">
          <p>
            Delivery person: <span className="inline-block w-40 border-b border-neutral-400" />
          </p>
          <p>
            Phone: <span className="inline-block w-32 border-b border-neutral-400" />
          </p>
          <p className="text-right">
            Cash to collect: <span className="text-base font-bold tabular-nums">{formatPrice(totalToCollect, currency)}</span>
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-neutral-100 text-left text-[10px] tracking-wider text-neutral-600 uppercase">
              <th className="border border-neutral-300 px-2 py-1.5">#</th>
              <th className="border border-neutral-300 px-2 py-1.5">Order</th>
              <th className="border border-neutral-300 px-2 py-1.5">Customer &amp; address</th>
              <th className="border border-neutral-300 px-2 py-1.5">Items</th>
              <th className="border border-neutral-300 px-2 py-1.5 text-right">Collect</th>
              <th className="w-24 border border-neutral-300 px-2 py-1.5">Signature</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id} className="break-inside-avoid align-top">
                <td className="border border-neutral-300 px-2 py-2 text-neutral-500">{index + 1}</td>
                <td className="border border-neutral-300 px-2 py-2">
                  <p className="font-mono font-semibold">{order.order_number}</p>
                  <p className="text-neutral-500">{PAYMENT_METHOD_LABEL[order.payment_method]}</p>
                </td>
                <td className="border border-neutral-300 px-2 py-2">
                  <p className="font-semibold">
                    {order.shipping_address.name} · {order.shipping_address.phone}
                  </p>
                  <p className="text-neutral-700">{addressLine(order.shipping_address)}</p>
                </td>
                <td className="border border-neutral-300 px-2 py-2">
                  {order.items?.map((item) => (
                    <p key={item.id}>
                      {item.quantity} × {item.product_name}
                      {item.variant_title ? ` (${item.variant_title})` : ''}
                    </p>
                  ))}
                </td>
                <td className="border border-neutral-300 px-2 py-2 text-right font-semibold whitespace-nowrap tabular-nums">
                  {amountToCollect(order) > 0 ? formatPrice(amountToCollect(order), order.currency) : 'Paid'}
                </td>
                <td className="border border-neutral-300 px-2 py-2" />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-100 font-semibold">
              <td colSpan={3} className="border border-neutral-300 px-2 py-2 text-right">
                Total ({totalItems} items)
              </td>
              <td className="border border-neutral-300 px-2 py-2" />
              <td className="border border-neutral-300 px-2 py-2 text-right whitespace-nowrap tabular-nums">{formatPrice(totalToCollect, currency)}</td>
              <td className="border border-neutral-300 px-2 py-2" />
            </tr>
          </tfoot>
        </table>

        <div className="mt-12 grid grid-cols-3 gap-10 text-center text-neutral-600">
          <p className="border-t border-neutral-400 pt-1">Handed over by</p>
          <p className="border-t border-neutral-400 pt-1">Received by (delivery person)</p>
          <p className="border-t border-neutral-400 pt-1">Cash returned &amp; checked by</p>
        </div>
      </article>

      <section className="grid grid-cols-2 gap-0 bg-white shadow-sm print:shadow-none">
        {orders.map((order) => (
          <DeliverySlip key={order.id} order={order} store={store} />
        ))}
      </section>
    </>
  )
}

/** Half-width labels to cut out and tape onto each parcel. */
function DeliverySlip({ order, store }: { order: Order; store: Store }) {
  const due = amountToCollect(order)
  return (
    <div className="break-inside-avoid border border-dashed border-neutral-400 p-4 text-xs">
      <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
        <p className="font-bold">{store.name}</p>
        <p className="font-mono font-semibold">{order.order_number}</p>
      </div>
      <div className="py-2">
        <p className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">Deliver to</p>
        <p className="text-sm font-bold">{order.shipping_address.name}</p>
        <p className="text-sm font-semibold">{order.shipping_address.phone}</p>
        <p className="text-neutral-700">{addressLine(order.shipping_address)}</p>
      </div>
      <p className="truncate text-neutral-600">{order.items?.map((item) => `${item.quantity}× ${item.product_name}`).join(', ')}</p>
      <div className="mt-2 flex items-center justify-between border-t border-neutral-300 pt-2">
        <p className="text-neutral-500">{store.phone ? `Sender: ${store.phone}` : formatDate(order.created_at)}</p>
        <p className={cn('rounded px-2 py-1 text-sm font-bold', due > 0 ? 'bg-neutral-900 text-white' : 'bg-neutral-100')}>
          {due > 0 ? `COLLECT ${formatPrice(due, order.currency)}` : 'PAID'}
        </p>
      </div>
    </div>
  )
}

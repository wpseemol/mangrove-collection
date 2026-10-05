import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  Package,
  PackagePlus,
  PenLine,
  Plus,
  ReceiptText,
  ShoppingBag,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { formatDate, formatNumber, formatPrice } from '@/lib/format'
import { ORDER_STATUS_LABEL, ORDER_STATUSES } from '@/lib/orders'
import { TONES } from '@/lib/tones'
import type { DashboardStats, OrderStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

const RANGES = [7, 30, 90] as const
type Metric = 'revenue' | 'orders'

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  orders: { label: 'Orders', color: 'var(--chart-2)' },
} satisfies ChartConfig

const STATUS_BAR: Record<OrderStatus, string> = {
  pending: 'bg-amber-400',
  processing: 'bg-sky-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-zinc-300 dark:bg-zinc-600',
}

const greeting = () => {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
}

const shortDate = (value: string) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

function AttentionTile({ to, icon: Icon, count, label, hint, tone }: { to: string; icon: LucideIcon; count: number | null; label: string; hint: string; tone: string }) {
  const idle = count === 0
  return (
    <Link
      to={to}
      className={cn(
        'group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md',
        idle && 'opacity-70 hover:opacity-100',
      )}
    >
      <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset', idle ? TONES.neutral : tone)}>
        {idle ? <CheckCircle2 className="size-5" /> : <Icon className="size-5" />}
      </span>
      <span className="min-w-0 flex-1">
        {count === null ? <Skeleton className="h-6 w-10" /> : <span className="block text-xl font-semibold tabular-nums leading-tight">{formatNumber(count)}</span>}
        <span className="block truncate text-sm font-medium">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{idle ? 'All caught up' : hint}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

export function OverviewPage() {
  const user = useAuthStore((state) => state.user)
  const [days, setDays] = useState<(typeof RANGES)[number]>(30)
  const [metric, setMetric] = useState<Metric>('revenue')

  const { data, isPending } = useQuery({
    queryKey: ['admin', 'dashboard', days],
    queryFn: () => api<{ data: DashboardStats }>('/admin/dashboard', { query: { days } }).then((r) => r.data),
  })

  const byStatus = data?.orders_by_status ?? {}
  const statusTotal = ORDER_STATUSES.reduce((sum, status) => sum + (byStatus[status] ?? 0), 0)
  const today = data?.sales_chart.at(-1)
  const average = data && data.totals.orders_period ? data.totals.revenue_period / data.totals.orders_period : 0

  const stats = [
    { label: `Revenue · ${days} days`, value: data ? formatPrice(data.totals.revenue_period) : null, hint: data ? `${formatPrice(data.totals.revenue)} all time` : '', icon: Banknote },
    { label: `Orders · ${days} days`, value: data ? formatNumber(data.totals.orders_period) : null, hint: data ? `${formatNumber(data.totals.orders)} all time` : '', icon: ShoppingBag },
    { label: 'Average order', value: data ? formatPrice(average) : null, hint: `Over the last ${days} days`, icon: ReceiptText },
    { label: 'Customers', value: data ? formatNumber(data.totals.customers) : null, hint: data ? `${formatNumber(data.totals.products)} products in the catalog` : '', icon: Users },
  ]

  const quickActions = [
    { to: '/orders/new', label: 'New order', hint: 'Phone or walk-in sale', icon: Plus },
    { to: '/products/new', label: 'Add product', hint: 'Fish, honey and more', icon: PackagePlus },
    { to: '/blog/new', label: 'Write a post', hint: 'Recipes, tips, stories', icon: PenLine },
    { to: '/orders?status=processing', label: 'Ready to ship', hint: 'Print delivery sheets', icon: Truck },
  ]

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description={
          today
            ? `Today so far: ${formatNumber(today.orders)} ${today.orders === 1 ? 'order' : 'orders'} worth ${formatPrice(today.revenue)}.`
            : "Here's how the store is doing."
        }
        actions={
          <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v) as (typeof RANGES)[number])}>
            <TabsList>
              {RANGES.map((range) => (
                <TabsTrigger key={range} value={String(range)}>
                  {range} days
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />

      <section aria-label="Needs attention" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AttentionTile to="/orders?status=pending" icon={Clock} count={data ? (byStatus.pending ?? 0) : null} label="New orders" hint="Confirm and start packing" tone={TONES.amber} />
        <AttentionTile to="/orders?status=processing" icon={Package} count={data ? (byStatus.processing ?? 0) : null} label="Being packed" hint="Hand over to delivery" tone={TONES.sky} />
        <AttentionTile to="/payments" icon={ReceiptText} count={data ? data.totals.payments_awaiting : null} label="Payments to verify" hint="Mobile payments submitted" tone={TONES.indigo} />
        <AttentionTile to="/products" icon={AlertTriangle} count={data ? data.low_stock.length : null} label="Low stock" hint="Restock soon" tone={TONES.red} />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardDescription className="font-medium">{stat.label}</CardDescription>
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                <stat.icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              {stat.value === null ? <Skeleton className="h-8 w-28" /> : <p className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint || '\u00a0'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle>{metric === 'revenue' ? 'Revenue' : 'Orders'}</CardTitle>
              <CardDescription>Per day over the last {days} days, cancelled orders excluded</CardDescription>
            </div>
            <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <Skeleton className="h-64 w-full" />
            ) : metric === 'revenue' ? (
              <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
                <AreaChart data={data?.sales_chart ?? []} margin={{ left: 4, right: 12 }}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} tickFormatter={shortDate} />
                  <YAxis tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => `৳${formatNumber(v)}`} />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        labelFormatter={(value) => formatDate(String(value))}
                        formatter={(value, _name, item) => (
                          <div className="flex w-full justify-between gap-4">
                            <span className="text-muted-foreground">Revenue</span>
                            <span className="font-medium tabular-nums">
                              {formatPrice(Number(value))} · {item.payload.orders} orders
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Area dataKey="revenue" type="monotone" fill="url(#fillRevenue)" stroke="var(--color-revenue)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            ) : (
              <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
                <BarChart data={data?.sales_chart ?? []} margin={{ left: 4, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} tickFormatter={shortDate} />
                  <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" labelFormatter={(value) => formatDate(String(value))} />} />
                  <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link key={action.to} to={action.to} className="group rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-secondary/60">
                  <action.icon className="size-4 text-primary" />
                  <span className="mt-2 block text-sm font-medium">{action.label}</span>
                  <span className="block text-xs text-muted-foreground">{action.hint}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="flex-1 gap-4">
            <CardHeader>
              <CardTitle>Order pipeline</CardTitle>
              <CardDescription>All orders by status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isPending ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <>
                  <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                    {statusTotal > 0 &&
                      ORDER_STATUSES.map((status) =>
                        byStatus[status] ? <span key={status} className={STATUS_BAR[status]} style={{ width: `${((byStatus[status] ?? 0) / statusTotal) * 100}%` }} /> : null,
                      )}
                  </div>
                  <ul className="space-y-1">
                    {ORDER_STATUSES.map((status) => (
                      <li key={status}>
                        <Link to={`/orders?status=${status}`} className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted">
                          <span className={cn('size-2.5 rounded-full', STATUS_BAR[status])} />
                          <span className="flex-1">{ORDER_STATUS_LABEL[status]}</span>
                          <span className="font-medium tabular-nums">{formatNumber(byStatus[status] ?? 0)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>The latest orders placed in the store</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            {isPending ? (
              <div className="space-y-3 px-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data?.recent_orders.length ? (
              <ul className="divide-y">
                {data.recent_orders.map((order) => (
                  <li key={order.id}>
                    <Link to={`/orders/${order.id}`} className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/50">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                        {order.customer.name?.[0]?.toUpperCase() ?? '#'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{order.customer.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          #{order.order_number} · {formatDate(order.created_at)}
                        </span>
                      </span>
                      <StatusBadge status={order.status} />
                      <span className="w-24 shrink-0 text-right text-sm font-medium tabular-nums">{formatPrice(order.total, order.currency)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">No orders yet. They'll show up here as soon as customers check out.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-gold" /> Low stock
            </CardTitle>
            <CardDescription>Variants at or below the low-stock threshold</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data?.low_stock.length ? (
              <ul className="divide-y">
                {data.low_stock.map((item) => (
                  <li key={item.variant_id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link to={`/products/${item.product_id}/edit`} className="min-w-0 hover:underline">
                      <p className="truncate text-sm font-medium">{item.product_name}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.variant_title}</p>
                    </Link>
                    <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset', item.stock === 0 ? TONES.red : TONES.amber)}>
                      {item.stock === 0 ? 'Out of stock' : `${item.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Everything is well stocked.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

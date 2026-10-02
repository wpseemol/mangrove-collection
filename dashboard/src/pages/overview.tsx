import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Banknote, Package, PackagePlus, ShoppingBag, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { formatDate, formatNumber, formatPrice } from '@/lib/format'
import type { DashboardStats } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

const RANGES = [7, 30, 90] as const

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function OverviewPage() {
  const user = useAuthStore((state) => state.user)
  const [days, setDays] = useState<(typeof RANGES)[number]>(30)

  const { data, isPending } = useQuery({
    queryKey: ['admin', 'dashboard', days],
    queryFn: () => api<{ data: DashboardStats }>('/admin/dashboard', { query: { days } }).then((r) => r.data),
  })

  const stats = [
    {
      label: 'Revenue',
      value: data ? formatPrice(data.totals.revenue) : null,
      hint: data ? `${formatPrice(data.totals.revenue_period)} in the last ${days} days` : '',
      icon: Banknote,
    },
    {
      label: 'Orders',
      value: data ? formatNumber(data.totals.orders) : null,
      hint: data ? `${formatNumber(data.totals.orders_period)} in the last ${days} days` : '',
      icon: ShoppingBag,
    },
    {
      label: 'Customers',
      value: data ? formatNumber(data.totals.customers) : null,
      hint: 'Registered accounts',
      icon: Users,
    },
    {
      label: 'Products',
      value: data ? formatNumber(data.totals.products) : null,
      hint: 'In the catalog',
      icon: Package,
    },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description="Here's how the store is doing."
        actions={
          <>
            <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v) as (typeof RANGES)[number])}>
              <TabsList>
                {RANGES.map((range) => (
                  <TabsTrigger key={range} value={String(range)}>
                    {range} days
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button asChild>
              <Link to="/products/new">
                <PackagePlus /> Add product
              </Link>
            </Button>
          </>
        }
      />

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
              {stat.value === null ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <p className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint || '\u00a0'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Daily sales over the last {days} days (cancelled orders excluded)</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
                <AreaChart data={data?.sales_chart ?? []} margin={{ left: 4, right: 12 }}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={28}
                    tickFormatter={(value: string) =>
                      new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    }
                  />
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
                  <Area
                    dataKey="revenue"
                    type="monotone"
                    fill="url(#fillRevenue)"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
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
                    <span
                      className={
                        item.stock === 0
                          ? 'shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700'
                          : 'shrink-0 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800'
                      }
                    >
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

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <CardDescription>The latest orders placed in the store</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                Array.from({ length: 3 }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="px-6">
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data?.recent_orders.length ? (
                data.recent_orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="pl-6 font-medium">#{order.order_number}</TableCell>
                    <TableCell>
                      <p>{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="pr-6 text-right font-medium tabular-nums">
                      {formatPrice(order.total, order.currency)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No orders yet. They'll show up here as soon as customers check out.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

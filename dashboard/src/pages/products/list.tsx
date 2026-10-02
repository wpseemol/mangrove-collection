import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageOff,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, errorMessage } from '@/lib/api'
import { STOREFRONT_URL } from '@/lib/config'
import { formatDate, formatNumber, formatPrice } from '@/lib/format'
import { useCategories } from '@/lib/queries'
import type { Paginated, Product } from '@/lib/types'

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
  { value: 'trash', label: 'Trash' },
] as const

type Tab = (typeof TABS)[number]['value']

function priceLabel(product: Product): string {
  const prices = product.variants.map((variant) => variant.price)
  if (!prices.length) return formatPrice(product.price, product.currency)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max
    ? formatPrice(min, product.currency)
    : `${formatPrice(min, product.currency)} – ${formatPrice(max, product.currency)}`
}

function StockCell({ product }: { product: Product }) {
  if (product.variants.some((variant) => variant.stock === null)) {
    return <span className="text-muted-foreground">Unlimited</span>
  }
  const total = product.variants.reduce((sum, variant) => sum + (variant.stock ?? 0), 0)
  if (total === 0) return <span className="font-medium text-red-600">Out of stock</span>
  return <span className="tabular-nums">{formatNumber(total)} in stock</span>
}

export function ProductsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const { data: categories } = useCategories()

  const tab = (TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'all') as Tab
  const category = params.get('category') ?? 'all'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const q = params.get('q') ?? ''

  const [search, setSearch] = useState(q)
  const [toDelete, setToDelete] = useState<Product | null>(null)

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

  const filters = { tab, category, q }

  const { data, isPending, isFetching } = useQuery({
    queryKey: ['admin', 'products', { ...filters, page }],
    placeholderData: (previous, previousQuery) => {
      const prev = previousQuery?.queryKey[2] as typeof filters | undefined
      const sameFilters = prev?.tab === tab && prev.category === category && prev.q === q
      return sameFilters ? keepPreviousData(previous) : undefined
    },
    queryFn: () =>
      api<Paginated<Product>>('/admin/products', {
        query: {
          page,
          per_page: 15,
          q,
          status: tab === 'published' || tab === 'draft' ? tab : undefined,
          trashed: tab === 'trash' ? 1 : undefined,
          category_id: category === 'all' ? undefined : category,
        },
      }),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin'] })

  const deleteProduct = useMutation({
    mutationFn: (product: Product) => api(`/admin/products/${product.id}`, { method: 'DELETE' }),
    onSuccess: (_, product) => {
      toast.success(`"${product.name}" moved to trash.`)
      setToDelete(null)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const restoreProduct = useMutation({
    mutationFn: (product: Product) => api(`/admin/products/${product.id}/restore`, { method: 'POST' }),
    onSuccess: (_, product) => {
      toast.success(`"${product.name}" restored.`)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const products = data?.data ?? []
  const meta = data?.meta
  const filtered = q !== '' || category !== 'all'

  return (
    <>
      <PageHeader
        title="Products"
        description="Add, edit and organise everything you sell."
        actions={
          <Button asChild>
            <Link to="/products/new">
              <Plus /> Add product
            </Link>
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={(value) => updateParams({ tab: value })}>
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
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
                placeholder="Search by name or SKU"
                className="pl-8"
                aria-label="Search products"
              />
            </div>
            <Select value={category} onValueChange={(value) => updateParams({ category: value })}>
              <SelectTrigger className="sm:w-48" aria-label="Filter by category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table className={isFetching && !isPending ? 'opacity-60 transition-opacity' : undefined}>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden xl:table-cell">Updated</TableHead>
              <TableHead className="w-12 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 6 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7} className="px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-11 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/5" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : products.length ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt=""
                          className="size-11 shrink-0 rounded-md border bg-muted object-cover"
                        />
                      ) : (
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                          <ImageOff className="size-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        {tab === 'trash' ? (
                          <p className="truncate font-medium">{product.name}</p>
                        ) : (
                          <Link
                            to={`/products/${product.id}/edit`}
                            className="flex items-center gap-1.5 truncate font-medium hover:text-primary hover:underline"
                          >
                            {product.name}
                            {product.is_featured && (
                              <Star className="size-3.5 shrink-0 fill-gold text-gold" aria-label="Featured" />
                            )}
                          </Link>
                        )}
                        <p className="truncate text-xs text-muted-foreground">
                          {product.variants.length > 1 ? `${product.variants.length} variants` : (product.variants[0]?.sku ?? product.slug)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.category?.name ?? '—'}</TableCell>
                  <TableCell className="font-medium tabular-nums">{priceLabel(product)}</TableCell>
                  <TableCell>
                    <StockCell product={product} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">
                    {formatDate(product.updated_at)}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    {tab === 'trash' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={restoreProduct.isPending}
                        onClick={() => restoreProduct.mutate(product)}
                      >
                        <RotateCcw /> Restore
                      </Button>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${product.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onSelect={() => navigate(`/products/${product.id}/edit`)}>
                            <Pencil /> Edit
                          </DropdownMenuItem>
                          {product.status === 'published' && (
                            <DropdownMenuItem asChild>
                              <a href={`${STOREFRONT_URL}/product?slug=${encodeURIComponent(product.slug)}`} target="_blank" rel="noreferrer">
                                <ExternalLink /> View in store
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(product)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                      {tab === 'trash' ? <Trash2 className="size-5" /> : <Package className="size-5" />}
                    </span>
                    <div>
                      <p className="font-medium">
                        {tab === 'trash' ? 'Trash is empty' : filtered ? 'No products match your filters' : 'No products yet'}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tab === 'trash'
                          ? 'Deleted products will appear here, and you can restore them.'
                          : filtered
                            ? 'Try a different search or category.'
                            : 'Add your first product to start selling.'}
                      </p>
                    </div>
                    {tab !== 'trash' && !filtered && (
                      <Button asChild size="sm">
                        <Link to="/products/new">
                          <Plus /> Add product
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
          <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
            <p>
              Showing <span className="font-medium text-foreground">{meta.from}</span>–
              <span className="font-medium text-foreground">{meta.to}</span> of{' '}
              <span className="font-medium text-foreground">{meta.total}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                <ChevronLeft /> Previous
              </Button>
              <span className="hidden sm:inline">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Next <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this product?"
        description={
          <>
            <span className="font-medium text-foreground">{toDelete?.name}</span> will be removed from the store and
            moved to Trash. Past orders keep their details, and you can restore it from Trash at any time.
          </>
        }
        confirmLabel="Delete product"
        pending={deleteProduct.isPending}
        onConfirm={() => toDelete && deleteProduct.mutate(toDelete)}
      />
    </>
  )
}

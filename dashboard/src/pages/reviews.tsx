import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, MessageSquareText, Search, Star, Trash2 } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, errorMessage } from '@/lib/api'
import { STOREFRONT_URL } from '@/lib/config'
import { formatDate } from '@/lib/format'
import { reviewsQueryKey } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import type { AdminReview, ReviewQueue, ReviewStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'hidden', label: 'Hidden' },
] as const

type Tab = (typeof TABS)[number]['value']

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={cn('size-3.5', star <= value ? 'text-amber-500' : 'text-muted-foreground/25')} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  )
}

export function ReviewsPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()

  const tab = (TABS.some((t) => t.value === params.get('status')) ? params.get('status') : 'all') as Tab
  const rating = params.get('rating') ?? 'all'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const q = params.get('q') ?? ''
  const [search, setSearch] = useState(q)
  const [deleting, setDeleting] = useState<AdminReview | null>(null)

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
    queryKey: [...reviewsQueryKey, { tab, rating, q, page }],
    placeholderData: keepPreviousData,
    queryFn: () =>
      api<ReviewQueue>('/admin/reviews', {
        query: { page, per_page: 20, q, status: tab === 'all' ? undefined : tab, rating: rating === 'all' ? undefined : rating },
      }),
  })

  const setStatus = useMutation({
    mutationFn: ({ review, status }: { review: AdminReview; status: ReviewStatus }) =>
      api<{ data: AdminReview }>(`/admin/reviews/${review.id}`, { method: 'PATCH', body: { status } }).then((r) => r.data),
    onSuccess: (review) => {
      toast.success(review.status === 'hidden' ? 'Review hidden from the product page.' : 'Review is visible on the product page again.')
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const remove = useMutation({
    mutationFn: (review: AdminReview) => api<void>(`/admin/reviews/${review.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Review deleted.')
      setDeleting(null)
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const reviews = data?.data ?? []
  const meta = data?.meta
  const counts = data?.counts
  const total = counts ? counts.published + counts.hidden : 0

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Reviews from verified buyers go live straight away. Hide anything off-topic or abusive, or delete it for good."
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

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Product, buyer, phone, order or text"
                className="pl-8"
                aria-label="Search reviews"
              />
            </div>
            <Select value={rating} onValueChange={(value) => updateParams({ rating: value })}>
              <SelectTrigger className="sm:w-36" aria-label="Filter by rating">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any rating</SelectItem>
                {[5, 4, 3, 2, 1].map((star) => (
                  <SelectItem key={star} value={String(star)}>
                    {star} star{star > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ul className={cn('divide-y', isFetching && !isPending && 'opacity-60 transition-opacity')}>
          {isPending ? (
            Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="p-4">
                <Skeleton className="h-24 w-full" />
              </li>
            ))
          ) : reviews.length ? (
            reviews.map((review) => {
              const busy = setStatus.isPending && setStatus.variables?.review.id === review.id
              return (
                <li key={review.id} className={cn('flex flex-col gap-4 p-4 md:flex-row', review.status === 'hidden' && 'bg-muted/30')}>
                  <div className="flex w-full shrink-0 items-start gap-3 md:w-56">
                    <span className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {review.product?.thumbnail && <img src={review.product.thumbnail} alt="" className="size-full object-cover" />}
                    </span>
                    <div className="min-w-0">
                      {review.product ? (
                        <a
                          href={`${STOREFRONT_URL}/product?slug=${encodeURIComponent(review.product.slug)}#reviews`}
                          target="_blank"
                          rel="noreferrer"
                          className="line-clamp-2 text-sm font-medium hover:text-primary"
                        >
                          {review.product.name}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Deleted product</p>
                      )}
                      {review.order && (
                        <Link to={`/orders/${review.order.id}`} className="font-mono text-xs text-muted-foreground hover:text-primary">
                          {review.order.order_number}
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Stars value={review.rating} />
                      <span className="text-sm font-medium">{review.reviewer.name}</span>
                      <span className="text-xs text-muted-foreground">{[review.reviewer.phone, review.reviewer.email].filter(Boolean).join(' · ')}</span>
                      {review.status === 'hidden' && (
                        <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', TONES.neutral)}>
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed break-words whitespace-pre-line">{review.comment}</p>
                    {review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {review.images.map((image, index) => (
                          <a
                            key={image.path}
                            href={image.url}
                            target="_blank"
                            rel="noreferrer"
                            className="size-16 overflow-hidden rounded-md border bg-muted hover:opacity-85"
                            aria-label={`Open photo ${index + 1}`}
                          >
                            <img src={image.url} alt="" className="size-full object-cover" loading="lazy" />
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                      {review.edited_at && ` · edited ${formatDate(review.edited_at)}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-start gap-2 md:flex-col md:items-end">
                    {review.status === 'published' ? (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => setStatus.mutate({ review, status: 'hidden' })}>
                        {busy ? <Loader2 className="animate-spin" /> : <EyeOff />} Hide
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => setStatus.mutate({ review, status: 'published' })}>
                        {busy ? <Loader2 className="animate-spin" /> : <Eye />} Publish
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeleting(review)}>
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </li>
              )
            })
          ) : (
            <li className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <MessageSquareText className="size-5" />
              </span>
              <div>
                <p className="font-medium">No reviews found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {q || tab !== 'all' || rating !== 'all' ? 'Try another tab, rating or search.' : 'Customers can review products once their order is delivered.'}
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
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.reviewer.name}&apos;s {deleting?.rating}-star review and its photos will be removed permanently, and the product rating recalculated. To
              keep it but take it off the site, hide it instead.
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
              Delete review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

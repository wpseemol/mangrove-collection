import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  Film,
  Heart,
  ImageIcon,
  LayoutGrid,
  List,
  MessageCircle,
  MoreHorizontal,
  Newspaper,
  Pencil,
  PenLine,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { IconGlyph } from '@/components/categories/icon-glyph'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, errorMessage } from '@/lib/api'
import { BLOG_STATUS_LABELS, readBlogView, saveBlogView, storefrontPostUrl, type BlogView } from '@/lib/blog'
import { formatDate, formatNumber } from '@/lib/format'
import { blogCategoriesQueryKey, blogPostsQueryKey, useBlogCategories } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import { isAdmin, type BlogPost, type BlogPostList, type BlogStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

type Tab = 'all' | BlogStatus
const TABS: Tab[] = ['all', 'published', 'draft']
const SORTS = [
  { value: 'latest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'views', label: 'Most viewed' },
] as const
const PER_PAGE_OPTIONS = [12, 24, 48] as const
const DEFAULT_PER_PAGE = 12

/** Page numbers with `null` gaps, e.g. 1 … 4 5 6 … 12. */
function pageNumbers(current: number, last: number): (number | null)[] {
  const pages = new Set([1, last, current - 1, current, current + 1].filter((n) => n >= 1 && n <= last))
  const sorted = [...pages].sort((a, b) => a - b)
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? [null, n] : [n]))
}

function StatusBadge({ post }: { post: BlogPost }) {
  const scheduled = post.status === 'published' && post.published_at && new Date(post.published_at) > new Date()
  const tone = scheduled ? TONES.amber : post.status === 'published' ? TONES.green : TONES.neutral
  return (
    <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', tone)}>
      {scheduled ? 'Scheduled' : BLOG_STATUS_LABELS[post.status]}
    </Badge>
  )
}

function Cover({ post, className }: { post: BlogPost; className?: string }) {
  return post.cover_image ? (
    <img src={post.cover_image} alt="" loading="lazy" className={cn('object-cover', className)} />
  ) : (
    <span className={cn('flex items-center justify-center bg-linear-to-br from-secondary to-muted text-primary/60', className)}>
      <Newspaper className="size-6" />
    </span>
  )
}

function Meta({ post }: { post: BlogPost }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3" /> {post.reading_minutes} min
      </span>
      <span className="inline-flex items-center gap-1">
        <Eye className="size-3" /> {formatNumber(post.views)}
      </span>
      {post.likes_count ? (
        <span className="inline-flex items-center gap-1">
          <Heart className="size-3" /> {formatNumber(post.likes_count)}
        </span>
      ) : null}
      {post.comments_count ? (
        <Link to={`/blog/comments?post_id=${post.id}`} className="inline-flex items-center gap-1 hover:text-primary">
          <MessageCircle className="size-3" /> {formatNumber(post.comments_count)}
        </Link>
      ) : null}
      {post.images_count ? (
        <span className="inline-flex items-center gap-1">
          <ImageIcon className="size-3" /> {post.images_count}
        </span>
      ) : null}
      {post.videos_count ? (
        <span className="inline-flex items-center gap-1">
          <Film className="size-3" /> {post.videos_count}
        </span>
      ) : null}
    </span>
  )
}

function Actions({ post, onDelete }: { post: BlogPost; onDelete: () => void }) {
  const live = post.status === 'published' && post.published_at && new Date(post.published_at) <= new Date()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${post.title}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/blog/${post.id}/edit`}>
            <Pencil /> Edit
          </Link>
        </DropdownMenuItem>
        {live && (
          <DropdownMenuItem asChild>
            <a href={storefrontPostUrl(post.slug)} target="_blank" rel="noreferrer">
              <ExternalLink /> View on store
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function BlogPostsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { data: categories } = useBlogCategories()
  const [view, setView] = useState<BlogView>(readBlogView)
  const [deleting, setDeleting] = useState<BlogPost | null>(null)
  const admin = isAdmin(useAuthStore((state) => state.user))

  const tab = (TABS.find((t) => t === params.get('status')) ?? 'all') as Tab
  const sort = SORTS.find((s) => s.value === params.get('sort'))?.value ?? 'latest'
  const categoryId = params.get('category_id') ?? 'all'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const perPage = PER_PAGE_OPTIONS.find((n) => String(n) === params.get('per_page')) ?? DEFAULT_PER_PAGE
  const q = params.get('q') ?? ''
  const [search, setSearch] = useState(q)

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '' || value === 'all' || (key === 'sort' && value === 'latest') || (key === 'page' && value === '1') || (key === 'per_page' && value === String(DEFAULT_PER_PAGE)))
        next.delete(key)
      else next.set(key, value)
    }
    if (!('page' in changes)) next.delete('page')
    setParams(next, { replace: true })
  }

  const goToPage = (next: number) => {
    updateParams({ page: String(next) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (search === q) return
    const timer = setTimeout(() => updateParams({ q: search.trim() }), 350)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const { data, isPending, isFetching } = useQuery({
    queryKey: [...blogPostsQueryKey, { tab, q, page, perPage, sort, categoryId }],
    placeholderData: keepPreviousData,
    queryFn: () =>
      api<BlogPostList>('/admin/blog/posts', {
        query: { page, per_page: perPage, q, sort, status: tab === 'all' ? undefined : tab, category_id: categoryId === 'all' ? undefined : categoryId },
      }),
  })

  const remove = useMutation({
    mutationFn: (post: BlogPost) => api<void>(`/admin/blog/posts/${post.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Post deleted.')
      setDeleting(null)
      if (posts.length === 1 && page > 1) updateParams({ page: String(page - 1) })
      queryClient.invalidateQueries({ queryKey: blogPostsQueryKey })
      queryClient.invalidateQueries({ queryKey: blogCategoriesQueryKey })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const changeView = (next: BlogView) => {
    setView(next)
    saveBlogView(next)
  }

  const posts = data?.data ?? []
  const meta = data?.meta
  const counts = data?.counts
  const total = counts ? counts.draft + counts.published : 0

  return (
    <>
      <PageHeader
        title="Blog posts"
        description={
          admin
            ? 'Write stories, recipes and news for your customers. You can edit or delete any post.'
            : 'Write stories, recipes and news for your customers. You see and manage the posts you wrote.'
        }
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/blog/comments">
                <MessageCircle /> Comments
              </Link>
            </Button>
            {admin && (
              <Button variant="outline" asChild>
                <Link to="/blog/categories">Categories</Link>
              </Button>
            )}
            <Button asChild>
              <Link to="/blog/new">
                <PenLine /> Write a post
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 xl:flex-row xl:items-center xl:justify-between">
          <Tabs value={tab} onValueChange={(value) => updateParams({ status: value })}>
            <TabsList>
              {TABS.map((t) => {
                const count = t === 'all' ? total : counts?.[t]
                return (
                  <TabsTrigger key={t} value={t} className="gap-1.5">
                    {t === 'all' ? 'All' : t === 'draft' ? 'Drafts' : 'Published'}
                    {count ? <span className="rounded-full bg-muted-foreground/15 px-1.5 text-[11px] leading-4 tabular-nums">{count}</span> : null}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Select value={categoryId} onValueChange={(value) => updateParams({ category_id: value })}>
              <SelectTrigger className="sm:w-44" aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(value) => updateParams({ sort: value })}>
              <SelectTrigger className="sm:w-40" aria-label="Sort posts">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative sm:w-60">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts" className="pl-8" aria-label="Search posts" maxLength={100} />
            </div>
            <div className="flex rounded-md border p-0.5" role="group" aria-label="Layout">
              <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="size-8" onClick={() => changeView('grid')} aria-pressed={view === 'grid'} aria-label="Grid view">
                <LayoutGrid />
              </Button>
              <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="size-8" onClick={() => changeView('list')} aria-pressed={view === 'list'} aria-label="List view">
                <List />
              </Button>
            </div>
          </div>
        </div>

        <div className={cn(isFetching && !isPending && 'opacity-60 transition-opacity')}>
          {isPending ? (
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : !posts.length && meta && meta.total > 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="font-medium">This page is empty</p>
              <Button size="sm" variant="outline" onClick={() => goToPage(meta.last_page)}>
                Go to the last page
              </Button>
            </div>
          ) : !posts.length ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <Newspaper className="size-5" />
              </span>
              <div>
                <p className="font-medium">No posts found</p>
                <p className="mt-1 text-sm text-muted-foreground">{q || tab !== 'all' || categoryId !== 'all' ? 'Try another filter or search.' : 'Your first story is one click away.'}</p>
              </div>
              <Button size="sm" asChild>
                <Link to="/blog/new">
                  <PenLine /> Write a post
                </Link>
              </Button>
            </div>
          ) : view === 'grid' ? (
            <ul className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id} className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
                  <button type="button" onClick={() => navigate(`/blog/${post.id}/edit`)} className="relative block text-left" aria-label={`Edit ${post.title}`}>
                    <Cover post={post} className="aspect-[16/9] w-full transition-transform duration-300 group-hover:scale-[1.02]" />
                    <span className="absolute top-2 left-2 flex gap-1.5">
                      <StatusBadge post={post} />
                      {post.is_featured && (
                        <Badge className="gap-1 bg-amber-500 text-white">
                          <Star className="size-3 fill-current" /> Featured
                        </Badge>
                      )}
                    </span>
                  </button>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    {post.category && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                        {post.category.icon_nodes && <IconGlyph nodes={post.category.icon_nodes} className="size-3.5" />}
                        {post.category.name}
                      </span>
                    )}
                    <Link to={`/blog/${post.id}/edit`} className="line-clamp-2 font-semibold leading-snug hover:text-primary">
                      {post.title}
                    </Link>
                    {post.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <Meta post={post} />
                      <Actions post={post} onDelete={() => setDeleting(post)} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {post.author?.name ?? 'Unknown author'} · {formatDate(post.published_at ?? post.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="divide-y">
              {posts.map((post) => (
                <li key={post.id} className="flex items-center gap-4 p-4">
                  <Link to={`/blog/${post.id}/edit`} className="shrink-0 overflow-hidden rounded-lg">
                    <Cover post={post} className="h-16 w-24 sm:h-20 sm:w-32" />
                  </Link>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge post={post} />
                      {post.is_featured && <Star className="size-3.5 fill-amber-500 text-amber-500" aria-label="Featured" />}
                      {post.category && <span className="text-xs font-medium text-primary">{post.category.name}</span>}
                    </div>
                    <Link to={`/blog/${post.id}/edit`} className="line-clamp-1 font-medium hover:text-primary">
                      {post.title}
                    </Link>
                    <Meta post={post} />
                  </div>
                  <div className="hidden shrink-0 text-right text-xs text-muted-foreground md:block">
                    <p>{post.author?.name ?? 'Unknown author'}</p>
                    <p>{formatDate(post.published_at ?? post.created_at)}</p>
                  </div>
                  <Actions post={post} onDelete={() => setDeleting(post)} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {meta && meta.total > 0 && (
          <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p>
                Showing <span className="font-medium text-foreground">{meta.from}</span>–<span className="font-medium text-foreground">{meta.to}</span> of{' '}
                <span className="font-medium text-foreground">{meta.total}</span> posts
              </p>
              <label className="flex items-center gap-2">
                Per page
                <Select value={String(perPage)} onValueChange={(value) => updateParams({ per_page: value })}>
                  <SelectTrigger size="sm" className="w-18" aria-label="Posts per page">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PER_PAGE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
            {meta.last_page > 1 && (
              <nav className="flex items-center gap-1" aria-label="Pagination">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)} aria-label="Previous page">
                  <ChevronLeft /> <span className="hidden sm:inline">Previous</span>
                </Button>
                {pageNumbers(page, meta.last_page).map((n, i) =>
                  n === null ? (
                    <span key={`gap-${i}`} className="px-1" aria-hidden>
                      …
                    </span>
                  ) : (
                    <Button
                      key={n}
                      variant={n === page ? 'default' : 'ghost'}
                      size="sm"
                      className="min-w-8 tabular-nums"
                      onClick={() => goToPage(n)}
                      aria-current={n === page ? 'page' : undefined}
                      aria-label={`Page ${n}`}
                    >
                      {n}
                    </Button>
                  ),
                )}
                <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => goToPage(page + 1)} aria-label="Next page">
                  <span className="hidden sm:inline">Next</span> <ChevronRight />
                </Button>
              </nav>
            )}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.title}"?`}
        description="The post and its gallery list are removed permanently. Uploaded files stay in the media library. To hide it instead, switch it back to draft."
        confirmLabel="Delete post"
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </>
  )
}

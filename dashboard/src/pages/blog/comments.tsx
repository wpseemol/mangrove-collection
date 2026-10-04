import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, ExternalLink, Eye, EyeOff, MessageCircle, Search, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, errorMessage } from '@/lib/api'
import { storefrontPostUrl } from '@/lib/blog'
import { blogPostsQueryKey } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import { isAdmin, type BlogComment, type BlogCommentList } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

const commentsQueryKey = ['admin', 'blog', 'comments'] as const
type Tab = 'all' | 'visible' | 'hidden'

const timeAgo = (value: string) => {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 1000))
  const units: [number, string][] = [
    [31_536_000, 'year'],
    [2_592_000, 'month'],
    [86_400, 'day'],
    [3_600, 'hour'],
    [60, 'minute'],
  ]
  for (const [size, unit] of units) if (seconds >= size) return `${Math.floor(seconds / size)} ${unit}${Math.floor(seconds / size) === 1 ? '' : 's'} ago`
  return 'just now'
}

export function BlogCommentsPage() {
  const queryClient = useQueryClient()
  const admin = isAdmin(useAuthStore((state) => state.user))
  const [params, setParams] = useSearchParams()
  const [deleting, setDeleting] = useState<BlogComment | null>(null)

  const tab = (['visible', 'hidden'].includes(params.get('visibility') ?? '') ? params.get('visibility') : 'all') as Tab
  const postId = params.get('post_id')
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
    queryKey: [...commentsQueryKey, { tab, q, page, postId }],
    placeholderData: keepPreviousData,
    queryFn: () =>
      api<BlogCommentList>('/admin/blog/comments', { query: { page, per_page: 20, q, visibility: tab === 'all' ? undefined : tab, post_id: postId ?? undefined } }),
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: commentsQueryKey })
    queryClient.invalidateQueries({ queryKey: blogPostsQueryKey })
  }

  const toggle = useMutation({
    mutationFn: (comment: BlogComment) => api<{ data: BlogComment }>(`/admin/blog/comments/${comment.id}`, { method: 'PATCH', body: { is_hidden: !comment.is_hidden } }),
    onSuccess: ({ data: comment }) => {
      toast.success(comment.is_hidden ? 'Comment hidden from the storefront.' : 'Comment is visible again.')
      refresh()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const remove = useMutation({
    mutationFn: (comment: BlogComment) => api(`/admin/blog/comments/${comment.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Comment deleted.')
      setDeleting(null)
      refresh()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const comments = data?.data ?? []
  const meta = data?.meta
  const counts = data?.counts
  const filteredPost = postId && comments[0]?.post?.id === Number(postId) ? comments[0].post : null

  return (
    <>
      <PageHeader
        title="Blog comments"
        description={
          admin
            ? 'Comments from signed-in customers on every post. Hide anything off-topic, or delete spam and abuse.'
            : 'Comments on the posts you wrote. Hide anything off-topic, or delete spam and abuse.'
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs value={tab} onValueChange={(value) => updateParams({ visibility: value })}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="visible" className="gap-1.5">
                Visible {counts?.visible ? <span className="rounded-full bg-muted-foreground/15 px-1.5 text-[11px] tabular-nums">{counts.visible}</span> : null}
              </TabsTrigger>
              <TabsTrigger value="hidden" className="gap-1.5">
                Hidden {counts?.hidden ? <span className="rounded-full bg-muted-foreground/15 px-1.5 text-[11px] tabular-nums">{counts.hidden}</span> : null}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {postId && (
              <Button variant="secondary" size="sm" onClick={() => updateParams({ post_id: null })} className="max-w-72">
                <span className="truncate">{filteredPost ? filteredPost.title : 'One post'}</span> <X />
              </Button>
            )}
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search comments or names" className="pl-8" aria-label="Search comments" maxLength={100} />
            </div>
          </div>
        </div>

        <div className={cn(isFetching && !isPending && 'opacity-60 transition-opacity')}>
          {isPending ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !comments.length ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <MessageCircle className="size-5" />
              </span>
              <p className="font-medium">No comments {tab === 'hidden' ? 'hidden' : 'yet'}</p>
              <p className="text-sm text-muted-foreground">Signed-in customers can comment on published posts.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {comments.map((comment) => (
                <li key={comment.id} className={cn('flex gap-3 p-4', comment.is_hidden && 'bg-muted/40')}>
                  <Avatar className="size-9">
                    <AvatarImage src={comment.author?.avatar ?? undefined} alt="" />
                    <AvatarFallback>{comment.author?.name?.[0] ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <span className="font-medium">{comment.author?.name ?? 'Deleted user'}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
                      {comment.is_hidden && (
                        <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', TONES.neutral)}>
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <p className={cn('text-sm break-words whitespace-pre-line', comment.is_hidden && 'text-muted-foreground')}>{comment.body}</p>
                    {comment.post && (
                      <p className="text-xs text-muted-foreground">
                        on{' '}
                        <button type="button" className="font-medium hover:text-primary" onClick={() => updateParams({ post_id: String(comment.post!.id) })}>
                          {comment.post.title}
                        </button>{' '}
                        <a href={storefrontPostUrl(comment.post.slug)} target="_blank" rel="noreferrer" className="inline-flex items-center hover:text-primary" aria-label="View on store">
                          <ExternalLink className="size-3" />
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-start gap-1">
                    <Button size="sm" variant="outline" disabled={toggle.isPending && toggle.variables?.id === comment.id} onClick={() => toggle.mutate(comment)}>
                      {comment.is_hidden ? <Eye /> : <EyeOff />}
                      <span className="hidden sm:inline">{comment.is_hidden ? 'Show' : 'Hide'}</span>
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleting(comment)} aria-label="Delete comment">
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

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

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this comment?"
        description="It is removed permanently. To keep it for reference, hide it instead."
        confirmLabel="Delete comment"
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </>
  )
}

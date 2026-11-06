import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronLeft, ChevronRight, Copy, Film, ImagePlus, Loader2, Search, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { VideoDialog } from '@/components/blog/media-dialogs'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, errorMessage } from '@/lib/api'
import { formatDate, formatNumber } from '@/lib/format'
import { ACCEPTED_IMAGES, uploadImages } from '@/lib/media'
import type { Media, Paginated } from '@/lib/types'
import { cn } from '@/lib/utils'

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
] as const

type Tab = (typeof TABS)[number]['value']

const mediaQueryKey = ['admin', 'media'] as const

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function isVideo(media: Media) {
  return media.mime_type.startsWith('video/')
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value)
}

export function MediaLibraryPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const imageInputRef = useRef<HTMLInputElement>(null)

  const tab = (TABS.some((t) => t.value === params.get('type')) ? params.get('type') : 'all') as Tab
  const page = Math.max(1, Number(params.get('page')) || 1)
  const q = params.get('q') ?? ''
  const [search, setSearch] = useState(q)
  const [deleting, setDeleting] = useState<Media | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [videoOpen, setVideoOpen] = useState(false)

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

  const type = tab === 'all' ? undefined : tab

  const { data, isPending, isFetching } = useQuery({
    queryKey: [...mediaQueryKey, { tab, q, page }],
    placeholderData: keepPreviousData,
    queryFn: () =>
      api<Paginated<Media>>('/admin/media', {
        query: { page, per_page: 40, q: q || undefined, type },
      }),
  })

  const remove = useMutation({
    mutationFn: (media: Media) => api(`/admin/media/${media.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('File removed from the media library.')
      setDeleting(null)
      queryClient.invalidateQueries({ queryKey: mediaQueryKey })
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const uploadImageFiles = async (files: File[]) => {
    const images = files.filter((file) => ACCEPTED_IMAGES.split(',').includes(file.type))
    if (!images.length) {
      if (files.length) toast.error('Please choose JPG, PNG, WEBP or GIF images.')
      return
    }
    setUploadProgress(0)
    try {
      await uploadImages(images, setUploadProgress)
      toast.success(images.length === 1 ? 'Image uploaded.' : `${images.length} images uploaded.`)
      queryClient.invalidateQueries({ queryKey: mediaQueryKey })
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setUploadProgress(null)
    }
  }

  const copyUrl = async (media: Media) => {
    try {
      await copyText(media.url)
      setCopiedId(media.id)
      toast.success('URL copied — paste it anywhere you need this file.')
      window.setTimeout(() => setCopiedId((id) => (id === media.id ? null : id)), 1500)
    } catch {
      toast.error('Could not copy the URL.')
    }
  }

  const items = data?.data ?? []
  const meta = data?.meta

  return (
    <>
      <PageHeader
        title="Media library"
        description="Every image and video uploaded to the store. Copy a URL to reuse it on products, posts or pages."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={uploadProgress !== null} onClick={() => imageInputRef.current?.click()}>
              {uploadProgress !== null ? <Loader2 className="animate-spin" /> : <ImagePlus />}
              Upload images
            </Button>
            <Button type="button" onClick={() => setVideoOpen(true)}>
              <Film /> Add video
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept={ACCEPTED_IMAGES}
              multiple
              hidden
              onChange={(e) => {
                void uploadImageFiles(Array.from(e.target.files ?? []))
                e.target.value = ''
              }}
            />
          </div>
        }
      />

      {uploadProgress !== null && (
        <Card className="mb-4 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Uploading images…</span>
            <span className="tabular-nums text-muted-foreground">{Math.round(uploadProgress * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round(uploadProgress * 100)}%` }} />
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={tab} onValueChange={(value) => updateParams({ type: value })}>
            <TabsList>
              {TABS.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by file name" className="pl-9" />
          </div>
        </div>

        {isPending ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="aspect-video rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
            <Upload className="size-8 text-primary" />
            <p className="font-medium text-foreground">No media yet</p>
            <p>Upload images or add a video to keep reusable URLs here.</p>
          </div>
        ) : (
          <div className={cn('grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', isFetching && 'opacity-70')}>
            {items.map((media) => {
              const video = isVideo(media)
              return (
                <article key={media.id} className="overflow-hidden rounded-lg border bg-card">
                  <div className="relative aspect-video bg-muted">
                    {video ? (
                      <video src={media.url} preload="metadata" muted className="size-full object-contain" />
                    ) : (
                      <img src={media.url} alt="" className="size-full object-cover" />
                    )}
                    <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {video ? 'Video' : 'Image'}
                    </span>
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="truncate text-sm font-medium" title={media.original_name}>
                      {media.original_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(media.size)} · {formatDate(media.created_at)}
                    </p>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => void copyUrl(media)}>
                        {copiedId === media.id ? <Check /> : <Copy />}
                        {copiedId === media.id ? 'Copied' : 'Copy URL'}
                      </Button>
                      <Button type="button" size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleting(media)} aria-label="Delete">
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              {formatNumber(meta.from ?? 0)}–{formatNumber(meta.to ?? 0)} of {formatNumber(meta.total)}
            </span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>
                <ChevronLeft /> Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page >= meta.last_page}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Next <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <VideoDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        onSubmit={({ provider, url }) => {
          setVideoOpen(false)
          if (provider === 'upload') {
            toast.success('Video uploaded to the media library.')
            queryClient.invalidateQueries({ queryKey: mediaQueryKey })
            return
          }
          void copyText(url).then(
            () => toast.success(`${provider === 'youtube' ? 'YouTube' : provider === 'facebook' ? 'Facebook' : 'Vimeo'} URL copied for reuse.`),
            () => toast.error('Could not copy the URL.'),
          )
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this file?"
        description="The file is removed from storage. Products or posts that still use this URL will show a broken image or video until you update them."
        confirmLabel="Delete file"
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </>
  )
}

import { ArrowLeft, ArrowRight, Film, ImagePlus, Loader2, Play, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { VideoDialog } from '@/components/blog/media-dialogs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { errorMessage } from '@/lib/api'
import { MAX_MEDIA, mediaKey, type MediaDraft } from '@/lib/blog'
import { ACCEPTED_IMAGES, uploadImages } from '@/lib/media'
import { cn } from '@/lib/utils'
import { PROVIDER_LABELS, videoThumbnail } from '@/lib/video'

/** The post's gallery: any mix of images and videos, shown under the article on the storefront. */
export function MediaGallery({ items, onChange, errors }: { items: MediaDraft[]; onChange: (items: MediaDraft[]) => void; errors: Record<string, string> }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const room = MAX_MEDIA - items.length

  const addImages = async (files: File[]) => {
    const images = files.filter((file) => ACCEPTED_IMAGES.split(',').includes(file.type)).slice(0, room)
    if (!images.length) return files.length && toast.error(room ? 'Please choose JPG, PNG, WEBP or GIF images.' : `A post can have up to ${MAX_MEDIA} gallery items.`)
    setUploading(true)
    try {
      const media = await uploadImages(images)
      onChange([...items, ...media.map((m) => ({ key: mediaKey(), type: 'image' as const, provider: 'upload' as const, url: m.url, caption: '' }))])
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  const move = (index: number, by: number) => {
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(index + by, 0, item)
    onChange(next)
  }

  const update = (key: string, caption: string) => onChange(items.map((item) => (item.key === key ? { ...item, caption } : item)))

  const imageCount = items.filter((item) => item.type === 'image').length

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {imageCount} image{imageCount === 1 ? '' : 's'} · {items.length - imageCount} video{items.length - imageCount === 1 ? '' : 's'} · {room} slots left
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={uploading || room <= 0} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />} Add images
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={room <= 0} onClick={() => setVideoOpen(true)}>
            <Film /> Add video
          </Button>
        </div>
        <input ref={inputRef} type="file" accept={ACCEPTED_IMAGES} multiple hidden onChange={(e) => (addImages(Array.from(e.target.files ?? [])), (e.target.value = ''))} />
      </div>

      {items.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => {
            const thumb = item.type === 'image' ? item.url : videoThumbnail(item.url)
            const error = errors[`media.${index}.url`] ?? errors[`media.${index}.caption`]
            return (
              <li key={item.key} className={cn('overflow-hidden rounded-lg border bg-card', error && 'border-destructive')}>
                <div className="group relative aspect-video bg-muted">
                  {thumb ? (
                    <img src={thumb} alt="" className="size-full object-cover" />
                  ) : item.provider === 'upload' ? (
                    <video src={item.url} preload="metadata" muted className="size-full bg-black object-contain" />
                  ) : (
                    <span className="flex size-full items-center justify-center bg-zinc-900 text-white/70">
                      <Film className="size-6" />
                    </span>
                  )}
                  {item.type === 'video' && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white">
                        <Play className="size-4 fill-current" />
                      </span>
                    </span>
                  )}
                  <Badge className="absolute top-2 left-2 bg-black/60 text-white">{item.type === 'image' ? `Image ${index + 1}` : PROVIDER_LABELS[item.provider]}</Badge>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <Button type="button" size="icon" variant="secondary" className="size-7" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move earlier">
                      <ArrowLeft />
                    </Button>
                    <Button type="button" size="icon" variant="secondary" className="size-7" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Move later">
                      <ArrowRight />
                    </Button>
                    <Button type="button" size="icon" variant="destructive" className="size-7" onClick={() => onChange(items.filter((other) => other.key !== item.key))} aria-label="Remove">
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <Input value={item.caption} onChange={(e) => update(item.key, e.target.value)} placeholder="Caption (optional)" maxLength={255} className="h-8 text-xs" aria-invalid={Boolean(error)} />
                  {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          <span className="flex gap-2 text-primary">
            <ImagePlus className="size-5" />
            <Film className="size-5" />
          </span>
          Add photos and videos to show as a gallery under the post.
        </div>
      )}

      <VideoDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        onSubmit={({ provider, url }) => {
          onChange([...items, { key: mediaKey(), type: 'video', provider, url, caption: '' }])
          setVideoOpen(false)
        }}
      />
    </div>
  )
}

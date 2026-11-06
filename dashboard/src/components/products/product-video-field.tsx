import { Film, Play, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { VideoDialog } from '@/components/blog/media-dialogs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { detectProvider, embedUrl, PROVIDER_LABELS, videoThumbnail } from '@/lib/video'

/** One product video: YouTube/Facebook short link, Vimeo, or a securely uploaded MP4/WebM. */
export function ProductVideoField({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (url: string) => void
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const provider = value ? detectProvider(value) : null
  const thumb = value ? videoThumbnail(value) : null
  const embed = value ? embedUrl(value) : null

  return (
    <div className="space-y-3">
      {value && provider ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="relative aspect-video bg-muted">
            {thumb ? (
              <img src={thumb} alt="" className="size-full object-cover" />
            ) : provider === 'upload' ? (
              <video src={value} preload="metadata" muted className="size-full bg-black object-contain" />
            ) : embed ? (
              <iframe
                src={embed}
                title="Product video"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                className="size-full border-0"
              />
            ) : (
              <span className="flex size-full items-center justify-center bg-zinc-900 text-white/70">
                <Film className="size-8" />
              </span>
            )}
            {thumb && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-black/60 text-white">
                  <Play className="size-5 fill-current" />
                </span>
              </span>
            )}
            <Badge className="absolute top-2 left-2 bg-black/60 text-white">{PROVIDER_LABELS[provider]}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t p-3">
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{value}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
              Replace
            </Button>
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => onChange('')}>
              <Trash2 /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed bg-muted/40 py-10 text-xs text-muted-foreground hover:border-primary/50 hover:bg-secondary"
        >
          <Film className="size-6 text-primary" />
          <span className="font-medium text-foreground">Add a product video</span>
          <span>YouTube Shorts · Facebook Reel · Vimeo · or upload MP4/WebM</span>
        </button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <VideoDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={({ url }) => {
          onChange(url)
          setOpen(false)
        }}
      />
    </div>
  )
}

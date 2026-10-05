import { Film, ImagePlus, Link2, Loader2, Upload, X } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { FormField, Optional } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { errorMessage } from '@/lib/api'
import { ACCEPTED_IMAGES, ACCEPTED_VIDEOS, MAX_VIDEO_MB, uploadImages, uploadVideo } from '@/lib/media'
import type { VideoProvider } from '@/lib/types'
import { isSafeLink, isUnsafeText, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'
import { detectProvider, PROVIDER_LABELS, videoThumbnail } from '@/lib/video'

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value) && isSafeLink(value)

export function LinkDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: string
  onSubmit: (href: string | null) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">{open && <LinkForm initial={initial} onSubmit={onSubmit} />}</DialogContent>
    </Dialog>
  )
}

function LinkForm({ initial, onSubmit }: { initial: string; onSubmit: (href: string | null) => void }) {
  const [href, setHref] = useState(initial)
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = href.trim()
    if (!value) return onSubmit(null)
    if (!isSafeLink(value) && !/^(?:mailto:|tel:)[^\s<>"'`]+$/i.test(value)) return setError('Enter a full http(s) link, a site path like /shop, or mailto:/tel:.')
    onSubmit(value)
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <DialogHeader>
        <DialogTitle>{initial ? 'Edit link' : 'Add link'}</DialogTitle>
        <DialogDescription>Links to other sites open in a new tab.</DialogDescription>
      </DialogHeader>
      <FormField id="link-href" label="Link" error={error}>
        <Input id="link-href" value={href} onChange={(e) => (setHref(e.target.value), setError(''))} placeholder="https://… or /shop" autoFocus maxLength={2048} />
      </FormField>
      <DialogFooter>
        {initial && (
          <Button type="button" variant="outline" onClick={() => onSubmit(null)}>
            Remove link
          </Button>
        )}
        <Button type="submit">Save link</Button>
      </DialogFooter>
    </form>
  )
}

export function ImageDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (image: { url: string; alt: string }) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">{open && <ImageForm onSubmit={onSubmit} />}</DialogContent>
    </Dialog>
  )
}

function ImageForm({ onSubmit }: { onSubmit: (image: { url: string; alt: string }) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<{ url?: string; alt?: string }>({})

  const upload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const [media] = await uploadImages([file])
      setUrl(media.url)
      if (!alt) setAlt(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 120))
      setErrors({})
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next: typeof errors = {}
    if (!isHttpUrl(url.trim())) next.url = 'Upload an image or paste a full http(s) image link.'
    if (alt.length > 255) next.alt = 'Keep the description under 255 characters.'
    else if (isUnsafeText(alt)) next.alt = UNSAFE_TEXT_MESSAGE
    setErrors(next)
    if (!Object.keys(next).length) onSubmit({ url: url.trim(), alt: alt.trim() })
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <DialogHeader>
        <DialogTitle>Insert image</DialogTitle>
        <DialogDescription>Upload from your computer or use a link to an image online.</DialogDescription>
      </DialogHeader>

      {url && isHttpUrl(url) ? (
        <div className="relative overflow-hidden rounded-lg border bg-muted">
          <img src={url} alt="" className="max-h-64 w-full object-contain" />
          <Button type="button" size="icon" variant="secondary" className="absolute top-2 right-2 size-7" onClick={() => setUrl('')} aria-label="Remove image">
            <X />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed bg-muted/40 py-8 text-xs text-muted-foreground hover:border-primary/50 hover:bg-secondary"
        >
          {uploading ? <Loader2 className="size-5 animate-spin text-primary" /> : <ImagePlus className="size-5 text-primary" />}
          <span className="font-medium text-foreground">{uploading ? 'Uploading…' : 'Upload an image'}</span>
          <span>JPG, PNG, WEBP or GIF · up to 5 MB</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept={ACCEPTED_IMAGES} hidden onChange={(e) => (upload(e.target.files?.[0]), (e.target.value = ''))} />

      <FormField id="image-url" label="…or image link" error={errors.url}>
        <Input id="image-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" maxLength={2048} />
      </FormField>
      <FormField id="image-alt" label="Description (alt text)" hint={<Optional />} error={errors.alt} description="Describes the image for screen readers and search engines.">
        <Input id="image-alt" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={255} />
      </FormField>

      <DialogFooter>
        <Button type="submit" disabled={uploading}>
          Insert image
        </Button>
      </DialogFooter>
    </form>
  )
}

export type VideoChoice = { provider: VideoProvider; url: string }

export function VideoDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (video: VideoChoice) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">{open && <VideoForm onSubmit={onSubmit} />}</DialogContent>
    </Dialog>
  )
}

function VideoForm({ onSubmit }: { onSubmit: (video: VideoChoice) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [fileName, setFileName] = useState('')

  const provider = detectProvider(link.trim())
  const thumbnail = provider ? videoThumbnail(link.trim()) : null

  const upload = async (file: File | undefined) => {
    if (!file) return
    setFileName(file.name)
    setProgress(0)
    abortRef.current = new AbortController()
    try {
      const media = await uploadVideo(file, setProgress, abortRef.current.signal)
      onSubmit({ provider: 'upload', url: media.url })
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) toast.error(errorMessage(e))
      setProgress(null)
    }
  }

  const submitLink = (event: FormEvent) => {
    event.preventDefault()
    const value = link.trim()
    const detected = detectProvider(value)
    if (!detected || detected === 'upload') return setError('Paste a YouTube or Vimeo link, e.g. https://youtu.be/…')
    onSubmit({ provider: detected, url: value })
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Add video</DialogTitle>
        <DialogDescription>Upload a video file or paste a YouTube or Vimeo link.</DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="link">
        <TabsList className="w-full">
          <TabsTrigger value="link" className="flex-1">
            <Link2 /> YouTube / Vimeo
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">
            <Upload /> Upload file
          </TabsTrigger>
        </TabsList>

        <TabsContent value="link">
          <form onSubmit={submitLink} noValidate className="space-y-4 pt-2">
            <FormField id="video-link" label="Video link" error={error} description={provider && provider !== 'upload' ? `${PROVIDER_LABELS[provider]} video found.` : 'Works with youtube.com, youtu.be, Shorts and vimeo.com links.'}>
              <Input id="video-link" value={link} onChange={(e) => (setLink(e.target.value), setError(''))} placeholder="https://www.youtube.com/watch?v=…" maxLength={2048} autoFocus />
            </FormField>
            {thumbnail && <img src={thumbnail} alt="" className="aspect-video w-full rounded-lg border object-cover" />}
            <DialogFooter>
              <Button type="submit" disabled={!link.trim()}>
                Add video
              </Button>
            </DialogFooter>
          </form>
        </TabsContent>

        <TabsContent value="upload">
          <div className="pt-2">
            {progress === null ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed bg-muted/40 py-10 text-xs text-muted-foreground hover:border-primary/50 hover:bg-secondary"
              >
                <Film className="size-6 text-primary" />
                <span className="font-medium text-foreground">Choose a video</span>
                <span>MP4 or WebM · up to {MAX_VIDEO_MB} MB</span>
              </button>
            ) : (
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{fileName}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">{Math.round(progress * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{progress >= 1 ? 'Processing…' : 'Uploading… keep this window open.'}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => abortRef.current?.abort()}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <input ref={inputRef} type="file" accept={ACCEPTED_VIDEOS} hidden onChange={(e) => (upload(e.target.files?.[0]), (e.target.value = ''))} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

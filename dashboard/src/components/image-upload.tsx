import { ImagePlus, Loader2, Star, X } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import { toast } from 'sonner'

import { errorMessage } from '@/lib/api'
import { ACCEPTED_IMAGES, uploadImages } from '@/lib/media'
import { cn } from '@/lib/utils'

function useUploader(onUploaded: (urls: string[]) => void) {
  const [uploading, setUploading] = useState(false)

  const upload = async (files: File[]) => {
    const images = files.filter((file) => ACCEPTED_IMAGES.split(',').includes(file.type))
    if (!images.length) {
      if (files.length) toast.error('Please choose JPG, PNG, WEBP or GIF images.')
      return
    }
    setUploading(true)
    try {
      const media = await uploadImages(images)
      onUploaded(media.map((m) => m.url))
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  return { uploading, upload }
}

function DropZone({
  multiple,
  uploading,
  onFiles,
  className,
  label,
}: {
  multiple?: boolean
  uploading: boolean
  onFiles: (files: File[]) => void
  className?: string
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    onFiles(Array.from(event.dataTransfer.files))
  }

  return (
    <button
      type="button"
      disabled={uploading}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/40 p-4 text-center text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary disabled:cursor-wait',
        dragging && 'border-primary bg-secondary',
        className,
      )}
    >
      {uploading ? <Loader2 className="size-5 animate-spin text-primary" /> : <ImagePlus className="size-5 text-primary" />}
      <span className="font-medium text-foreground">{uploading ? 'Uploading…' : label}</span>
      {!uploading && <span>JPG, PNG, WEBP or GIF · up to 5 MB</span>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGES}
        multiple={multiple}
        hidden
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
      />
    </button>
  )
}

export function SingleImageUpload({
  value,
  onChange,
  className,
  aspect = 'aspect-square',
  label = 'Upload image',
}: {
  value: string
  onChange: (url: string) => void
  className?: string
  /** Tailwind aspect-ratio class for the preview and drop zone. */
  aspect?: string
  label?: string
}) {
  const { uploading, upload } = useUploader((urls) => onChange(urls[0] ?? ''))

  if (value) {
    return (
      <div className={cn('group relative overflow-hidden rounded-lg border bg-muted', className)}>
        <img src={value} alt="" className={cn('w-full object-cover', aspect)} />
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          aria-label="Remove image"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <DropZone
      uploading={uploading}
      onFiles={(files) => upload(files.slice(0, 1))}
      label={label}
      className={cn('w-full', aspect, className)}
    />
  )
}

export type GalleryImage = { url: string; alt: string | null }

export function GalleryUpload({
  images,
  onChange,
  cover,
  onCoverChange,
}: {
  images: GalleryImage[]
  onChange: (images: GalleryImage[]) => void
  cover: string
  onCoverChange: (url: string) => void
}) {
  const { uploading, upload } = useUploader((urls) => {
    const next = [...images, ...urls.map((url) => ({ url, alt: null }))]
    onChange(next)
    if (!cover && next[0]) onCoverChange(next[0].url)
  })

  const remove = (url: string) => {
    const next = images.filter((image) => image.url !== url)
    onChange(next)
    if (cover === url) onCoverChange(next[0]?.url ?? '')
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      {images.map((image) => {
        const isCover = image.url === cover
        return (
          <div
            key={image.url}
            className={cn(
              'group relative overflow-hidden rounded-lg border bg-muted',
              isCover && 'ring-2 ring-primary ring-offset-2',
            )}
          >
            <img src={image.url} alt={image.alt ?? ''} className="aspect-square w-full object-cover" />
            {isCover ? (
              <span className="absolute bottom-1.5 left-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                Cover
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onCoverChange(image.url)}
                className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Star className="size-3" /> Set as cover
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(image.url)}
              className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
      <DropZone
        multiple
        uploading={uploading}
        onFiles={upload}
        label={images.length ? 'Add more' : 'Upload images'}
        className={cn('aspect-square', !images.length && 'col-span-3 aspect-auto py-10 sm:col-span-4 lg:col-span-5')}
      />
    </div>
  )
}

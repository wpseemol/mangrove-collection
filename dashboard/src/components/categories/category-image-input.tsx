import { ImagePlus, Loader2, X } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'

import { CATEGORY_IMAGE, CATEGORY_IMAGE_SIZE as SIZE_HINT, checkCategoryImage } from '@/lib/category-image'
import { cn } from '@/lib/utils'

export function CategoryImageInput({
  previewUrl,
  onSelect,
  onRemove,
  onInvalid,
  invalid,
}: {
  previewUrl: string | null
  onSelect: (file: File) => void
  onRemove: () => void
  onInvalid: (message: string) => void
  invalid?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [checking, setChecking] = useState(false)
  const [dragging, setDragging] = useState(false)

  const pick = async (file: File | undefined) => {
    if (!file) return
    setChecking(true)
    const error = await checkCategoryImage(file)
    setChecking(false)
    if (error) onInvalid(error)
    else onSelect(file)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    pick(event.dataTransfer.files[0])
  }

  if (previewUrl) {
    return (
      <div className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
        <img src={previewUrl} alt="" className="size-full object-cover" />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
          aria-label="Remove image"
        >
          <X className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-x-2 bottom-2 rounded-md bg-black/60 py-1 text-xs font-medium text-white transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
        >
          Replace image
        </button>
        <HiddenInput inputRef={inputRef} onFile={pick} />
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        disabled={checking}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        aria-describedby="category-image-requirements"
        className={cn(
          'flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/40 p-4 text-center text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary disabled:cursor-wait',
          dragging && 'border-primary bg-secondary',
          invalid && 'border-destructive',
        )}
      >
        {checking ? <Loader2 className="size-5 animate-spin text-primary" /> : <ImagePlus className="size-5 text-primary" />}
        <span className="font-medium text-foreground">{checking ? 'Checking image…' : 'Upload image'}</span>
        <span className="font-semibold text-foreground">{SIZE_HINT}</span>
      </button>
      <HiddenInput inputRef={inputRef} onFile={pick} />
    </>
  )
}

function HiddenInput({ inputRef, onFile }: { inputRef: React.RefObject<HTMLInputElement | null>; onFile: (file: File | undefined) => void }) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept={CATEGORY_IMAGE.types.join(',')}
      hidden
      onChange={(e) => {
        onFile(e.target.files?.[0])
        e.target.value = ''
      }}
    />
  )
}

export function CategoryImageRequirements() {
  return (
    <p id="category-image-requirements" className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{SIZE_HINT}</span> recommended (4:3 landscape). Minimum {SIZE_HINT}, maximum{' '}
      {CATEGORY_IMAGE.maxWidth} × {CATEGORY_IMAGE.maxHeight} px · JPG, PNG or WEBP · up to 2 MB.
    </p>
  )
}

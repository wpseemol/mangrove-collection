import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { FormField, Optional } from '@/components/form-field'
import { SingleImageUpload } from '@/components/image-upload'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ApiError, api, errorMessage } from '@/lib/api'
import { bannersQueryKey } from '@/lib/queries'
import type { Banner, BannerType } from '@/lib/types'
import { isSafeLink, isUnsafeText, LINK_MESSAGE, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'

const COPY: Record<BannerType, { noun: string; hint: string }> = {
  slide: { noun: 'slide', hint: 'Wide images work best: 1600 × 900 px (16:9) or larger.' },
  right_top: { noun: 'top side image', hint: 'Shown beside the hero. About 800 × 500 px works best.' },
  right_bottom: { noun: 'bottom side image', hint: 'Shown beside the hero. About 800 × 500 px works best.' },
}

type Draft = { image: string; title: string; subtitle: string; link_url: string; is_active: boolean }
type Errors = Partial<Record<keyof Draft, string>>

function validate(draft: Draft): Errors {
  const errors: Errors = {}
  if (!draft.image) errors.image = 'Upload an image.'
  for (const key of ['title', 'subtitle'] as const) {
    const value = draft[key].trim()
    if (value.length > 255) errors[key] = 'Keep this to 255 characters or fewer.'
    else if (isUnsafeText(value)) errors[key] = UNSAFE_TEXT_MESSAGE
  }
  const link = draft.link_url.trim()
  if (link && !isSafeLink(link)) errors.link_url = LINK_MESSAGE
  return errors
}

export function BannerDialog({
  open,
  onOpenChange,
  type,
  banner,
  nextSortOrder = 0,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: BannerType
  banner: Banner | null
  nextSortOrder?: number
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-xl">
        {open && (
          <BannerForm
            key={banner?.id ?? 'new'}
            type={type}
            banner={banner}
            nextSortOrder={nextSortOrder}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function BannerForm({ type, banner, nextSortOrder, onDone }: { type: BannerType; banner: Banner | null; nextSortOrder: number; onDone: () => void }) {
  const queryClient = useQueryClient()
  const copy = COPY[type]
  const [draft, setDraft] = useState<Draft>({
    image: banner?.image ?? '',
    title: banner?.title ?? '',
    subtitle: banner?.subtitle ?? '',
    link_url: banner?.link_url ?? '',
    is_active: banner?.is_active ?? true,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const fieldError = (key: keyof Draft) => errors[key] ?? apiError?.field(key)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const save = useMutation({
    mutationFn: () => {
      const link = draft.link_url.trim()
      const body = {
        type,
        image: draft.image,
        title: draft.title.trim() || null,
        subtitle: draft.subtitle.trim() || null,
        link_url: link || null,
        link_enabled: Boolean(link),
        is_active: draft.is_active,
        ...(banner ? {} : { sort_order: nextSortOrder }),
      }
      return api<{ data: Banner }>(banner ? `/admin/banners/${banner.id}` : '/admin/banners', { method: banner ? 'PUT' : 'POST', body })
    },
    onSuccess: () => {
      toast.success(banner ? 'Saved.' : `New ${copy.noun} added.`)
      queryClient.invalidateQueries({ queryKey: bannersQueryKey })
      onDone()
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 422) setApiError(e)
      else toast.error(errorMessage(e))
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setApiError(null)
    const found = validate(draft)
    setErrors(found)
    if (!Object.keys(found).length) save.mutate()
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <DialogHeader>
        <DialogTitle className="first-letter:uppercase">{banner ? `Edit ${copy.noun}` : `Add ${copy.noun}`}</DialogTitle>
        <DialogDescription>{copy.hint}</DialogDescription>
      </DialogHeader>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">Image</p>
        <SingleImageUpload value={draft.image} onChange={(url) => set('image', url)} aspect="aspect-video" label="Upload image" />
        {fieldError('image') && <p className="text-xs text-destructive">{fieldError('image')}</p>}
      </div>

      <FormField id="banner-title" label="Title" hint={<Optional />} error={fieldError('title')} description="Shown over the image. Leave empty for an image-only banner.">
        <Input id="banner-title" value={draft.title} onChange={(e) => set('title', e.target.value)} maxLength={255} aria-invalid={Boolean(fieldError('title'))} />
      </FormField>

      <FormField id="banner-subtitle" label="Subtitle" hint={<Optional />} error={fieldError('subtitle')}>
        <Input id="banner-subtitle" value={draft.subtitle} onChange={(e) => set('subtitle', e.target.value)} maxLength={255} aria-invalid={Boolean(fieldError('subtitle'))} />
      </FormField>

      <FormField id="banner-link" label="Link" hint={<Optional />} error={fieldError('link_url')} description="Where a click goes, e.g. /shop?category=honey or a full https:// link.">
        <Input
          id="banner-link"
          value={draft.link_url}
          onChange={(e) => set('link_url', e.target.value)}
          placeholder="/shop"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(fieldError('link_url'))}
        />
      </FormField>

      <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
        <span>
          <span className="block text-sm font-medium">Show on the store</span>
          <span className="block text-xs text-muted-foreground">Turn off to hide it without deleting.</span>
        </span>
        <Switch checked={draft.is_active} onCheckedChange={(value) => set('is_active', value)} />
      </label>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" />}
          {banner ? 'Save changes' : `Add ${copy.noun}`}
        </Button>
      </DialogFooter>
    </form>
  )
}

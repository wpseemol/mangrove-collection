import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, ImagePlus, Images, Link2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { api, errorMessage } from '@/lib/api'
import { bannersQueryKey } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import type { Banner, BannerType } from '@/lib/types'
import { cn } from '@/lib/utils'

import { BannerDialog } from './banner-dialog'

function useBannerActions() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: bannersQueryKey })

  const update = useMutation({
    mutationFn: (changes: { banner: Banner; body: Partial<Banner> }[]) =>
      Promise.all(changes.map(({ banner, body }) => api(`/admin/banners/${banner.id}`, { method: 'PUT', body }))),
    onSettled: refresh,
    onError: (error) => toast.error(errorMessage(error)),
  })

  const remove = useMutation({
    mutationFn: (banner: Banner) => api(`/admin/banners/${banner.id}`, { method: 'DELETE' }),
    onSuccess: () => toast.success('Image removed.'),
    onSettled: refresh,
    onError: (error) => toast.error(errorMessage(error)),
  })

  return { update, remove }
}

export function SlidesManager({ banners, loading }: { banners: Banner[]; loading: boolean }) {
  const slides = banners.filter((banner) => banner.type === 'slide').sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
  const { update, remove } = useBannerActions()
  const [dialog, setDialog] = useState<{ open: boolean; banner: Banner | null }>({ open: false, banner: null })
  const [toDelete, setToDelete] = useState<Banner | null>(null)

  const move = (index: number, offset: number) => {
    const order = [...slides]
    const [slide] = order.splice(index, 1)
    order.splice(index + offset, 0, slide)
    update.mutate(order.flatMap((banner, position) => (banner.sort_order === position ? [] : [{ banner, body: { sort_order: position } }])))
  }

  const nextSortOrder = slides.reduce((max, slide) => Math.max(max, slide.sort_order + 1), 0)

  return (
    <div className="grid gap-3">
      {loading ? (
        Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)
      ) : slides.length ? (
        <ol className="grid gap-2">
          {slides.map((slide, index) => (
            <li key={slide.id} className={cn('flex items-center gap-3 rounded-lg border p-2 pr-3', !slide.is_active && 'bg-muted/40')}>
              <img src={slide.image} alt="" className={cn('aspect-video w-28 shrink-0 rounded-md border object-cover sm:w-36', !slide.is_active && 'opacity-50')} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{slide.title || <span className="text-muted-foreground">Slide {index + 1} · no caption</span>}</p>
                {slide.subtitle && <p className="truncate text-xs text-muted-foreground">{slide.subtitle}</p>}
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', slide.is_active ? TONES.green : TONES.neutral)}>
                    {slide.is_active ? 'Visible' : 'Hidden'}
                  </Badge>
                  {slide.link_enabled && slide.link_url && (
                    <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
                      <Link2 className="size-3 shrink-0" /> {slide.link_url}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Switch
                  checked={slide.is_active}
                  onCheckedChange={(is_active) => update.mutate([{ banner: slide, body: { is_active } }])}
                  aria-label={slide.is_active ? 'Hide slide' : 'Show slide'}
                  className="mr-1"
                />
                <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0 || update.isPending} onClick={() => move(index, -1)} aria-label="Move up">
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === slides.length - 1 || update.isPending}
                  onClick={() => move(index, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => setDialog({ open: true, banner: slide })} aria-label="Edit slide">
                  <Pencil />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => setToDelete(slide)} aria-label="Delete slide">
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <button
          type="button"
          onClick={() => setDialog({ open: true, banner: null })}
          className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-muted/40 px-4 py-10 text-center transition-colors hover:border-primary/50 hover:bg-secondary"
        >
          <Images className="size-6 text-primary" />
          <span className="text-sm font-medium">No slides yet</span>
          <span className="text-xs text-muted-foreground">Add your first slide. Until then the store shows the headline instead.</span>
        </button>
      )}

      {slides.length > 0 && (
        <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => setDialog({ open: true, banner: null })}>
          <Plus /> Add slide
        </Button>
      )}

      <BannerDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        type="slide"
        banner={dialog.banner}
        nextSortOrder={nextSortOrder}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this slide?"
        description="The slide is removed from the store straight away. The uploaded image stays in your media."
        confirmLabel="Delete slide"
        pending={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete, { onSettled: () => setToDelete(null) })}
      />
    </div>
  )
}

/** The optional image banner for one side card; when there is none, the text card is shown. */
export function SideImageSlot({ type, banner, loading }: { type: Exclude<BannerType, 'slide'>; banner: Banner | undefined; loading: boolean }) {
  const { remove } = useBannerActions()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">Image</p>
      {loading ? (
        <Skeleton className="aspect-16/10 rounded-lg" />
      ) : banner ? (
        <div className="overflow-hidden rounded-lg border">
          <img src={banner.image} alt="" className={cn('aspect-16/10 w-full object-cover', !banner.is_active && 'opacity-50')} />
          <div className="flex items-center justify-between gap-2 border-t p-2">
            <span className="truncate text-xs text-muted-foreground">{banner.is_active ? 'Shown instead of the text card' : 'Hidden · text card shown'}</span>
            <div className="flex shrink-0 gap-0.5">
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setOpen(true)} aria-label="Edit image">
                <Pencil />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setConfirming(true)} aria-label="Remove image">
                <Trash2 />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex aspect-16/10 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/40 p-4 text-center text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
        >
          <ImagePlus className="size-5 text-primary" />
          <span className="font-medium text-foreground">Add image</span>
          <span>Optional. Replaces the text card.</span>
        </button>
      )}

      <BannerDialog open={open} onOpenChange={setOpen} type={type} banner={banner ?? null} />
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Remove this image?"
        description="The text card is shown in its place."
        confirmLabel="Remove image"
        pending={remove.isPending}
        onConfirm={() => banner && remove.mutate(banner, { onSettled: () => setConfirming(false) })}
      />
    </div>
  )
}

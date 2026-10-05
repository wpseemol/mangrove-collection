import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Shapes } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { IconGlyph } from '@/components/categories/icon-glyph'
import { IconPicker } from '@/components/categories/icon-picker'
import { FormField, Optional } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, api, errorMessage } from '@/lib/api'
import { normalizeSlug, tidySlug } from '@/lib/blog'
import { slugify } from '@/lib/format'
import { blogCategoriesQueryKey, useCategoryIcons } from '@/lib/queries'
import type { BlogCategory } from '@/lib/types'
import { isUnsafeText, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'

const LIMITS = { name: 100, slug: 120, description: 1000 } as const

type Draft = { name: string; slug: string; icon: string; description: string; is_active: boolean; sort_order: string }
type Errors = Partial<Record<keyof Draft, string>>

export function BlogCategoryDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: BlogCategory | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-xl">
        {open && <CategoryForm key={category?.id ?? 'new'} category={category} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function CategoryForm({ category, onDone }: { category: BlogCategory | null; onDone: () => void }) {
  const queryClient = useQueryClient()
  const { data: icons } = useCategoryIcons()
  const [draft, setDraft] = useState<Draft>({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    icon: category?.icon ?? '',
    description: category?.description ?? '',
    is_active: category?.is_active ?? true,
    sort_order: String(category?.sort_order ?? 0),
  })
  const [slugLinked, setSlugLinked] = useState(!category)
  const [pickerOpen, setPickerOpen] = useState(!category)
  const [errors, setErrors] = useState<Errors>({})

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const selected = icons?.find((icon) => icon.name === draft.icon)
  const nodes = selected?.nodes ?? (draft.icon === category?.icon ? category?.icon_nodes : null)

  const save = useMutation({
    mutationFn: () =>
      api<{ data: BlogCategory }>(category ? `/admin/blog/categories/${category.id}` : '/admin/blog/categories', {
        method: category ? 'PUT' : 'POST',
        body: {
          name: draft.name.trim(),
          slug: tidySlug(draft.slug) || null,
          icon: draft.icon || null,
          description: draft.description.trim() || null,
          is_active: draft.is_active,
          sort_order: Number(draft.sort_order),
        },
      }).then((r) => r.data),
    onSuccess: (saved) => {
      toast.success(category ? 'Category updated.' : `Category "${saved.name}" created.`)
      queryClient.invalidateQueries({ queryKey: blogCategoriesQueryKey })
      onDone()
    },
    onError: (e) => {
      if (e instanceof ApiError && Object.keys(e.errors).length) setErrors(Object.fromEntries(Object.entries(e.errors).map(([k, v]) => [k, v[0]])))
      toast.error(errorMessage(e))
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const next: Errors = {}
    const name = draft.name.trim()
    if (name.length < 2) next.name = 'Enter a name of at least 2 characters.'
    else if (isUnsafeText(name)) next.name = UNSAFE_TEXT_MESSAGE
    if (isUnsafeText(draft.description)) next.description = UNSAFE_TEXT_MESSAGE
    if (!/^\d{1,4}$/.test(draft.sort_order.trim())) next.sort_order = 'Enter a whole number from 0 to 9999.'
    setErrors(next)
    if (!Object.keys(next).length) save.mutate()
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{category ? 'Edit blog category' : 'New blog category'}</DialogTitle>
        <DialogDescription>Categories group posts on the blog page. Pick an icon so readers can spot topics quickly.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="bc-name" label="Name" error={errors.name}>
          <Input
            id="bc-name"
            value={draft.name}
            onChange={(e) => {
              const name = e.target.value
              setDraft((d) => ({ ...d, name, slug: slugLinked ? slugify(name) : d.slug }))
              setErrors((er) => ({ ...er, name: undefined }))
            }}
            placeholder="e.g. Recipes"
            maxLength={LIMITS.name}
            autoFocus
          />
        </FormField>
        <FormField id="bc-slug" label="URL slug" hint={<Optional />} error={errors.slug} description={draft.slug ? `/blog?category=${tidySlug(draft.slug)}` : 'Made from the name if empty.'}>
          <Input
            id="bc-slug"
            value={draft.slug}
            onChange={(e) => {
              setSlugLinked(false)
              set('slug', normalizeSlug(e.target.value))
            }}
            maxLength={LIMITS.slug}
            spellCheck={false}
          />
        </FormField>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Icon</p>
          <Optional />
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-2.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            {nodes ? <IconGlyph nodes={nodes} className="size-6" /> : <Shapes className="size-5 text-muted-foreground" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selected?.label ?? (draft.icon || 'No icon selected')}</p>
            <p className="truncate text-xs text-muted-foreground">{selected ? selected.group : 'Shown on the blog filter chips and post cards.'}</p>
          </div>
          {draft.icon && (
            <Button type="button" variant="ghost" size="sm" onClick={() => set('icon', '')}>
              Remove
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen((o) => !o)} aria-expanded={pickerOpen}>
            {pickerOpen ? 'Close' : draft.icon ? 'Change' : 'Choose icon'}
          </Button>
        </div>
        {pickerOpen && (
          <IconPicker
            value={draft.icon}
            categoryName={draft.name}
            onChange={(name) => {
              set('icon', name)
              setPickerOpen(false)
            }}
          />
        )}
        {errors.icon && <p className="text-xs text-destructive">{errors.icon}</p>}
      </div>

      <FormField id="bc-description" label="Description" hint={<Optional />} error={errors.description} description="Plain text, shown at the top of the category on the blog.">
        <Textarea id="bc-description" value={draft.description} onChange={(e) => set('description', e.target.value)} maxLength={LIMITS.description} rows={3} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
        <FormField id="bc-sort" label="Sort order" error={errors.sort_order}>
          <Input id="bc-sort" type="number" min={0} max={9999} value={draft.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
        </FormField>
        <label className="flex items-center justify-between gap-3 rounded-lg border p-3 sm:mt-6">
          <span>
            <span className="block text-sm font-medium">Visible on the blog</span>
            <span className="block text-xs text-muted-foreground">Posts in hidden categories are hidden too.</span>
          </span>
          <Switch checked={draft.is_active} onCheckedChange={(v) => set('is_active', v)} />
        </label>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" />}
          {category ? 'Save changes' : 'Create category'}
        </Button>
      </DialogFooter>
    </form>
  )
}

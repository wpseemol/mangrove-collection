import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Shapes } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { CategoryImageInput, CategoryImageRequirements } from '@/components/categories/category-image-input'
import { IconGlyph } from '@/components/categories/icon-glyph'
import { IconPicker } from '@/components/categories/icon-picker'
import { FormField, Optional } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, api, errorMessage } from '@/lib/api'
import { CATEGORY_IMAGE_SIZE } from '@/lib/category-image'
import { categoriesQueryKey, useCategoryIcons } from '@/lib/queries'
import type { Category } from '@/lib/types'
import { isUnsafeText, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'

const LIMITS = { name: 100, slug: 120, description: 1000, sortOrder: 9999 } as const

type Draft = {
  name: string
  slug: string
  description: string
  icon: string
  is_active: boolean
  sort_order: string
}

type Errors = Partial<Record<keyof Draft | 'image', string>>

const toDraft = (category?: Category | null): Draft => ({
  name: category?.name ?? '',
  slug: category?.slug ?? '',
  description: category?.description ?? '',
  icon: category?.icon ?? '',
  is_active: category?.is_active ?? true,
  sort_order: String(category?.sort_order ?? 0),
})

function validate(draft: Draft): Errors {
  const errors: Errors = {}
  const name = draft.name.trim()
  const slug = draft.slug.trim()
  const description = draft.description.trim()

  if (!name) errors.name = 'Enter a category name.'
  else if (name.length < 2) errors.name = 'The name must be at least 2 characters.'
  else if (name.length > LIMITS.name) errors.name = `The name must be ${LIMITS.name} characters or fewer.`
  else if (isUnsafeText(name)) errors.name = UNSAFE_TEXT_MESSAGE

  if (slug.length > LIMITS.slug) errors.slug = `The slug must be ${LIMITS.slug} characters or fewer.`
  else if (slug && !/^[A-Za-z0-9_-]+$/.test(slug)) errors.slug = 'Use only letters, numbers, dashes and underscores.'

  if (description.length > LIMITS.description) errors.description = `The description must be ${LIMITS.description} characters or fewer.`
  else if (isUnsafeText(description)) errors.description = UNSAFE_TEXT_MESSAGE

  if (!/^\d+$/.test(draft.sort_order.trim()) || Number(draft.sort_order) > LIMITS.sortOrder) {
    errors.sort_order = `Enter a whole number from 0 to ${LIMITS.sortOrder}.`
  }

  return errors
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSaved?: (category: Category) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        {open && (
          <CategoryForm
            key={category?.id ?? 'new'}
            category={category}
            onDone={(saved) => {
              onOpenChange(false)
              onSaved?.(saved)
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function CategoryForm({
  category,
  onDone,
  onCancel,
}: {
  category?: Category | null
  onDone: (category: Category) => void
  onCancel: () => void
}) {
  const queryClient = useQueryClient()
  const { data: icons } = useCategoryIcons()
  const [draft, setDraft] = useState<Draft>(() => toDraft(category))
  const [image, setImage] = useState<{ file: File | null; url: string | null }>({ file: null, url: category?.image ?? null })
  const [pickerOpen, setPickerOpen] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [apiError, setApiError] = useState<ApiError | null>(null)

  useEffect(() => () => {
    if (image.file && image.url) URL.revokeObjectURL(image.url)
  }, [image])

  const clearError = (key: keyof Errors) =>
    setErrors((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    clearError(key)
  }
  const fieldError = (key: keyof Errors) => errors[key] ?? apiError?.field(key)

  const selectedIcon = icons?.find((icon) => icon.name === draft.icon)
  const selectedNodes = selectedIcon?.nodes ?? (draft.icon && draft.icon === category?.icon ? category.icon_nodes : null)

  const save = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.append('name', draft.name.trim())
      form.append('slug', draft.slug.trim())
      form.append('description', draft.description.trim())
      form.append('icon', draft.icon)
      form.append('is_active', draft.is_active ? '1' : '0')
      form.append('sort_order', String(Number(draft.sort_order)))
      if (image.file) form.append('image', image.file)
      else if (category?.image && !image.url) form.append('remove_image', '1')
      // Multipart bodies can't be sent with PUT, so updates use Laravel's method override.
      if (category) form.append('_method', 'PUT')

      return api<{ data: Category }>(category ? `/admin/categories/${category.id}` : '/admin/categories', {
        method: 'POST',
        body: form,
      }).then((r) => r.data)
    },
    onSuccess: (saved) => {
      toast.success(category ? 'Category updated.' : `Category "${saved.name}" created.`)
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
      onDone(saved)
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
    if (Object.keys(found).length) return
    save.mutate()
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <DialogHeader>
        <DialogTitle>{category ? 'Edit category' : 'New category'}</DialogTitle>
        <DialogDescription>Categories group products in the store's menu and filters. Give each one an icon, an image, or both.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-5 sm:grid-cols-[1fr_15rem]">
        <div className="grid content-start gap-4">
          <FormField
            id="category-name"
            label="Name"
            error={fieldError('name')}
            hint={<span className="text-xs text-muted-foreground tabular-nums">{draft.name.trim().length}/{LIMITS.name}</span>}
          >
            <Input
              id="category-name"
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Honey"
              maxLength={LIMITS.name}
              aria-invalid={Boolean(fieldError('name'))}
              required
              autoFocus
            />
          </FormField>
          <FormField
            id="category-slug"
            label="URL slug"
            hint={<Optional />}
            error={fieldError('slug')}
            description="Leave empty to generate it from the name."
          >
            <Input
              id="category-slug"
              value={draft.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="honey"
              maxLength={LIMITS.slug}
              aria-invalid={Boolean(fieldError('slug'))}
            />
          </FormField>
          <FormField
            id="category-sort"
            label="Sort order"
            error={fieldError('sort_order')}
            description="Lower numbers appear first."
          >
            <Input
              id="category-sort"
              type="number"
              inputMode="numeric"
              min={0}
              max={LIMITS.sortOrder}
              step={1}
              value={draft.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
              aria-invalid={Boolean(fieldError('sort_order'))}
            />
          </FormField>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              Image <span className="font-normal text-muted-foreground">· {CATEGORY_IMAGE_SIZE}</span>
            </p>
            <Optional />
          </div>
          <CategoryImageInput
            previewUrl={image.url}
            invalid={Boolean(fieldError('image'))}
            onSelect={(file) => {
              setImage({ file, url: URL.createObjectURL(file) })
              clearError('image')
            }}
            onRemove={() => setImage({ file: null, url: null })}
            onInvalid={(message) => setErrors((e) => ({ ...e, image: message }))}
          />
          {fieldError('image') ? <p className="text-xs text-destructive">{fieldError('image')}</p> : <CategoryImageRequirements />}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">Icon</p>
          <Optional />
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-2.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            {selectedNodes ? <IconGlyph nodes={selectedNodes} className="size-6" /> : <Shapes className="size-5 text-muted-foreground" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selectedIcon?.label ?? (draft.icon || 'No icon selected')}</p>
            <p className="truncate text-xs text-muted-foreground">
              {selectedIcon ? selectedIcon.group : 'Shown in menus, and on the category card when there is no image.'}
            </p>
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
        {fieldError('icon') && <p className="text-xs text-destructive">{fieldError('icon')}</p>}
      </div>

      <FormField
        id="category-description"
        label="Description"
        hint={<span className="text-xs text-muted-foreground tabular-nums">{draft.description.trim().length}/{LIMITS.description}</span>}
        error={fieldError('description')}
        description="Plain text only. HTML and code are not allowed."
      >
        <Textarea
          id="category-description"
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          maxLength={LIMITS.description}
          aria-invalid={Boolean(fieldError('description'))}
          rows={3}
        />
      </FormField>

      <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
        <span>
          <span className="block text-sm font-medium">Visible in store</span>
          <span className="block text-xs text-muted-foreground">Hidden categories stay in the dashboard.</span>
        </span>
        <Switch checked={draft.is_active} onCheckedChange={(v) => set('is_active', v)} />
      </label>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" />}
          {category ? 'Save changes' : 'Create category'}
        </Button>
      </DialogFooter>
    </form>
  )
}

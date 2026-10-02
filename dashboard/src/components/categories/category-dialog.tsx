import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { FormField, Optional } from '@/components/form-field'
import { SingleImageUpload } from '@/components/image-upload'
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
import { categoriesQueryKey } from '@/lib/queries'
import type { Category } from '@/lib/types'

type Draft = {
  name: string
  slug: string
  description: string
  image: string
  is_active: boolean
  sort_order: string
}

const toDraft = (category?: Category | null): Draft => ({
  name: category?.name ?? '',
  slug: category?.slug ?? '',
  description: category?.description ?? '',
  image: category?.image ?? '',
  is_active: category?.is_active ?? true,
  sort_order: String(category?.sort_order ?? 0),
})

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
      <DialogContent className="sm:max-w-lg">
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
  const [draft, setDraft] = useState<Draft>(() => toDraft(category))
  const [error, setError] = useState<ApiError | null>(null)
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const save = useMutation({
    mutationFn: () =>
      api<{ data: Category }>(category ? `/admin/categories/${category.id}` : '/admin/categories', {
        method: category ? 'PUT' : 'POST',
        body: {
          name: draft.name.trim(),
          slug: draft.slug.trim() || null,
          description: draft.description.trim() || null,
          image: draft.image || null,
          is_active: draft.is_active,
          sort_order: Number(draft.sort_order) || 0,
        },
      }).then((r) => r.data),
    onSuccess: (saved) => {
      toast.success(category ? 'Category updated.' : `Category "${saved.name}" created.`)
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
      onDone(saved)
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 422) setError(e)
      else toast.error(errorMessage(e))
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    save.mutate()
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <DialogHeader>
        <DialogTitle>{category ? 'Edit category' : 'New category'}</DialogTitle>
        <DialogDescription>Categories group products in the store's menu and filters.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-[7rem_1fr]">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Image</p>
          <SingleImageUpload value={draft.image} onChange={(url) => set('image', url)} />
        </div>
        <div className="grid content-start gap-4">
          <FormField id="category-name" label="Name" error={error?.field('name')}>
            <Input
              id="category-name"
              value={draft.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Honey"
              required
              autoFocus
            />
          </FormField>
          <FormField
            id="category-slug"
            label="URL slug"
            hint={<Optional />}
            error={error?.field('slug')}
            description="Leave empty to generate it from the name."
          >
            <Input
              id="category-slug"
              value={draft.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="honey"
            />
          </FormField>
        </div>
      </div>

      <FormField id="category-description" label="Description" hint={<Optional />} error={error?.field('description')}>
        <Textarea
          id="category-description"
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="category-sort"
          label="Sort order"
          error={error?.field('sort_order')}
          description="Lower numbers appear first."
        >
          <Input
            id="category-sort"
            type="number"
            min={0}
            value={draft.sort_order}
            onChange={(e) => set('sort_order', e.target.value)}
          />
        </FormField>
        <label className="flex items-center justify-between gap-3 self-start rounded-lg border p-3 sm:mt-6">
          <span>
            <span className="block text-sm font-medium">Visible in store</span>
            <span className="block text-xs text-muted-foreground">Hidden categories stay in the dashboard.</span>
          </span>
          <Switch checked={draft.is_active} onCheckedChange={(v) => set('is_active', v)} />
        </label>
      </div>

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

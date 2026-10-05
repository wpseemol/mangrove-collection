import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FolderPlus, Pencil, Shapes, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { BlogCategoryDialog } from '@/components/blog/blog-category-dialog'
import { IconGlyph } from '@/components/categories/icon-glyph'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api, errorMessage } from '@/lib/api'
import { blogCategoriesQueryKey, blogPostsQueryKey, useBlogCategories } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import type { BlogCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

export function BlogCategoriesPage() {
  const queryClient = useQueryClient()
  const { data: categories, isPending } = useBlogCategories()
  const [editing, setEditing] = useState<BlogCategory | 'new' | null>(null)
  const [deleting, setDeleting] = useState<BlogCategory | null>(null)

  const remove = useMutation({
    mutationFn: (category: BlogCategory) => api<void>(`/admin/blog/categories/${category.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Category deleted.')
      setDeleting(null)
      queryClient.invalidateQueries({ queryKey: blogCategoriesQueryKey })
      queryClient.invalidateQueries({ queryKey: blogPostsQueryKey })
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <>
      <PageHeader
        title="Blog categories"
        description="Topics that group your posts. Each one can have its own icon."
        actions={
          <Button onClick={() => setEditing('new')}>
            <FolderPlus /> New category
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <ul className="divide-y">
          {isPending ? (
            Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="p-4">
                <Skeleton className="h-11 w-full" />
              </li>
            ))
          ) : categories?.length ? (
            categories.map((category) => (
              <li key={category.id} className={cn('flex items-center gap-4 p-4', !category.is_active && 'bg-muted/30')}>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  {category.icon_nodes ? <IconGlyph nodes={category.icon_nodes} className="size-5" /> : <Shapes className="size-5 text-muted-foreground" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {category.name}
                    {!category.is_active && (
                      <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', TONES.neutral)}>
                        Hidden
                      </Badge>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    /{category.slug}
                    {category.description && ` · ${category.description}`}
                  </p>
                </div>
                <Link to={`/blog?category_id=${category.id}`} className="hidden shrink-0 text-sm text-muted-foreground tabular-nums hover:text-primary sm:block">
                  {category.posts_count ?? 0} post{category.posts_count === 1 ? '' : 's'}
                </Link>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditing(category)} aria-label={`Edit ${category.name}`}>
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleting(category)}
                    aria-label={`Delete ${category.name}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))
          ) : (
            <li className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <Shapes className="size-5" />
              </span>
              <div>
                <p className="font-medium">No blog categories yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Create topics like Recipes, Health or Sundarbans stories.</p>
              </div>
              <Button size="sm" onClick={() => setEditing('new')}>
                <FolderPlus /> New category
              </Button>
            </li>
          )}
        </ul>
      </Card>

      <BlogCategoryDialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} category={editing === 'new' ? null : editing} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.name}"?`}
        description={
          deleting?.posts_count
            ? `Its ${deleting.posts_count} post${deleting.posts_count === 1 ? ' is' : 's are'} kept, just without a category. You can move them to another category later.`
            : 'This category has no posts and will be removed permanently.'
        }
        confirmLabel="Delete category"
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </>
  )
}

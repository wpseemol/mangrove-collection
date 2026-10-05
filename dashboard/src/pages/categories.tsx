import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FolderTree, ImageOff, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { CategoryDialog } from '@/components/categories/category-dialog'
import { IconGlyph } from '@/components/categories/icon-glyph'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api, errorMessage } from '@/lib/api'
import { categoriesQueryKey, useCategories } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const { data: categories, isPending } = useCategories()
  const [editing, setEditing] = useState<Category | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Category | null>(null)

  const openDialog = (category: Category | null) => {
    setEditing(category)
    setDialogOpen(true)
  }

  const deleteCategory = useMutation({
    mutationFn: (category: Category) => api(`/admin/categories/${category.id}`, { method: 'DELETE' }),
    onSuccess: (_, category) => {
      toast.success(`Category "${category.name}" deleted.`)
      setToDelete(null)
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
    },
    onError: (error) => {
      toast.error(errorMessage(error))
      setToDelete(null)
    },
  })

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group products so customers can browse the store easily."
        actions={
          <Button onClick={() => openDialog(null)}>
            <Plus /> New category
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Category</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="hidden md:table-cell">Sort order</TableHead>
              <TableHead className="w-12 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 4 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-md" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : categories?.length ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <img src={category.image} alt="" className="size-10 shrink-0 rounded-md border object-cover" />
                      ) : category.icon_nodes ? (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-secondary text-primary">
                          <IconGlyph nodes={category.icon_nodes} className="size-5" />
                        </span>
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                          <ImageOff className="size-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => openDialog(category)}
                          className="truncate font-medium hover:text-primary hover:underline"
                        >
                          {category.name}
                        </button>
                        <p className="truncate text-xs text-muted-foreground">/{category.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/products?category=${category.id}`}
                      className="tabular-nums hover:text-primary hover:underline"
                    >
                      {category.products_count ?? 0} products
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('border-0 ring-1 ring-inset', category.is_active ? TONES.green : TONES.neutral)}
                    >
                      {category.is_active ? 'Visible' : 'Hidden'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">
                    {category.sort_order}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${category.name}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onSelect={() => openDialog(category)}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(category)}>
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                      <FolderTree className="size-5" />
                    </span>
                    <div>
                      <p className="font-medium">No categories yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Every product belongs to a category, so start by creating one.
                      </p>
                    </div>
                    <Button size="sm" onClick={() => openDialog(null)}>
                      <Plus /> New category
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editing} />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this category?"
        description={
          toDelete?.products_count ? (
            <>
              <span className="font-medium text-foreground">{toDelete.name}</span> still has {toDelete.products_count}{' '}
              products. Move them to another category first, or deleting will be refused.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">{toDelete?.name}</span> will be permanently deleted.
            </>
          )
        }
        confirmLabel="Delete category"
        pending={deleteCategory.isPending}
        onConfirm={() => toDelete && deleteCategory.mutate(toDelete)}
      />
    </>
  )
}

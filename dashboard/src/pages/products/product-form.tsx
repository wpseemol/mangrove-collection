import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, ExternalLink, Loader2, Plus, Save } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { CategoryDialog } from '@/components/categories/category-dialog'
import { FormField, Optional } from '@/components/form-field'
import { GalleryUpload, type GalleryImage } from '@/components/image-upload'
import { PageHeader } from '@/components/layout/page-header'
import { TagInput } from '@/components/products/tag-input'
import { emptyVariant, type VariantDraft } from '@/components/products/variant-draft'
import { VariantsEditor } from '@/components/products/variants-editor'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, api, errorMessage } from '@/lib/api'
import { STOREFRONT_URL } from '@/lib/config'
import { slugify } from '@/lib/format'
import { useCategories } from '@/lib/queries'
import type { Product, ProductStatus } from '@/lib/types'

type Draft = {
  name: string
  slug: string
  category_id: string
  unit: string
  size: string
  short_description: string
  description: string
  thumbnail: string
  images: GalleryImage[]
  tags: string[]
  status: ProductStatus
  is_featured: boolean
  meta_title: string
  meta_description: string
  hasVariants: boolean
  optionName: string
  variants: VariantDraft[]
}

const newDraft = (): Draft => ({
  name: '',
  slug: '',
  category_id: '',
  unit: '',
  size: '',
  short_description: '',
  description: '',
  thumbnail: '',
  images: [],
  tags: [],
  status: 'published',
  is_featured: false,
  meta_title: '',
  meta_description: '',
  hasVariants: false,
  optionName: '',
  variants: [emptyVariant({ title: 'Default', is_default: true })],
})

const toDraft = (product: Product): Draft => {
  const variants = product.variants.map((variant) =>
    emptyVariant({
      id: variant.id,
      title: variant.title,
      sku: variant.sku ?? '',
      price: String(variant.price),
      compare_price: variant.compare_price === null ? '' : String(variant.compare_price),
      stock: variant.stock === null ? '' : String(variant.stock),
      is_default: variant.is_default,
    }),
  )
  const first = product.variants[0]

  return {
    name: product.name,
    slug: product.slug,
    category_id: product.category ? String(product.category.id) : '',
    unit: product.unit ?? '',
    size: product.size ?? '',
    short_description: product.short_description ?? '',
    description: product.description ?? '',
    thumbnail: product.thumbnail ?? '',
    images: product.images.map(({ url, alt }) => ({ url, alt })),
    tags: product.tags ?? [],
    status: product.status,
    is_featured: product.is_featured,
    meta_title: product.meta_title ?? '',
    meta_description: product.meta_description ?? '',
    hasVariants: product.variants.length > 1 || Boolean(first?.type) || (!!first && first.title !== 'Default'),
    optionName: first?.type ?? '',
    variants: variants.length ? variants : newDraft().variants,
  }
}

const orNull = (value: string) => (value.trim() === '' ? null : value.trim())
const numberOrNull = (value: string) => (value.trim() === '' ? null : Number(value))

function toPayload(draft: Draft) {
  return {
    category_id: draft.category_id ? Number(draft.category_id) : null,
    name: draft.name.trim(),
    slug: orNull(draft.slug),
    unit: orNull(draft.unit),
    size: orNull(draft.size),
    short_description: orNull(draft.short_description),
    description: orNull(draft.description),
    thumbnail: draft.thumbnail || draft.images[0]?.url || null,
    images: draft.images,
    tags: draft.tags,
    status: draft.status,
    is_featured: draft.is_featured,
    meta_title: orNull(draft.meta_title),
    meta_description: orNull(draft.meta_description),
    variants: draft.variants.map((variant) => ({
      id: variant.id,
      title: draft.hasVariants ? variant.title.trim() : variant.title.trim() || 'Default',
      type: draft.hasVariants ? orNull(draft.optionName) : null,
      sku: orNull(variant.sku),
      price: numberOrNull(variant.price),
      compare_price: numberOrNull(variant.compare_price),
      stock: numberOrNull(variant.stock),
      is_default: variant.is_default,
    })),
  }
}

export function ProductCreatePage() {
  return <ProductForm initial={newDraft()} />
}

export function ProductEditPage() {
  const { id } = useParams()
  const { data: product, isPending, error } = useQuery({
    queryKey: ['admin', 'products', Number(id)],
    queryFn: () => api<{ data: Product }>(`/admin/products/${id}`).then((r) => r.data),
  })

  if (isPending) return <FormSkeleton />

  if (error || !product) {
    return (
      <Alert variant="destructive" className="max-w-xl">
        <AlertCircle />
        <AlertTitle>Couldn't load this product</AlertTitle>
        <AlertDescription>
          {errorMessage(error)}{' '}
          <Link to="/products" className="underline">
            Back to products
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  return <ProductForm key={product.id} product={product} initial={toDraft(product)} />
}

function ProductForm({ product, initial }: { product?: Product; initial: Draft }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: categories, isPending: categoriesLoading } = useCategories()
  const [draft, setDraft] = useState<Draft>(initial)
  const [error, setError] = useState<ApiError | null>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [slugTouched, setSlugTouched] = useState(Boolean(product))

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const toggleVariants = (on: boolean) =>
    setDraft((d) => {
      if (on) {
        const [first] = d.variants
        const firstRow = { ...first, title: first.title === 'Default' ? '' : first.title, is_default: true }
        return { ...d, hasVariants: true, variants: [firstRow, emptyVariant()] }
      }
      const [only] = d.variants
      return { ...d, hasVariants: false, variants: [{ ...only, title: only.title || 'Default', is_default: true }] }
    })

  const save = useMutation({
    mutationFn: () =>
      api<{ data: Product }>(product ? `/admin/products/${product.id}` : '/admin/products', {
        method: product ? 'PUT' : 'POST',
        body: toPayload(draft),
      }).then((r) => r.data),
    onSuccess: (saved) => {
      queryClient.setQueryData(['admin', 'products', saved.id], saved)
      queryClient.invalidateQueries({ queryKey: ['admin'], predicate: (q) => q.queryKey[2] !== saved.id })
      if (product) {
        setDraft(toDraft(saved))
        setSlugTouched(true)
        toast.success('Product saved.')
      } else {
        toast.success(`"${saved.name}" has been added.`)
        navigate('/products')
      }
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 422) {
        setError(e)
        toast.error('Please fix the highlighted fields.')
      } else {
        toast.error(errorMessage(e))
      }
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!draft.category_id) {
      setError(new ApiError('Choose a category.', 422, { category_id: ['Choose a category for this product.'] }))
      toast.error('Please choose a category.')
      return
    }
    save.mutate()
  }

  const saveButton = (
    <Button type="submit" form="product-form" disabled={save.isPending}>
      {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
      {product ? 'Save changes' : 'Save product'}
    </Button>
  )

  return (
    <>
      <PageHeader
        title={product ? product.name : 'Add product'}
        description={product ? 'Update details, pricing, variants and images.' : 'Fill in the details to list a new product.'}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/products">
                <ArrowLeft /> Back
              </Link>
            </Button>
            {product?.status === 'published' && (
              <Button variant="outline" asChild>
                <a
                  href={`${STOREFRONT_URL}/product?slug=${encodeURIComponent(product.slug)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink /> View
                </a>
              </Button>
            )}
            {saveButton}
          </>
        }
      />

      <form id="product-form" onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Section title="Basic information" description="What customers see first.">
            <FormField id="name" label="Product name" error={error?.field('name')}>
              <Input
                id="name"
                value={draft.name}
                onChange={(e) => {
                  const name = e.target.value
                  setDraft((d) => ({ ...d, name, slug: slugTouched ? d.slug : slugify(name) }))
                }}
                placeholder="e.g. Sundarban Raw Honey"
                required
              />
            </FormField>
            <FormField
              id="slug"
              label="URL slug"
              hint={<Optional />}
              error={error?.field('slug')}
              description="Used in the product link. Leave empty to generate it from the name."
            >
              <Input
                id="slug"
                value={draft.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  set('slug', e.target.value)
                }}
                placeholder="sundarban-raw-honey"
              />
            </FormField>
            <FormField
              id="short_description"
              label="Short description"
              hint={<span className="text-xs text-muted-foreground">{draft.short_description.length}/500</span>}
              error={error?.field('short_description')}
              description="A one or two sentence summary shown near the price."
            >
              <Textarea
                id="short_description"
                value={draft.short_description}
                onChange={(e) => set('short_description', e.target.value)}
                maxLength={500}
                rows={2}
              />
            </FormField>
            <FormField
              id="description"
              label="Full description"
              hint={<Optional />}
              error={error?.field('description')}
              description="Shown in the product details section. Basic HTML like <p>, <strong> and <ul> is supported."
            >
              <Textarea
                id="description"
                value={draft.description}
                onChange={(e) => set('description', e.target.value)}
                rows={8}
              />
            </FormField>
          </Section>

          <Section title="Images" description="The cover image is used on product cards. Drag files in or click to upload.">
            <GalleryUpload
              images={draft.images}
              onChange={(images) => set('images', images)}
              cover={draft.thumbnail}
              onCoverChange={(url) => set('thumbnail', url)}
            />
            {(error?.field('thumbnail') || error?.field('images')) && (
              <p className="text-xs text-destructive">{error?.field('thumbnail') ?? error?.field('images')}</p>
            )}
          </Section>

          <Section title="Pricing & variants" description="Set the price and stock, or add variants with their own prices.">
            <VariantsEditor
              hasVariants={draft.hasVariants}
              onHasVariantsChange={toggleVariants}
              optionName={draft.optionName}
              onOptionNameChange={(value) => set('optionName', value)}
              variants={draft.variants}
              onChange={(variants) => set('variants', variants)}
              error={error}
            />
          </Section>

          <Section title="Search engine listing" description="Customise how this product appears in Google results.">
            <FormField
              id="meta_title"
              label="Page title"
              hint={<Optional />}
              error={error?.field('meta_title')}
              description="Defaults to the product name."
            >
              <Input
                id="meta_title"
                value={draft.meta_title}
                onChange={(e) => set('meta_title', e.target.value)}
                placeholder={draft.name}
              />
            </FormField>
            <FormField
              id="meta_description"
              label="Meta description"
              hint={<Optional />}
              error={error?.field('meta_description')}
              description="Defaults to the short description."
            >
              <Textarea
                id="meta_description"
                value={draft.meta_description}
                onChange={(e) => set('meta_description', e.target.value)}
                placeholder={draft.short_description}
                rows={3}
              />
            </FormField>
          </Section>
        </div>

        <div className="grid gap-6 lg:sticky lg:top-20">
          <Section title="Status">
            <FormField id="status" label="Visibility" error={error?.field('status')}>
              <Select value={draft.status} onValueChange={(value) => set('status', value as ProductStatus)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published: visible in store</SelectItem>
                  <SelectItem value="draft">Draft: hidden from customers</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <label className="flex items-start justify-between gap-3 rounded-lg border p-3">
              <span>
                <span className="block text-sm font-medium">Featured product</span>
                <span className="block text-xs text-muted-foreground">Highlight it on the home page.</span>
              </span>
              <Switch checked={draft.is_featured} onCheckedChange={(v) => set('is_featured', v)} />
            </label>
          </Section>

          <Section title="Organisation">
            <FormField
              id="category"
              label="Category"
              error={error?.field('category_id')}
              hint={
                <button
                  type="button"
                  onClick={() => setCategoryDialogOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Plus className="size-3" /> New
                </button>
              }
            >
              <Select value={draft.category_id} onValueChange={(value) => set('category_id', value)}>
                <SelectTrigger id="category" className="w-full" aria-invalid={Boolean(error?.field('category_id'))}>
                  <SelectValue placeholder={categoriesLoading ? 'Loading…' : 'Choose a category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.length ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                        {!category.is_active && <span className="text-muted-foreground"> (hidden)</span>}
                      </SelectItem>
                    ))
                  ) : (
                    <p className="px-2 py-3 text-center text-xs text-muted-foreground">No categories yet. Create one.</p>
                  )}
                </SelectContent>
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="unit"
                label="Unit"
                hint={<Optional />}
                error={error?.field('unit')}
                description="Shown after the price."
              >
                <Input id="unit" value={draft.unit} onChange={(e) => set('unit', e.target.value)} placeholder="kg" />
              </FormField>
              <FormField id="size" label="Size" hint={<Optional />} error={error?.field('size')}>
                <Input id="size" value={draft.size} onChange={(e) => set('size', e.target.value)} placeholder="500 g" />
              </FormField>
            </div>
            <FormField
              id="tags"
              label="Tags"
              hint={<Optional />}
              error={error?.field('tags')}
              description="Press Enter or comma to add. Helps customers find it in search."
            >
              <TagInput id="tags" value={draft.tags} onChange={(tags) => set('tags', tags)} placeholder="organic, honey" />
            </FormField>
          </Section>

          <div className="hidden lg:block">{saveButton}</div>
        </div>
      </form>

      <div className="sticky bottom-0 -mx-4 -mb-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Button variant="outline" asChild>
          <Link to="/products">Cancel</Link>
        </Button>
        {saveButton}
      </div>

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSaved={(category) => set('category_id', String(category.id))}
      />
    </>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  )
}

function FormSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid content-start gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-56" />
        </div>
      </div>
    </div>
  )
}

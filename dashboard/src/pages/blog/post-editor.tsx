import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarClock, ExternalLink, FolderPlus, Link2, Loader2, Save, Send, Star } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { BlogCategoryDialog } from '@/components/blog/blog-category-dialog'
import { MediaGallery } from '@/components/blog/media-gallery'
import { RichTextEditor } from '@/components/blog/rich-text-editor'
import { FormField, Optional } from '@/components/form-field'
import { SingleImageUpload } from '@/components/image-upload'
import { TagInput } from '@/components/products/tag-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, api, errorMessage } from '@/lib/api'
import { BLOG_LIMITS, mediaKey, normalizeSlug, storefrontPostUrl, tidySlug, type MediaDraft } from '@/lib/blog'
import { STOREFRONT_URL } from '@/lib/config'
import { formatDate, slugify } from '@/lib/format'
import { blogCategoriesQueryKey, blogPostsQueryKey, useBlogCategories } from '@/lib/queries'
import type { BlogPost, BlogStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { isSafeLink, isUnsafeBlogHtml, isUnsafeText, UNSAFE_BLOG_HTML_MESSAGE, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'

type Draft = {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  category: string
  tags: string[]
  is_featured: boolean
  schedule: string
  meta_title: string
  meta_description: string
  media: MediaDraft[]
}

type Errors = Record<string, string>

const NONE = 'none'

/** `datetime-local` works in local time without a zone; the API gets an ISO timestamp. */
const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return ''
  const date = new Date(iso)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

const toDraft = (post?: BlogPost): Draft => ({
  title: post?.title ?? '',
  slug: post?.slug ?? '',
  excerpt: post?.excerpt ?? '',
  content: post?.content ?? '',
  cover_image: post?.cover_image ?? '',
  category: post?.category ? String(post.category.id) : NONE,
  tags: post?.tags ?? [],
  is_featured: post?.is_featured ?? false,
  schedule: post?.published_at && new Date(post.published_at) > new Date() ? toLocalInput(post.published_at) : '',
  meta_title: post?.meta_title ?? '',
  meta_description: post?.meta_description ?? '',
  media: (post?.media ?? []).map((item) => ({ key: mediaKey(), type: item.type, provider: item.provider, url: item.url, caption: item.caption ?? '' })),
})

/** Media keys are client-only React keys, so they are left out when comparing drafts. */
const snapshot = (draft: Draft) =>
  JSON.stringify({ ...draft, media: draft.media.map((item) => [item.type, item.url, item.caption]) })

function validateDraft(draft: Draft): Errors {
  const errors: Errors = {}
  const title = draft.title.trim()
  const text = (key: keyof Draft, value: string, max: number) => {
    if (value.length > max) errors[key] = `Keep this under ${max} characters.`
    else if (isUnsafeText(value)) errors[key] = UNSAFE_TEXT_MESSAGE
  }

  if (title.length < 3) errors.title = 'Give the post a title of at least 3 characters.'
  else text('title', title, BLOG_LIMITS.title)
  text('excerpt', draft.excerpt.trim(), BLOG_LIMITS.excerpt)
  text('meta_title', draft.meta_title.trim(), BLOG_LIMITS.metaTitle)
  text('meta_description', draft.meta_description.trim(), BLOG_LIMITS.metaDescription)
  if (isUnsafeBlogHtml(draft.content)) errors.content = UNSAFE_BLOG_HTML_MESSAGE
  if (draft.cover_image && !/^https?:\/\//i.test(draft.cover_image)) errors.cover_image = 'Upload an image or use a full http(s) link.'
  if (draft.tags.length > BLOG_LIMITS.tags) errors.tags = `Use up to ${BLOG_LIMITS.tags} tags.`
  else if (draft.tags.some((tag) => tag.length > BLOG_LIMITS.tag || isUnsafeText(tag))) errors.tags = 'Tags must be short plain words (up to 50 characters, no code).'
  draft.media.forEach((item, index) => {
    if (!isSafeLink(item.url)) errors[`media.${index}.url`] = 'This link is not valid.'
    if (isUnsafeText(item.caption)) errors[`media.${index}.caption`] = UNSAFE_TEXT_MESSAGE
  })
  if (draft.schedule && Number.isNaN(Date.parse(draft.schedule))) errors.schedule = 'Pick a valid date and time.'
  return errors
}

export function BlogPostEditorPage() {
  const { id } = useParams()
  const { data: post, isPending, isError } = useQuery({
    queryKey: [...blogPostsQueryKey, 'detail', id],
    queryFn: () => api<{ data: BlogPost }>(`/admin/blog/posts/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  })

  if (id && isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Skeleton className="h-[36rem]" />
        <Skeleton className="h-96" />
      </div>
    )
  }
  if (id && (isError || !post)) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="font-medium">This post could not be found.</p>
        <Button asChild variant="outline">
          <Link to="/blog">Back to posts</Link>
        </Button>
      </div>
    )
  }
  return <PostForm key={post?.id ?? 'new'} post={post} />
}

function PostForm({ post }: { post?: BlogPost }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: categories } = useBlogCategories()
  const initial = useMemo(() => toDraft(post), [post])
  const [draft, setDraft] = useState<Draft>(initial)
  const [slugLinked, setSlugLinked] = useState(!post)
  const [errors, setErrors] = useState<Errors>({})
  const [categoryOpen, setCategoryOpen] = useState(false)

  const dirty = snapshot(draft) !== snapshot(initial)

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => {
      const next = { ...e }
      delete next[key]
      return next
    })
  }

  const save = useMutation({
    mutationFn: (status: BlogStatus) =>
      api<{ data: BlogPost }>(post ? `/admin/blog/posts/${post.id}` : '/admin/blog/posts', {
        method: post ? 'PUT' : 'POST',
        blogHtmlFields: ['content'],
        body: {
          title: draft.title.trim(),
          slug: tidySlug(draft.slug) || null,
          excerpt: draft.excerpt.trim() || null,
          content: draft.content || null,
          cover_image: draft.cover_image || null,
          blog_category_id: draft.category === NONE ? null : Number(draft.category),
          tags: draft.tags,
          status,
          is_featured: draft.is_featured,
          published_at: draft.schedule ? new Date(draft.schedule).toISOString() : status === 'published' && post?.status === 'published' ? post.published_at : null,
          meta_title: draft.meta_title.trim() || null,
          meta_description: draft.meta_description.trim() || null,
          media: draft.media.map((item) => ({ type: item.type, url: item.url, caption: item.caption.trim() || null })),
        },
      }).then((r) => r.data),
    onSuccess: (saved, status) => {
      const scheduled = saved.published_at && new Date(saved.published_at) > new Date()
      toast.success(status === 'draft' ? 'Draft saved.' : scheduled ? `Scheduled for ${formatDate(saved.published_at)}.` : post?.status === 'published' ? 'Post updated.' : 'Post published.')
      queryClient.invalidateQueries({ queryKey: blogPostsQueryKey })
      queryClient.invalidateQueries({ queryKey: blogCategoriesQueryKey })
      queryClient.setQueryData([...blogPostsQueryKey, 'detail', String(saved.id)], saved)
      if (!post) navigate(`/blog/${saved.id}/edit`, { replace: true })
      else {
        setDraft(toDraft(saved))
        setSlugLinked(false)
      }
    },
    onError: (e) => {
      if (e instanceof ApiError && Object.keys(e.errors).length) {
        setErrors(Object.fromEntries(Object.entries(e.errors).map(([key, messages]) => [key === 'blog_category_id' ? 'category' : key === 'published_at' ? 'schedule' : key.replace(/^tags\.\d+$/, 'tags'), messages[0]])))
      }
      toast.error(errorMessage(e))
    },
  })

  const submit = (status: BlogStatus) => (event?: FormEvent) => {
    event?.preventDefault()
    const found = validateDraft(draft)
    setErrors(found)
    if (Object.keys(found).length) {
      toast.error('Please fix the highlighted fields.')
      return
    }
    save.mutate(status)
  }

  const live = post?.status === 'published' && post.published_at && new Date(post.published_at) <= new Date()
  const pendingStatus = save.isPending ? save.variables : null
  const firstImage = draft.media.find((item) => item.type === 'image')?.url
  const seoTitle = draft.meta_title.trim() || draft.title.trim() || 'Post title'
  const seoDescription = draft.meta_description.trim() || draft.excerpt.trim() || 'A short summary of the post appears here in search results.'

  return (
    <form onSubmit={submit(post?.status ?? 'draft')} noValidate className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> All posts
          </Link>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
            {post ? 'Edit post' : 'Write a post'}
            {post && <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>{post.status === 'published' ? 'Published' : 'Draft'}</Badge>}
            {dirty && <span className="text-xs font-normal text-amber-600 dark:text-amber-400">Unsaved changes</span>}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {live && (
            <Button type="button" variant="ghost" asChild>
              <a href={storefrontPostUrl(post.slug)} target="_blank" rel="noreferrer">
                <ExternalLink /> View
              </a>
            </Button>
          )}
          <Button type="button" variant="outline" disabled={save.isPending} onClick={() => submit('draft')()}>
            {pendingStatus === 'draft' ? <Loader2 className="animate-spin" /> : <Save />}
            {post?.status === 'published' ? 'Unpublish' : 'Save draft'}
          </Button>
          <Button type="button" disabled={save.isPending} onClick={() => submit('published')()}>
            {pendingStatus === 'published' ? <Loader2 className="animate-spin" /> : draft.schedule ? <CalendarClock /> : <Send />}
            {post?.status === 'published' ? 'Update' : draft.schedule ? 'Schedule' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <FormField id="post-title" label="Title" error={errors.title} hint={<span className="text-xs text-muted-foreground tabular-nums">{draft.title.length}/{BLOG_LIMITS.title}</span>}>
                <Input
                  id="post-title"
                  value={draft.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setDraft((d) => ({ ...d, title, slug: slugLinked ? slugify(title) : d.slug }))
                    setErrors((er) => ({ ...er, title: '' }))
                  }}
                  placeholder="e.g. How Sundarbans honey is collected"
                  maxLength={BLOG_LIMITS.title}
                  className="h-11 text-lg font-medium"
                  aria-invalid={Boolean(errors.title)}
                  autoFocus={!post}
                />
              </FormField>
              <FormField
                id="post-slug"
                label="URL"
                error={errors.slug}
                hint={slugLinked && draft.slug ? <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Link2 className="size-3" /> From title</span> : <Optional />}
              >
                <div className="flex items-center rounded-md border bg-muted/40 focus-within:ring-3 focus-within:ring-ring/30">
                  <span className="hidden shrink-0 pl-3 text-sm text-muted-foreground sm:inline">{STOREFRONT_URL.replace(/^https?:\/\//, '')}/blog/post/?slug=</span>
                  <Input
                    id="post-slug"
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugLinked(false)
                      set('slug', normalizeSlug(e.target.value))
                    }}
                    onBlur={() => set('slug', tidySlug(draft.slug))}
                    placeholder={slugify(draft.title) || 'my-post'}
                    maxLength={BLOG_LIMITS.slug}
                    spellCheck={false}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                    aria-invalid={Boolean(errors.slug)}
                  />
                </div>
              </FormField>
              <FormField
                id="post-excerpt"
                label="Summary"
                hint={<span className="text-xs text-muted-foreground tabular-nums">{draft.excerpt.length}/{BLOG_LIMITS.excerpt}</span>}
                error={errors.excerpt}
                description="Shown on post cards and in search results. Plain text."
              >
                <Textarea id="post-excerpt" value={draft.excerpt} onChange={(e) => set('excerpt', e.target.value)} maxLength={BLOG_LIMITS.excerpt} rows={2} aria-invalid={Boolean(errors.excerpt)} />
              </FormField>
            </CardContent>
          </Card>

          <div className="space-y-1.5">
            <Label className="text-sm">Content</Label>
            <RichTextEditor value={draft.content} onChange={(html) => set('content', html)} invalid={Boolean(errors.content)} />
            {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
              <CardDescription>Photos and videos shown as a gallery under the post. Readers can open them full screen.</CardDescription>
            </CardHeader>
            <CardContent>
              <MediaGallery items={draft.media} onChange={(media) => set('media', media)} errors={errors} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search engine listing</CardTitle>
              <CardDescription>How the post can look on Google. Leave empty to use the title and summary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="truncate text-xs text-muted-foreground">
                  {STOREFRONT_URL.replace(/^https?:\/\//, '')} › blog › {tidySlug(draft.slug) || slugify(draft.title) || '…'}
                </p>
                <p className="mt-0.5 line-clamp-1 text-base text-blue-700 dark:text-blue-400">{seoTitle}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{seoDescription}</p>
              </div>
              <FormField id="post-meta-title" label="SEO title" hint={<span className="text-xs text-muted-foreground tabular-nums">{draft.meta_title.length}/60</span>} error={errors.meta_title}>
                <Input id="post-meta-title" value={draft.meta_title} onChange={(e) => set('meta_title', e.target.value)} maxLength={BLOG_LIMITS.metaTitle} placeholder={draft.title} />
              </FormField>
              <FormField id="post-meta-description" label="SEO description" hint={<span className="text-xs text-muted-foreground tabular-nums">{draft.meta_description.length}/160</span>} error={errors.meta_description}>
                <Textarea id="post-meta-description" value={draft.meta_description} onChange={(e) => set('meta_description', e.target.value)} maxLength={BLOG_LIMITS.metaDescription} rows={2} placeholder={draft.excerpt} />
              </FormField>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField id="post-schedule" label="Publish date" hint={<Optional />} error={errors.schedule} description={draft.schedule ? (new Date(draft.schedule) > new Date() ? 'The post goes live automatically at this time.' : 'Shown as the post date.') : 'Leave empty to publish right away.'}>
                <div className="flex gap-2">
                  <Input id="post-schedule" type="datetime-local" value={draft.schedule} onChange={(e) => set('schedule', e.target.value)} />
                  {draft.schedule && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => set('schedule', '')}>
                      Clear
                    </Button>
                  )}
                </div>
              </FormField>
              <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <Star className={cn('size-4', draft.is_featured && 'fill-amber-500 text-amber-500')} /> Featured
                  </span>
                  <span className="block text-xs text-muted-foreground">Pinned at the top of the blog.</span>
                </span>
                <Switch checked={draft.is_featured} onCheckedChange={(v) => set('is_featured', v)} />
              </label>
              {post && (
                <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <dt>Author</dt>
                  <dd className="truncate text-right text-foreground">{post.author?.name ?? '—'}</dd>
                  <dt>Views</dt>
                  <dd className="text-right text-foreground tabular-nums">{post.views}</dd>
                  <dt>Last saved</dt>
                  <dd className="text-right text-foreground">{formatDate(post.updated_at)}</dd>
                </dl>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={draft.category} onValueChange={(value) => set('category', value)}>
                <SelectTrigger className="w-full" aria-label="Category" aria-invalid={Boolean(errors.category)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No category</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                      {!category.is_active && ' (hidden)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              <Button type="button" variant="ghost" size="sm" className="px-0 text-primary hover:bg-transparent" onClick={() => setCategoryOpen(true)}>
                <FolderPlus /> New category
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover image</CardTitle>
              <CardDescription>Shown on post cards and at the top of the post. 16:9 works best.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <SingleImageUpload value={draft.cover_image} onChange={(url) => set('cover_image', url)} aspect="aspect-video" label="Upload cover" />
              {!draft.cover_image && firstImage && (
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => set('cover_image', firstImage)}>
                  Use first gallery image
                </Button>
              )}
              {errors.cover_image && <p className="text-xs text-destructive">{errors.cover_image}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Press Enter or comma after each tag.</CardDescription>
            </CardHeader>
            <CardContent>
              <TagInput id="post-tags" value={draft.tags} onChange={(tags) => set('tags', tags)} placeholder="honey, recipes…" />
              {errors.tags && <p className="mt-1.5 text-xs text-destructive">{errors.tags}</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <BlogCategoryDialog open={categoryOpen} onOpenChange={setCategoryOpen} category={null} />
    </form>
  )
}

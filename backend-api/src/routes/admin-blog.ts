import { Router, type Request, type RequestHandler } from 'express'
import { currentUser } from '../auth/guards.js'
import { Prisma, type BlogCategory, type BlogPost } from '../generated/prisma/client.js'
import { ValidationError, notFound, routeId, type FieldErrors } from '../lib/http.js'
import { paginate } from '../lib/paginate.js'
import { prisma, type Tx } from '../lib/prisma.js'
import { slugFor } from '../lib/slugs.js'
import { likeTerm, limit } from '../lib/str.js'
import { MAX_VIDEO_MEGABYTES } from '../middleware/input.js'
import { throttle } from '../middleware/rate-limit.js'
import { blogCategoryResource, blogPostResource, mediaResource } from '../resources/index.js'
import { BLOG_STATUSES, MAX_BLOG_MEDIA, detectProvider, discardTemp, isVideoUrl, sniffVideo, storeVideo } from '../services/blog.js'
import { categoryIcons } from '../services/category-icons.js'
import { bool, int, oneOf, opt, text, url, validate, z } from '../validation/index.js'
import { SAFE_BLOG_HTML_MESSAGE, isSafeBlogHtml } from '../validation/rules.js'
import { bodyOf, listOf } from './helpers.js'

/** Blog management for admins and employees (managers). Mounted inside the admin router, which already checks the role. */
export const blogAdminRouter = Router()

const put = (path: string, handler: RequestHandler) => {
  blogAdminRouter.put(path, handler)
  blogAdminRouter.patch(path, handler)
}

const json = (value: unknown) => (value === null ? Prisma.DbNull : (value as Prisma.InputJsonValue))

const slugRule = (max: number, taken: (value: string) => Promise<boolean>) =>
  z
    .string()
    .max(max)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'The :attribute may only contain lowercase letters, numbers and single dashes.')
    .refine(async (value) => !(await taken(value)), 'The slug has already been taken.')

const blogHtml = (max: number) => z.string().max(max).refine((value) => isSafeBlogHtml(value, isVideoUrl), SAFE_BLOG_HTML_MESSAGE)

const dateTime = () =>
  z
    .string()
    .max(40)
    .refine((value) => /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(value) && !Number.isNaN(Date.parse(value)), 'The :attribute is not a valid date.')
    .transform((value) => new Date(value))

/* ----------------------------------------------------------------------------------------------
 | Categories
 * -------------------------------------------------------------------------------------------- */

const categoryCount = { _count: { select: { posts: true } } }

async function findCategory(req: Request): Promise<BlogCategory> {
  const category = await prisma.blogCategory.findUnique({ where: { id: routeId(req.params.category) } })
  if (!category) notFound()
  return category!
}

async function validateCategory(req: Request, category: BlogCategory | null) {
  const name = text(100).pipe(z.string().min(2, 'The :attribute field must be at least 2 characters.'))
  return validate(
    z.object({
      name: category ? name.optional() : name,
      slug: opt(
        slugRule(120, async (value) =>
          Boolean(await prisma.blogCategory.findFirst({ where: { slug: value, ...(category ? { id: { not: category.id } } : {}) }, select: { id: true } })),
        ),
      ),
      icon: opt(z.string().refine((value) => categoryIcons.names().includes(value), 'Please choose an icon from the library.')),
      description: opt(text(1000)),
      is_active: bool().optional(),
      sort_order: int(0, 9999).optional(),
    }),
    bodyOf(req),
  )
}

blogAdminRouter.get('/blog/categories', async (req, res) => {
  const query = await validate(z.object({ q: opt(text(100)) }), req.query)
  const categories = await prisma.blogCategory.findMany({
    where: query.q ? { name: { contains: likeTerm(query.q) } } : {},
    include: categoryCount,
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  })
  res.json({ data: categories.map(blogCategoryResource) })
})

blogAdminRouter.post('/blog/categories', async (req, res) => {
  const data = await validateCategory(req, null)
  const category = await prisma.blogCategory.create({
    data: { ...data, name: data.name!, slug: (await slugFor('blogCategory', null, data))! },
    include: categoryCount,
  })
  res.status(201).json({ data: blogCategoryResource(category) })
})

put('/blog/categories/:category', async (req, res) => {
  const category = await findCategory(req)
  const data = await validateCategory(req, category)
  const updated = await prisma.blogCategory.update({
    where: { id: category.id },
    data: { ...data, slug: await slugFor('blogCategory', category, data) },
    include: categoryCount,
  })
  res.json({ data: blogCategoryResource(updated) })
})

/** Posts in the category are kept and become uncategorised (the foreign key sets them to NULL). */
blogAdminRouter.delete('/blog/categories/:category', async (req, res) => {
  const category = await findCategory(req)
  await prisma.blogCategory.delete({ where: { id: category.id } })
  res.status(204).end()
})

/* ----------------------------------------------------------------------------------------------
 | Posts
 * -------------------------------------------------------------------------------------------- */

const postInclude = {
  category: true,
  author: { select: { id: true, name: true, avatar: true } },
  media: { orderBy: [{ sort_order: 'asc' as const }, { id: 'asc' as const }] },
}

async function findPost(req: Request): Promise<BlogPost> {
  const post = await prisma.blogPost.findUnique({ where: { id: routeId(req.params.post) } })
  if (!post) notFound()
  return post!
}

const loadPost = (id: bigint) => prisma.blogPost.findUniqueOrThrow({ where: { id }, include: postInclude })

async function validatePost(req: Request, post: BlogPost | null) {
  const creating = post === null
  const body = bodyOf(req)
  const input = { ...body, tags: listOf(body.tags), media: listOf(body.media) }
  const title = text(255).pipe(z.string().min(3, 'The :attribute field must be at least 3 characters.'))

  const data = await validate(
    z.object({
      title: creating ? title : title.optional(),
      slug: opt(
        slugRule(255, async (value) =>
          Boolean(await prisma.blogPost.findFirst({ where: { slug: value, ...(post ? { id: { not: post.id } } : {}) }, select: { id: true } })),
        ),
      ),
      blog_category_id: opt(int().refine(async (value) => (await prisma.blogCategory.count({ where: { id: value } })) > 0, 'The selected category is invalid.')),
      excerpt: opt(text(500)),
      content: opt(blogHtml(300_000)),
      cover_image: opt(url(2048)),
      tags: opt(z.array(text(50)).max(20)),
      status: oneOf(BLOG_STATUSES).optional(),
      is_featured: bool().optional(),
      published_at: opt(dateTime()),
      meta_title: opt(text(255)),
      meta_description: opt(text(500)),
      media: z
        .array(
          z.object({
            type: oneOf(['image', 'video'] as const),
            url: url(2048),
            caption: opt(text(255)),
          }),
        )
        .max(MAX_BLOG_MEDIA)
        .optional(),
    }),
    input,
    (raw) => {
      const errors: FieldErrors = {}
      const media = Array.isArray(raw.media) ? raw.media : []
      for (const [index, item] of media.entries()) {
        if (!item || typeof item !== 'object') continue
        const { type, url: link } = item as Record<string, unknown>
        if (type === 'video' && typeof link === 'string' && !detectProvider(link)) {
          errors[`media.${index}.url`] = ['Use a YouTube or Vimeo link, or upload an MP4/WebM video.']
        }
      }
      return errors
    },
  )

  const { media, tags, ...fields } = data
  return { fields: { ...fields, ...(tags !== undefined ? { tags: json(tags) } : {}) }, media }
}

type MediaInput = NonNullable<Awaited<ReturnType<typeof validatePost>>['media']>

async function syncMedia(tx: Tx, postId: bigint, media: MediaInput) {
  await tx.blogPostMedia.deleteMany({ where: { blog_post_id: postId } })
  for (const [index, item] of media.entries()) {
    await tx.blogPostMedia.create({
      data: {
        blog_post_id: postId,
        type: item.type,
        provider: item.type === 'video' ? detectProvider(item.url)! : 'upload',
        url: item.url,
        caption: item.caption ?? null,
        sort_order: index,
      },
    })
  }
}

/** Publishing without a date stamps "now"; a future date schedules the post. */
function publishDate(fields: { status?: string; published_at?: Date | null }, existing: BlogPost | null): Date | null | undefined {
  // TIMESTAMP(0) rounds fractions up, which would push "now" into the future and hide the post for a second.
  const now = new Date(Math.floor(Date.now() / 1000) * 1000)
  const publishing = (fields.status ?? existing?.status) === 'published'
  if (fields.published_at) return fields.published_at
  if (fields.published_at === null) return publishing ? now : null
  if (publishing && !existing?.published_at) return now
  return existing ? undefined : null
}

const POST_SORTS = ['latest', 'oldest', 'title', 'views'] as const

blogAdminRouter.get('/blog/posts', async (req, res) => {
  const query = await validate(
    z.object({
      q: opt(text(100)),
      status: opt(oneOf(BLOG_STATUSES)),
      category_id: opt(int()),
      featured: opt(bool()),
      sort: opt(oneOf(POST_SORTS)),
      per_page: opt(int(1, 100)),
    }),
    req.query,
  )

  const where: Prisma.BlogPostWhereInput = {
    ...(query.q ? { OR: [{ title: { contains: likeTerm(query.q) } }, { excerpt: { contains: likeTerm(query.q) } }] } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.category_id ? { blog_category_id: query.category_id } : {}),
    ...(query.featured ? { is_featured: true } : {}),
  }
  const orderBy: Prisma.BlogPostOrderByWithRelationInput[] =
    query.sort === 'oldest' ? [{ created_at: 'asc' }] : query.sort === 'title' ? [{ title: 'asc' }] : query.sort === 'views' ? [{ views: 'desc' }] : [{ created_at: 'desc' }, { id: 'desc' }]

  const page = await paginate(
    req,
    query.per_page ?? 20,
    {
      count: () => prisma.blogPost.count({ where }),
      rows: ({ skip, take }) => prisma.blogPost.findMany({ where, include: postInclude, orderBy, skip, take }),
    },
    (post) => blogPostResource(post),
  )

  const byStatus = new Map((await prisma.blogPost.groupBy({ by: ['status'], _count: { _all: true } })).map((row) => [row.status, row._count._all]))
  res.json({ ...page, counts: Object.fromEntries(BLOG_STATUSES.map((status) => [status, byStatus.get(status) ?? 0])) })
})

blogAdminRouter.post('/blog/posts', async (req, res) => {
  const { fields, media } = await validatePost(req, null)
  const slug = (await slugFor('blogPost', null, { slug: fields.slug, name: fields.title }))!

  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.blogPost.create({
      data: { ...fields, title: fields.title!, slug, published_at: publishDate(fields, null) ?? null, author_id: currentUser(req).id },
    })
    await syncMedia(tx, created.id, media ?? [])
    return created
  })

  res.status(201).json({ data: blogPostResource(await loadPost(post.id), true) })
})

blogAdminRouter.get('/blog/posts/:post', async (req, res) => {
  const post = await findPost(req)
  res.json({ data: blogPostResource(await loadPost(post.id), true) })
})

put('/blog/posts/:post', async (req, res) => {
  const post = await findPost(req)
  const { fields, media } = await validatePost(req, post)
  const slug = await slugFor('blogPost', { id: post.id, slug: post.slug, name: post.title }, { slug: fields.slug, name: fields.title })
  const publishedAt = publishDate(fields, post)

  await prisma.$transaction(async (tx) => {
    await tx.blogPost.update({ where: { id: post.id }, data: { ...fields, slug, ...(publishedAt !== undefined ? { published_at: publishedAt } : {}) } })
    if (media !== undefined) await syncMedia(tx, post.id, media)
  })

  res.json({ data: blogPostResource(await loadPost(post.id), true) })
})

blogAdminRouter.delete('/blog/posts/:post', async (req, res) => {
  const post = await findPost(req)
  await prisma.blogPost.delete({ where: { id: post.id } })
  res.status(204).end()
})

/* ----------------------------------------------------------------------------------------------
 | Video uploads (MP4 / WebM). Images go through POST /admin/media.
 * -------------------------------------------------------------------------------------------- */

blogAdminRouter.post('/media/videos', throttle('uploads'), async (req, res) => {
  const file = req.uploads?.file?.[0]
  try {
    if (!file?.path) throw new ValidationError({ file: ['Choose a video to upload.'] })

    const format = await sniffVideo(file.path)
    if (!format) throw new ValidationError({ file: ['The video must be an MP4 or WebM file.'] })
    if (file.size > MAX_VIDEO_MEGABYTES * 1024 * 1024) throw new ValidationError({ file: [`The video must not be larger than ${MAX_VIDEO_MEGABYTES} MB.`] })

    const path = await storeVideo(file.path, format)
    const media = await prisma.media.create({
      data: { disk: 'public', path, original_name: limit(file.originalname, 255), mime_type: format.mime, size: file.size, uploaded_by: currentUser(req).id },
    })
    res.status(201).json({ data: mediaResource(media) })
  } finally {
    await discardTemp(file?.path)
  }
})

import { Router, type Request } from 'express'
import { requireActive, requireAuth } from '../auth/guards.js'
import { Prisma } from '../generated/prisma/client.js'
import { HttpError, notFound, routeId } from '../lib/http.js'
import { paginate } from '../lib/paginate.js'
import { prisma } from '../lib/prisma.js'
import { likeTerm } from '../lib/str.js'
import { throttle } from '../middleware/rate-limit.js'
import { blogCategoryResource, blogCommentResource, blogPostResource } from '../resources/index.js'
import { bodyOf } from './helpers.js'
import { bool, int, oneOf, opt, text, validate, z } from '../validation/index.js'

/** Public blog: published posts whose date has come, outside hidden categories. */
export const blogRouter = Router()

const publishedWhere = (): Prisma.BlogPostWhereInput => ({
  status: 'published',
  published_at: { lte: new Date() },
  OR: [{ blog_category_id: null }, { category: { is_active: true } }],
})

const engagementCount = { _count: { select: { likes: true, comments: { where: { is_hidden: false } } } } } as const
const listInclude = {
  category: true,
  author: { select: { id: true, name: true, avatar: true } },
  media: { select: { id: true, type: true } },
  ...engagementCount,
} as const
const fullInclude = { ...listInclude, media: { orderBy: [{ sort_order: 'asc' as const }, { id: 'asc' as const }] } }

const slugParam = z.string().max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

blogRouter.get('/blog/categories', async (_req, res) => {
  const categories = await prisma.blogCategory.findMany({
    where: { is_active: true },
    include: { _count: { select: { posts: { where: { status: 'published', published_at: { lte: new Date() } } } } } },
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  })
  res.json({ data: categories.map(blogCategoryResource) })
})

blogRouter.get('/blog/posts', async (req, res) => {
  const query = await validate(
    z.object({
      q: opt(text(100)),
      category: opt(slugParam),
      tag: opt(text(50)),
      featured: opt(bool()),
      sort: opt(oneOf(['latest', 'popular'] as const)),
      per_page: opt(int(1, 48)),
    }),
    req.query,
  )

  const where: Prisma.BlogPostWhereInput = {
    AND: [
      publishedWhere(),
      query.q ? { OR: [{ title: { contains: likeTerm(query.q) } }, { excerpt: { contains: likeTerm(query.q) } }] } : {},
      query.category ? { category: { slug: query.category, is_active: true } } : {},
      query.tag ? { tags: { array_contains: [query.tag] } } : {},
      query.featured ? { is_featured: true } : {},
    ],
  }
  const orderBy: Prisma.BlogPostOrderByWithRelationInput[] = query.sort === 'popular' ? [{ views: 'desc' }, { published_at: 'desc' }] : [{ published_at: 'desc' }, { id: 'desc' }]

  res.json(
    await paginate(
      req,
      query.per_page ?? 12,
      {
        count: () => prisma.blogPost.count({ where }),
        rows: ({ skip, take }) => prisma.blogPost.findMany({ where, include: listInclude, orderBy, skip, take }),
      },
      // The list only needs media counts, so the partial rows are cast to the shape the resource reads.
      (post) => blogPostResource(post as unknown as Parameters<typeof blogPostResource>[0]),
    ),
  )
})

blogRouter.get('/blog/posts/:slug', async (req, res) => {
  const parsed = slugParam.safeParse(req.params.slug)
  if (!parsed.success) notFound()

  const post = await prisma.blogPost.findFirst({ where: { AND: [publishedWhere(), { slug: parsed.data }] }, include: fullInclude })
  if (!post) notFound()

  // Server-rendered pages are cached and pass `track=0`; the visitor's browser records the view instead.
  if (req.query.track !== '0') await prisma.blogPost.update({ where: { id: post!.id }, data: { views: { increment: 1 } }, select: { id: true } })

  const related = await prisma.blogPost.findMany({
    where: { AND: [publishedWhere(), { id: { not: post!.id } }, post!.blog_category_id ? { blog_category_id: post!.blog_category_id } : {}] },
    include: listInclude,
    orderBy: [{ published_at: 'desc' }],
    take: 3,
  })

  res.json({
    data: blogPostResource(post!, true),
    related: related.map((item) => blogPostResource(item as unknown as Parameters<typeof blogPostResource>[0])),
  })
})

/* ----------------------------------------------------------------------------------------------
 | Engagement: anyone can read; only signed-in users can like and comment.
 * -------------------------------------------------------------------------------------------- */

async function findPublished(req: Request) {
  const parsed = slugParam.safeParse(req.params.slug)
  if (!parsed.success) notFound()
  const post = await prisma.blogPost.findFirst({ where: { AND: [publishedWhere(), { slug: parsed.data }] }, select: { id: true } })
  if (!post) notFound()
  return post!
}

const signedIn = [requireAuth, requireActive]

blogRouter.post('/blog/posts/:slug/view', throttle('tracking'), async (req, res) => {
  const post = await findPublished(req)
  await prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } }, select: { id: true } })
  res.status(204).end()
})

blogRouter.get('/blog/posts/:slug/engagement', async (req, res) => {
  const post = await findPublished(req)
  const [likes, comments, liked] = await Promise.all([
    prisma.blogPostLike.count({ where: { blog_post_id: post.id } }),
    prisma.blogComment.count({ where: { blog_post_id: post.id, is_hidden: false } }),
    req.user ? prisma.blogPostLike.count({ where: { blog_post_id: post.id, user_id: req.user.id } }) : Promise.resolve(0),
  ])
  res.json({ data: { likes_count: likes, comments_count: comments, liked: liked > 0 } })
})

blogRouter.post('/blog/posts/:slug/like', ...signedIn, throttle('writes'), async (req, res) => {
  const post = await findPublished(req)
  const userId = req.user!.id
  await prisma.blogPostLike.upsert({
    where: { blog_post_id_user_id: { blog_post_id: post.id, user_id: userId } },
    create: { blog_post_id: post.id, user_id: userId },
    update: {},
  })
  res.json({ data: { liked: true, likes_count: await prisma.blogPostLike.count({ where: { blog_post_id: post.id } }) } })
})

blogRouter.delete('/blog/posts/:slug/like', ...signedIn, throttle('writes'), async (req, res) => {
  const post = await findPublished(req)
  await prisma.blogPostLike.deleteMany({ where: { blog_post_id: post.id, user_id: req.user!.id } })
  res.json({ data: { liked: false, likes_count: await prisma.blogPostLike.count({ where: { blog_post_id: post.id } }) } })
})

const commentUser = { user: { select: { id: true, name: true, avatar: true } } } as const

blogRouter.get('/blog/posts/:slug/comments', async (req, res) => {
  const post = await findPublished(req)
  const query = await validate(z.object({ per_page: opt(int(1, 50)) }), req.query)
  const where = { blog_post_id: post.id, is_hidden: false }
  const viewer = req.user?.id ?? null

  res.json(
    await paginate(
      req,
      query.per_page ?? 20,
      {
        count: () => prisma.blogComment.count({ where }),
        rows: ({ skip, take }) => prisma.blogComment.findMany({ where, include: commentUser, orderBy: [{ created_at: 'desc' }, { id: 'desc' }], skip, take }),
      },
      (comment) => blogCommentResource(comment, viewer),
    ),
  )
})

blogRouter.post('/blog/posts/:slug/comments', ...signedIn, throttle('writes'), async (req, res) => {
  const post = await findPublished(req)
  const { body } = await validate(
    z.object({ body: text(2000).pipe(z.string().trim().min(2, 'The :attribute field must be at least 2 characters.')) }),
    bodyOf(req),
    { attributes: { body: 'comment' } },
  )
  const comment = await prisma.blogComment.create({ data: { blog_post_id: post.id, user_id: req.user!.id, body }, include: commentUser })
  res.status(201).json({ data: blogCommentResource(comment, req.user!.id) })
})

/** Authors can remove their own comments; staff moderate from the dashboard. */
blogRouter.delete('/blog/comments/:comment', ...signedIn, throttle('writes'), async (req, res) => {
  const comment = await prisma.blogComment.findUnique({ where: { id: routeId(req.params.comment) } })
  if (!comment) notFound()
  if (comment!.user_id !== req.user!.id) throw new HttpError(403, 'You are not authorized to perform this action.')
  await prisma.blogComment.delete({ where: { id: comment!.id } })
  res.status(204).end()
})

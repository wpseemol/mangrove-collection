import { Router } from 'express'
import { Prisma } from '../generated/prisma/client.js'
import { notFound } from '../lib/http.js'
import { paginate } from '../lib/paginate.js'
import { prisma } from '../lib/prisma.js'
import { likeTerm } from '../lib/str.js'
import { blogCategoryResource, blogPostResource } from '../resources/index.js'
import { bool, int, oneOf, opt, text, validate, z } from '../validation/index.js'

/** Public blog: published posts whose date has come, outside hidden categories. */
export const blogRouter = Router()

const publishedWhere = (): Prisma.BlogPostWhereInput => ({
  status: 'published',
  published_at: { lte: new Date() },
  OR: [{ blog_category_id: null }, { category: { is_active: true } }],
})

const listInclude = { category: true, author: { select: { id: true, name: true, avatar: true } }, media: { select: { id: true, type: true } } } as const
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

  await prisma.blogPost.update({ where: { id: post!.id }, data: { views: { increment: 1 } }, select: { id: true } })

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

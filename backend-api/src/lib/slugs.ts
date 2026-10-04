import { prisma } from './prisma.js'
import { randomLower, slug } from './str.js'

export type SlugModel = 'product' | 'category' | 'blogPost' | 'blogCategory'

async function slugTaken(model: SlugModel, where: { slug: string; id?: { not: bigint } }): Promise<boolean> {
  const select = { id: true }
  if (model === 'product') return (await prisma.product.findFirst({ where, select })) !== null
  if (model === 'category') return (await prisma.category.findFirst({ where, select })) !== null
  if (model === 'blogPost') return (await prisma.blogPost.findFirst({ where, select })) !== null
  return (await prisma.blogCategory.findFirst({ where, select })) !== null
}

/** Laravel's HasUniqueSlug: slugifies and appends -2, -3… until free (soft-deleted products count as taken). */
export async function uniqueSlug(model: SlugModel, value: string, ignoreId?: bigint | null): Promise<string> {
  const base = slug(value) || randomLower(8)

  const taken = (candidate: string) => slugTaken(model, { slug: candidate, ...(ignoreId ? { id: { not: ignoreId } } : {}) })

  let candidate = base
  for (let suffix = 2; await taken(candidate); suffix++) candidate = `${base}-${suffix}`
  return candidate
}

/** Laravel's HasUniqueSlug saving hook: a blank slug falls back to the name; a changed slug is made unique. */
export async function slugFor(model: SlugModel, existing: { id: bigint; slug: string; name: string } | null, data: { slug?: string | null; name?: string }) {
  let next = data.slug === undefined ? existing?.slug : data.slug
  if (!next) next = data.name ?? existing?.name ?? ''
  if (existing && next === existing.slug) return undefined
  return uniqueSlug(model, next, existing?.id)
}

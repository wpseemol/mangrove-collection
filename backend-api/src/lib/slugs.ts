import { prisma } from './prisma.js'
import { randomLower, slug } from './str.js'

/** Laravel's HasUniqueSlug: slugifies and appends -2, -3… until free (soft-deleted products count as taken). */
export async function uniqueSlug(model: 'product' | 'category', value: string, ignoreId?: bigint | null): Promise<string> {
  const base = slug(value) || randomLower(8)

  const taken = async (candidate: string) => {
    const where = { slug: candidate, ...(ignoreId ? { id: { not: ignoreId } } : {}) }
    const row = model === 'product' ? await prisma.product.findFirst({ where, select: { id: true } }) : await prisma.category.findFirst({ where, select: { id: true } })
    return row !== null
  }

  let candidate = base
  for (let suffix = 2; await taken(candidate); suffix++) candidate = `${base}-${suffix}`
  return candidate
}

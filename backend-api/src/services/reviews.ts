import { Prisma, type Order, type Product, type ProductReview } from '../generated/prisma/client.js'
import { fail } from '../lib/http.js'
import { prisma, type Db, type Tx } from '../lib/prisma.js'
import { round } from '../lib/serialize.js'
import type { UploadedFile } from '../middleware/input.js'
import { reviewImagePaths } from '../resources/index.js'
import { reviewImages } from './images.js'
import { ReviewerIdentity } from './reviewer-identity.js'

export const MAX_REVIEW_IMAGES = 4
export const REVIEW_STATUSES = ['published', 'hidden'] as const

export type ReviewCheck =
  | { status: 'already_reviewed'; order: null; review: ProductReview }
  | { status: 'can_review'; order: Order; review: null }
  | { status: 'not_delivered' | 'no_order'; order: null; review: null }

async function ordersFor(productId: bigint, identity: ReviewerIdentity, filter: 'delivered' | 'open'): Promise<Order[]> {
  const condition = identity.orderCondition()
  const statusSql = filter === 'delivered' ? "o.status = 'delivered' ORDER BY o.delivered_at DESC" : "o.status <> 'cancelled'"

  const rows = await prisma.$queryRawUnsafe<{ id: bigint }[]>(
    `SELECT o.id FROM orders o
     WHERE EXISTS (SELECT 1 FROM order_items i WHERE i.order_id = o.id AND i.product_id = ?)
       AND ${condition.sql}
       AND ${statusSql}
     LIMIT 50`,
    productId,
    ...condition.params,
  )
  if (rows.length === 0) return []

  const ids = rows.map((row) => BigInt(row.id))
  const found = await prisma.order.findMany({ where: { id: { in: ids } } })
  const byId = new Map(found.map((order) => [order.id, order]))
  return ids.map((id) => byId.get(id)).filter((order): order is Order => Boolean(order))
}

async function storeImages(files: UploadedFile[]): Promise<string[]> {
  const paths: string[] = []
  try {
    for (const [index, file] of files.entries()) paths.push(await reviewImages.store(file, `images.${index}`))
  } catch (error) {
    await reviewImages.deleteMany(paths)
    throw error
  }
  return paths
}

/** Recomputes the cached average and count from published reviews. */
export async function refreshRating(db: Db | Tx, productId: bigint): Promise<void> {
  const stats = await db.productReview.aggregate({ where: { product_id: productId, status: 'published' }, _count: { _all: true }, _avg: { rating: true } })
  await db.product.update({
    where: { id: productId },
    data: { rating_count: stats._count._all, rating_avg: round(Number(stats._avg.rating ?? 0), 2) },
  })
}

/** Verified-buyer reviews: one review per product per customer, allowed once an order containing the product has been delivered. */
export const reviews = {
  async existingReview(productId: bigint, identity: ReviewerIdentity): Promise<ProductReview | null> {
    return prisma.productReview.findFirst({ where: { product_id: productId, ...identity.reviewWhere() }, orderBy: { id: 'desc' } })
  },

  async check(product: Product, identity: ReviewerIdentity): Promise<ReviewCheck> {
    const review = await this.existingReview(product.id, identity)
    if (review) return { status: 'already_reviewed', order: null, review }

    const delivered = (await ordersFor(product.id, identity, 'delivered')).find((order) => identity.matchesOrder(order))
    if (delivered) return { status: 'can_review', order: delivered, review: null }

    const open = (await ordersFor(product.id, identity, 'open')).some((order) => identity.matchesOrder(order))
    return { status: open ? 'not_delivered' : 'no_order', order: null, review: null }
  },

  async create(product: Product, identity: ReviewerIdentity, data: { rating: number; comment: string }, files: UploadedFile[]): Promise<ProductReview> {
    const check = await this.check(product, identity)
    if (check.status === 'already_reviewed') fail('review', 'You have already reviewed this product. You can edit your review instead.')
    if (!check.order) fail('review', 'Only customers who received this product can review it.')

    const order = check.order!
    const paths = await storeImages(files)

    try {
      return await prisma.$transaction(async (tx) => {
        const review = await tx.productReview.create({
          data: {
            product_id: product.id,
            order_id: order.id,
            user_id: order.user_id ?? identity.userId,
            reviewer_name: order.customer_name.slice(0, 100),
            reviewer_phone: ReviewerIdentity.normalizePhone(order.customer_phone),
            reviewer_email: ReviewerIdentity.normalizeEmail(order.customer_email),
            rating: data.rating,
            comment: data.comment,
            images: paths.length ? paths : undefined,
            status: 'published',
          },
        })
        await refreshRating(tx, product.id)
        return review
      })
    } catch (error) {
      await reviewImages.deleteMany(paths)
      throw error
    }
  },

  async update(review: ProductReview, data: { rating: number; comment: string }, keepImages: string[], files: UploadedFile[]): Promise<ProductReview> {
    const current = reviewImagePaths(review.images)
    const kept = current.filter((path) => keepImages.includes(path))

    if (kept.length + files.length > MAX_REVIEW_IMAGES) fail('images', `You can add up to ${MAX_REVIEW_IMAGES} photos.`)

    const added = await storeImages(files)
    let updated: ProductReview

    try {
      updated = await prisma.$transaction(async (tx) => {
        const images = [...kept, ...added]
        const saved = await tx.productReview.update({
          where: { id: review.id },
          data: { rating: data.rating, comment: data.comment, images: images.length ? images : Prisma.DbNull, edited_at: new Date() },
        })
        await refreshRating(tx, review.product_id)
        return saved
      })
    } catch (error) {
      await reviewImages.deleteMany(added)
      throw error
    }

    await reviewImages.deleteMany(current.filter((path) => !kept.includes(path)))
    return updated
  },

  async delete(review: ProductReview): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.productReview.delete({ where: { id: review.id } })
      await refreshRating(tx, review.product_id)
    })
    await reviewImages.deleteMany(review.images)
  },

  async setStatus(review: ProductReview, status: string): Promise<ProductReview> {
    return prisma.$transaction(async (tx) => {
      const saved = await tx.productReview.update({ where: { id: review.id }, data: { status } })
      await refreshRating(tx, review.product_id)
      return saved
    })
  },
}
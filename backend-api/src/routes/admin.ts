import { Router, type Request, type RequestHandler } from 'express'
import { currentUser, requireActive, requireAuth, requireRole } from '../auth/guards.js'
import { revokeUserSessions } from '../auth/session.js'
import { Prisma, type Category, type Product } from '../generated/prisma/client.js'
import { HttpError, ValidationError, conflict, notFound, routeId, type FieldErrors } from '../lib/http.js'
import { report } from '../lib/log.js'
import { paginate } from '../lib/paginate.js'
import { prisma, type Tx } from '../lib/prisma.js'
import { uniqueSlug } from '../lib/slugs.js'
import { storage, type Disk } from '../lib/storage.js'
import { likeTerm, limit, random, slug } from '../lib/str.js'
import { throttle } from '../middleware/rate-limit.js'
import {
  WALLET_METHODS,
  bannerResource,
  categoryResource,
  mediaResource,
  orderResource,
  pageResource,
  paymentAccountResource,
  paymentResource,
  productResource,
  reviewResource,
  shippingMethodResource,
  userResource,
} from '../resources/index.js'
import { categoryIcons } from '../services/category-icons.js'
import { categoryImages, checkImage, extensionFor, mimeFor } from '../services/images.js'
import { sendMail } from '../services/mail.js'
import { ORDER_STATUSES, PAYMENT_STATUSES, orders, type OrderStatus } from '../services/orders.js'
import { hashPassword } from '../services/password-resets.js'
import { PAYMENT_METHODS, payments } from '../services/payments.js'
import { REVIEW_STATUSES, reviews } from '../services/reviews.js'
import { settingRegistry, settingSchema, settings } from '../services/settings.js'
import { sms } from '../services/sms.js'
import {
  alphaDash,
  bool,
  email,
  html,
  int,
  intBetween,
  lowercaseEmail,
  num,
  oneOf,
  opt,
  phone,
  safeText,
  text,
  url,
  validate,
  z,
} from '../validation/index.js'
import { bodyOf, distinct, listOf } from './helpers.js'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireActive, requireRole('admin', 'manager'), throttle('writes'))

const PRODUCT_STATUSES = ['draft', 'published'] as const
const BANNER_TYPES = ['slide', 'right_top', 'right_bottom'] as const
const USER_ROLES = ['customer', 'manager', 'admin'] as const
const PAYMENT_REVIEW_STATUSES = ['submitted', 'verified', 'rejected'] as const
const ACCOUNT_TYPES = ['personal', 'agent', 'merchant'] as const

/** Laravel's `latest()`: no tie-breaker, so MySQL returns ties in the same order as before. */
const latest = { created_at: 'desc' as const }

/** Prisma needs `DbNull` to store SQL NULL in a JSON column. */
const json = (value: unknown) => (value === null ? Prisma.DbNull : (value as Prisma.InputJsonValue))

const asciiDash = (max: number) =>
  z
    .string()
    .max(max)
    .regex(/^[a-zA-Z0-9_-]+$/, 'The :attribute field must only contain letters, numbers, dashes, and underscores.')

const put = (path: string, ...handlers: RequestHandler[]) => {
  adminRouter.put(path, ...handlers)
  adminRouter.patch(path, ...handlers)
}

/** Laravel's HasUniqueSlug saving hook: a blank slug falls back to the name; a changed slug is made unique. */
async function slugFor(model: 'product' | 'category', existing: { id: bigint; slug: string; name: string } | null, data: { slug?: string | null; name?: string }) {
  let next = data.slug === undefined ? existing?.slug : data.slug
  if (!next) next = data.name ?? existing?.name ?? ''
  if (existing && next === existing.slug) return undefined
  return uniqueSlug(model, next, existing?.id)
}

/* ----------------------------------------------------------------------------------------------
 | Dashboard
 * -------------------------------------------------------------------------------------------- */

adminRouter.get('/dashboard', async (req, res) => {
  const query = await validate(z.object({ days: opt(int(1, 365)) }), req.query)
  const days = query.days ?? 30

  const from = new Date()
  from.setUTCHours(0, 0, 0, 0)
  from.setUTCDate(from.getUTCDate() - (days - 1))

  const notCancelled = { status: { not: 'cancelled' } }

  const daily = await prisma.$queryRaw<{ day: string; orders: bigint; revenue: unknown }[]>`
    SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS orders, SUM(total) AS revenue
    FROM orders WHERE status <> 'cancelled' AND created_at >= ${from} GROUP BY day`
  const byDay = new Map(daily.map((row) => [row.day, row]))

  const chart = Array.from({ length: days }, (_, offset) => {
    const date = new Date(from.getTime() + offset * 86_400_000).toISOString().slice(0, 10)
    const row = byDay.get(date)
    return { date, orders: Number(row?.orders ?? 0), revenue: Math.round(Number(row?.revenue ?? 0) * 100) / 100 }
  })

  const threshold = Number(await settings.get('low_stock_threshold', 5))
  const lowStock = await prisma.productVariant.findMany({
    where: { stock: { not: null, lte: threshold }, product: { deleted_at: null } },
    include: { product: { select: { id: true, name: true, slug: true } } },
    orderBy: { stock: 'asc' },
    take: 10,
  })

  const sum = async (where: Prisma.OrderWhereInput) => Math.round(Number((await prisma.order.aggregate({ where, _sum: { total: true } }))._sum.total ?? 0) * 100) / 100
  const statusCounts = await Promise.all(ORDER_STATUSES.map(async (status) => [status, await prisma.order.count({ where: { status } })] as const))
  const recent = await prisma.order.findMany({ include: { _count: { select: { items: true } } }, orderBy: latest, take: 5 })

  res.json({
    data: {
      totals: {
        revenue: await sum(notCancelled),
        revenue_period: await sum({ ...notCancelled, created_at: { gte: from } }),
        orders: await prisma.order.count(),
        orders_period: await prisma.order.count({ where: { created_at: { gte: from } } }),
        customers: await prisma.user.count({ where: { role: 'customer' } }),
        products: await prisma.product.count({ where: { deleted_at: null } }),
        payments_awaiting: await prisma.payment.count({ where: { status: 'submitted' } }),
      },
      orders_by_status: Object.fromEntries(statusCounts),
      sales_chart: chart,
      low_stock: lowStock.map((variant) => ({
        variant_id: Number(variant.id),
        product_id: Number(variant.product_id),
        product_name: variant.product.name,
        variant_title: variant.title,
        stock: variant.stock,
      })),
      recent_orders: recent.map((order) => orderResource(req, order)),
    },
  })
})

/* ----------------------------------------------------------------------------------------------
 | Categories
 * -------------------------------------------------------------------------------------------- */

const CATEGORY_IMAGE = { width: 800, height: 600 }
const categoryCount = { _count: { select: { products: { where: { deleted_at: null } } } } }

async function findCategory(req: Request): Promise<Category> {
  const category = await prisma.category.findUnique({ where: { id: routeId(req.params.category) } })
  if (!category) notFound()
  return category!
}

async function validateCategory(req: Request, category: Category | null) {
  const creating = category === null
  const body = bodyOf(req)
  const file = req.uploads?.image?.[0]

  const data = await validate(
    z.object({
      name: creating ? text(100).pipe(z.string().min(2, 'The :attribute field must be at least 2 characters.')) : text(100).pipe(z.string().min(2, 'The :attribute field must be at least 2 characters.')).optional(),
      slug: opt(
        asciiDash(120).refine(
          async (value) => !(await prisma.category.findFirst({ where: { slug: value, ...(category ? { id: { not: category.id } } : {}) }, select: { id: true } })),
          'The slug has already been taken.',
        ),
      ),
      description: opt(text(1000)),
      icon: opt(z.string().refine((value) => categoryIcons.names().includes(value), 'Please choose an icon from the library.')),
      remove_image: bool().optional(),
      is_active: bool().optional(),
      sort_order: int(0, 9999).optional(),
    }),
    body,
    async () => {
      if (!file) return typeof body.image === 'string' ? { image: ['The image field must be a file.'] } : undefined
      const { errors } = await checkImage(file, 'image', {
        formats: ['jpeg', 'png', 'webp'],
        mimesLabel: 'jpg, jpeg, png, webp',
        maxKilobytes: 2048,
        dimensions: { minWidth: CATEGORY_IMAGE.width, minHeight: CATEGORY_IMAGE.height, maxWidth: CATEGORY_IMAGE.width * 4, maxHeight: CATEGORY_IMAGE.height * 4, ratio: 4 / 3 },
        dimensionsMessage: `The image must be 4:3 landscape, at least ${CATEGORY_IMAGE.width} × ${CATEGORY_IMAGE.height} px and at most ${CATEGORY_IMAGE.width * 4} × ${CATEGORY_IMAGE.height * 4} px.`,
      })
      return errors
    },
  )

  const { remove_image: removeImage, ...fields } = data
  return { fields, file, removeImage: removeImage === true }
}

adminRouter.get('/categories', async (req, res) => {
  const query = await validate(z.object({ q: opt(text(100)) }), req.query)
  const categories = await prisma.category.findMany({
    where: query.q ? { name: { contains: likeTerm(query.q) } } : {},
    include: categoryCount,
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  })
  res.json({ data: categories.map(categoryResource) })
})

adminRouter.post('/categories', throttle('uploads'), async (req, res) => {
  const { fields, file } = await validateCategory(req, null)
  const image = file ? await categoryImages.store(file, fields.name!) : undefined

  try {
    const category = await prisma.category.create({
      data: { ...fields, name: fields.name!, slug: (await slugFor('category', null, fields))!, image, created_by: currentUser(req).id },
      include: categoryCount,
    })
    res.status(201).json({ data: categoryResource(category) })
  } catch (error) {
    await categoryImages.delete(image)
    throw error
  }
})

adminRouter.get('/categories/:category', async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: routeId(req.params.category) }, include: categoryCount })
  if (!category) notFound()
  res.json({ data: categoryResource(category!) })
})

put('/categories/:category', throttle('uploads'), async (req, res) => {
  const category = await findCategory(req)
  const { fields, file, removeImage } = await validateCategory(req, category)

  let image: string | null | undefined
  if (file) image = await categoryImages.store(file, fields.name ?? category.name)
  else if (removeImage) image = null

  let updated
  try {
    updated = await prisma.category.update({
      where: { id: category.id },
      data: { ...fields, slug: await slugFor('category', category, fields), ...(image !== undefined ? { image } : {}) },
      include: categoryCount,
    })
  } catch (error) {
    if (file) await categoryImages.delete(image)
    throw error
  }

  if (image !== undefined && category.image !== updated.image) await categoryImages.delete(category.image)
  res.json({ data: categoryResource(updated) })
})

adminRouter.delete('/categories/:category', async (req, res) => {
  const category = await findCategory(req)
  if (await prisma.product.findFirst({ where: { category_id: category.id }, select: { id: true } })) {
    conflict('This category still has products. Move or delete them first.')
  }

  await prisma.category.delete({ where: { id: category.id } })
  await categoryImages.delete(category.image)
  res.status(204).end()
})

/* ----------------------------------------------------------------------------------------------
 | Media
 * -------------------------------------------------------------------------------------------- */

adminRouter.get('/media', async (req, res) => {
  const query = await validate(z.object({ q: opt(text(100)), per_page: opt(int(1, 100)) }), req.query)
  const where = query.q ? { original_name: { contains: likeTerm(query.q) } } : {}

  res.json(
    await paginate(
      req,
      query.per_page ?? 40,
      { count: () => prisma.media.count({ where }), rows: ({ skip, take }) => prisma.media.findMany({ where, orderBy: latest, skip, take }) },
      mediaResource,
    ),
  )
})

/** Accepts `files[]` (multiple) or a single `file`. SVG is intentionally excluded because it can carry scripts. */
adminRouter.post('/media', throttle('uploads'), async (req, res) => {
  const many = req.uploads?.files ?? []
  const single = req.uploads?.file?.[0]
  const rules = { formats: ['jpeg', 'png', 'webp', 'gif'], mimesLabel: 'jpg, jpeg, png, webp, gif', maxKilobytes: 5120 }

  const errors: FieldErrors = {}
  if (!single && many.length === 0) {
    errors.file = ['The file field is required when files is not present.']
    errors.files = ['The files field is required when file is not present.']
  }
  if (many.length > 20) errors.files = ['The files field must not have more than 20 items.']

  const files = many.length > 0 ? many : single ? [single] : []
  const checked = []
  for (const [index, file] of files.entries()) {
    const result = await checkImage(file, many.length > 0 ? `files.${index}` : 'file', rules)
    Object.assign(errors, result.errors)
    checked.push({ file, info: result.info })
  }
  if (Object.keys(errors).length > 0) throw new ValidationError(errors)

  const now = new Date()
  const directory = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  const created = []

  for (const { file, info } of checked) {
    const path = `${directory}/${random(40)}.${extensionFor(info!)}`
    await storage.put('public', path, file.buffer)
    created.push(
      await prisma.media.create({
        data: { disk: 'public', path, original_name: limit(file.originalname, 255), mime_type: mimeFor(info!), size: file.size, uploaded_by: currentUser(req).id },
      }),
    )
  }

  res.status(201).json({ data: created.map(mediaResource) })
})

adminRouter.delete('/media/:medium', async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: routeId(req.params.medium) } })
  if (!media) notFound()

  await storage.delete(media!.disk as Disk, media!.path)
  await prisma.media.delete({ where: { id: media!.id } })
  res.status(204).end()
})

/* ----------------------------------------------------------------------------------------------
 | Products
 * -------------------------------------------------------------------------------------------- */

const productInclude = {
  category: true,
  variants: { orderBy: [{ sort_order: 'asc' as const }, { id: 'asc' as const }] },
  images: { orderBy: [{ sort_order: 'asc' as const }, { id: 'asc' as const }] },
}

async function findProduct(req: Request, trashed: 'without' | 'with' | 'only' = 'without'): Promise<Product> {
  const deleted = trashed === 'without' ? { deleted_at: null } : trashed === 'only' ? { deleted_at: { not: null } } : {}
  const product = await prisma.product.findFirst({ where: { id: routeId(req.params.product), ...deleted } })
  if (!product) notFound()
  return product!
}

async function validateProduct(req: Request, product: Product | null) {
  const creating = product === null
  const required = <T extends z.ZodType>(schema: T) => (creating ? schema : schema.optional())
  const body = bodyOf(req)
  const input = { ...body, variants: listOf(body.variants), images: listOf(body.images), tags: listOf(body.tags) }

  const data = await validate(
    z.object({
      category_id: required(
        int().refine(async (value) => (await prisma.category.count({ where: { id: value } })) > 0, 'The selected :attribute is invalid.'),
      ),
      name: required(text(255)),
      slug: opt(
        asciiDash(255).refine(
          async (value) => !(await prisma.product.findFirst({ where: { slug: value, ...(product ? { id: { not: product.id } } : {}) }, select: { id: true } })),
          'The slug has already been taken.',
        ),
      ),
      unit: opt(text(50)),
      size: opt(text(100)),
      shipping_cost: opt(num(0, 100000, 2)),
      currency: z
        .string()
        .length(3, 'The :attribute field must be 3 characters.')
        .regex(/^[A-Za-z]+$/, 'The :attribute field must only contain letters.')
        .optional(),
      short_description: opt(text(500)),
      description: opt(html(20000)),
      thumbnail: opt(url(2048)),
      tags: opt(z.array(text(50)).max(30)),
      status: oneOf(PRODUCT_STATUSES).optional(),
      is_featured: bool().optional(),
      meta_title: opt(text(255)),
      meta_description: opt(text(500)),
      images: z.array(z.object({ url: url(2048), alt: opt(text(255)) })).max(20).optional(),
      variants: required(
        z
          .array(
            z.object({
              id: opt(int()),
              title: text(255),
              type: opt(text(50)),
              sku: opt(
                z
                  .string()
                  .max(100)
                  .regex(/^[A-Za-z0-9._\-/]+$/),
              ),
              price: num(0, 99999999),
              compare_price: opt(num(0, 99999999)),
              stock: opt(int(0, 1000000)),
              is_default: bool().optional(),
            }),
          )
          .min(1)
          .max(50),
      ),
    }),
    input,
    distinct('variants', 'sku'),
    async (raw) => {
      const errors: FieldErrors = {}
      const variants = Array.isArray(raw.variants) ? raw.variants : []
      for (const [index, variant] of variants.entries()) {
        const sku = variant && typeof variant === 'object' ? (variant as Record<string, unknown>).sku : null
        if (typeof sku !== 'string' || sku === '') continue
        const taken = await prisma.productVariant.findFirst({ where: { sku, ...(product ? { product_id: { not: product.id } } : {}) }, select: { id: true } })
        if (taken) errors[`variants.${index}.sku`] = ['This SKU is already used by another product.']
      }
      return errors
    },
  )

  const { variants, images, tags, ...fields } = data
  return { fields: { ...fields, ...(tags !== undefined ? { tags: json(tags) } : {}) }, variants, images }
}

type VariantInput = NonNullable<Awaited<ReturnType<typeof validateProduct>>['variants']>[number]
type ImageInput = NonNullable<Awaited<ReturnType<typeof validateProduct>>['images']>[number]

async function syncVariants(tx: Tx, productId: bigint, variants: VariantInput[]) {
  const hasDefault = variants.some((variant) => variant.is_default)
  const keptIds: bigint[] = []

  for (const [index, data] of variants.entries()) {
    const attributes = {
      title: data.title,
      type: data.type ?? null,
      sku: data.sku ?? null,
      price: data.price,
      compare_price: data.compare_price ?? null,
      stock: data.stock ?? null,
      is_default: hasDefault ? Boolean(data.is_default) : index === 0,
      sort_order: index,
    }

    const existing = data.id ? await tx.productVariant.findFirst({ where: { id: data.id, product_id: productId } }) : null
    const variant = existing
      ? await tx.productVariant.update({ where: { id: existing.id }, data: attributes })
      : await tx.productVariant.create({ data: { ...attributes, product_id: productId } })

    keptIds.push(variant.id)
  }

  await tx.productVariant.deleteMany({ where: { product_id: productId, id: { notIn: keptIds } } })

  // Guarantee exactly one default variant.
  const defaults = await tx.productVariant.findMany({ where: { product_id: productId, is_default: true }, select: { id: true }, orderBy: { id: 'asc' } })
  if (defaults.length > 1) {
    await tx.productVariant.updateMany({ where: { id: { in: defaults.slice(1).map((row) => row.id) } }, data: { is_default: false } })
  }
}

async function syncImages(tx: Tx, productId: bigint, images: ImageInput[]) {
  await tx.productImage.deleteMany({ where: { product_id: productId } })
  for (const [index, image] of images.entries()) {
    await tx.productImage.create({ data: { product_id: productId, url: image.url, alt: image.alt ?? null, sort_order: index } })
  }
}

adminRouter.get('/products', async (req, res) => {
  const query = await validate(
    z.object({
      q: opt(text(100)),
      status: opt(oneOf(PRODUCT_STATUSES)),
      category_id: opt(int()),
      trashed: opt(bool()),
      per_page: opt(int(1, 100)),
    }),
    req.query,
  )

  const where: Prisma.ProductWhereInput = {
    deleted_at: query.trashed ? { not: null } : null,
    ...(query.q ? { OR: [{ name: { contains: likeTerm(query.q) } }, { variants: { some: { sku: query.q } } }] } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.category_id ? { category_id: query.category_id } : {}),
  }

  res.json(
    await paginate(
      req,
      query.per_page ?? 20,
      {
        count: () => prisma.product.count({ where }),
        rows: ({ skip, take }) =>
          prisma.product.findMany({ where, include: { category: true, variants: productInclude.variants }, orderBy: latest, skip, take }),
      },
      productResource,
    ),
  )
})

adminRouter.post('/products', async (req, res) => {
  const { fields, variants, images } = await validateProduct(req, null)
  const userId = currentUser(req).id
  const productSlug = (await slugFor('product', null, fields))!

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({ data: { ...fields, category_id: fields.category_id!, name: fields.name!, slug: productSlug, created_by: userId } })
    await syncVariants(tx, created.id, variants!)
    await syncImages(tx, created.id, images ?? [])
    return created
  })

  res.status(201).json({ data: productResource(await prisma.product.findUniqueOrThrow({ where: { id: product.id }, include: productInclude })) })
})

adminRouter.get('/products/:product', async (req, res) => {
  const product = await findProduct(req, 'with')
  res.json({ data: productResource(await prisma.product.findUniqueOrThrow({ where: { id: product.id }, include: productInclude })) })
})

put('/products/:product', async (req, res) => {
  const product = await findProduct(req)
  const { fields, variants, images } = await validateProduct(req, product)
  const productSlug = await slugFor('product', product, fields)

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id: product.id }, data: { ...fields, slug: productSlug } })
    if (variants !== undefined) await syncVariants(tx, product.id, variants)
    if (images !== undefined) await syncImages(tx, product.id, images)
  })

  res.json({ data: productResource(await prisma.product.findUniqueOrThrow({ where: { id: product.id }, include: productInclude })) })
})

/** Soft delete: order history keeps referencing the product. */
adminRouter.delete('/products/:product', async (req, res) => {
  const product = await findProduct(req)
  await prisma.product.update({ where: { id: product.id }, data: { deleted_at: new Date() } })
  res.status(204).end()
})

adminRouter.post('/products/:product/restore', async (req, res) => {
  const product = await findProduct(req, 'only')
  const restored = await prisma.product.update({ where: { id: product.id }, data: { deleted_at: null }, include: productInclude })
  res.json({ data: productResource(restored) })
})

/* ----------------------------------------------------------------------------------------------
 | Orders
 * -------------------------------------------------------------------------------------------- */

const orderDetail = {
  items: true,
  user: true,
  payments: { include: { reviewer: true }, orderBy: { id: 'desc' as const } },
}

async function loadOrderDetail(id: bigint) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id }, include: orderDetail })
  const latest = order.payments[0]
  // `latestPayment` is loaded without its reviewer, unlike the `payments` list.
  return { ...order, latestPayment: latest ? (({ reviewer: _reviewer, ...payment }) => payment)(latest) : null }
}

async function findOrder(req: Request) {
  const order = await prisma.order.findUnique({ where: { id: routeId(req.params.order) } })
  if (!order) notFound()
  return order!
}

const dateFormat = z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().startsWith(value), 'The :attribute field must match the format Y-m-d.')

adminRouter.get('/orders', async (req, res) => {
  const query = await validate(
    z.object({
      q: opt(text(100)),
      status: opt(oneOf(ORDER_STATUSES)),
      payment_status: opt(oneOf(PAYMENT_STATUSES)),
      payment_method: opt(oneOf(PAYMENT_METHODS)),
      from: opt(dateFormat),
      to: opt(dateFormat),
      per_page: opt(int(1, 100)),
    }),
    req.query,
  )

  const term = query.q ? likeTerm(query.q) : null
  const createdAt: { gte?: Date; lt?: Date } = {}
  if (query.from) createdAt.gte = new Date(`${query.from}T00:00:00Z`)
  if (query.to) createdAt.lt = new Date(new Date(`${query.to}T00:00:00Z`).getTime() + 86_400_000)

  const where: Prisma.OrderWhereInput = {
    ...(term
      ? { OR: [{ order_number: { contains: term } }, { customer_name: { contains: term } }, { customer_phone: { contains: term } }, { customer_email: { contains: term } }] }
      : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.payment_status ? { payment_status: query.payment_status } : {}),
    ...(query.payment_method ? { payment_method: query.payment_method } : {}),
    ...(query.from || query.to ? { created_at: createdAt } : {}),
  }

  const page = await paginate(
    req,
    query.per_page ?? 20,
    {
      count: () => prisma.order.count({ where }),
      rows: async ({ skip, take }) =>
        (
          await prisma.order.findMany({
            where,
            include: { payments: { orderBy: { id: 'desc' }, take: 1 }, _count: { select: { items: true } } },
            orderBy: latest,
            skip,
            take,
          })
        ).map(({ payments: list, ...order }) => ({ ...order, latestPayment: list[0] ?? null })),
    },
    (order) => orderResource(req, order),
  )

  const counts = await prisma.order.groupBy({ by: ['status'], _count: { _all: true } })
  const byStatus = new Map(counts.map((row) => [row.status, row._count._all]))

  res.json({ ...page, counts: Object.fromEntries(ORDER_STATUSES.map((status) => [status, byStatus.get(status) ?? 0])) })
})

adminRouter.get('/orders/:order', async (req, res) => {
  const order = await findOrder(req)
  res.json({ data: orderResource(req, await loadOrderDetail(order.id)) })
})

put('/orders/:order', async (req, res) => {
  const order = await findOrder(req)
  const data = await validate(
    z.object({ status: oneOf(ORDER_STATUSES).optional(), payment_status: oneOf(PAYMENT_STATUSES).optional(), admin_note: opt(text(5000)) }),
    bodyOf(req),
  )

  if (order.status === 'cancelled' && data.status !== undefined && data.status !== 'cancelled') {
    conflict('Cancelled orders cannot be reopened. Ask the customer to place a new order.')
  }

  const { status, ...rest } = data
  const saved = Object.keys(rest).length > 0 ? await prisma.order.update({ where: { id: order.id }, data: rest }) : order
  if (status !== undefined) await orders.updateStatus(saved, status as OrderStatus)

  res.json({ data: orderResource(req, await loadOrderDetail(order.id)) })
})

adminRouter.delete('/orders/:order', async (req, res) => {
  const order = await findOrder(req)
  if (order.status !== 'cancelled') await orders.updateStatus(order, 'cancelled')

  await prisma.order.delete({ where: { id: order.id } })
  res.status(204).end()
})

/* ----------------------------------------------------------------------------------------------
 | Payments (verification queue for wallet transaction IDs)
 * -------------------------------------------------------------------------------------------- */

const paymentInclude = { order: true, reviewer: true }

async function findPayment(req: Request) {
  const payment = await prisma.payment.findUnique({ where: { id: routeId(req.params.payment) } })
  if (!payment) notFound()
  return payment!
}

adminRouter.get('/payments', async (req, res) => {
  const query = await validate(
    z.object({ q: opt(text(100)), status: opt(oneOf(PAYMENT_REVIEW_STATUSES)), method: opt(oneOf(WALLET_METHODS)), per_page: opt(int(1, 100)) }),
    req.query,
  )

  const term = query.q ? likeTerm(query.q) : null
  const where: Prisma.PaymentWhereInput = {
    ...(term
      ? {
          OR: [
            { transaction_id: { contains: term } },
            { sender_number: { contains: term } },
            { account_number: { contains: term } },
            { order: { OR: [{ order_number: { contains: term } }, { customer_name: { contains: term } }, { customer_phone: { contains: term } }] } },
          ],
        }
      : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.method ? { method: query.method } : {}),
  }

  // Oldest first while reviewing so nobody waits longest; newest first otherwise.
  const direction = query.status === 'submitted' ? ('asc' as const) : ('desc' as const)

  const page = await paginate(
    req,
    query.per_page ?? 20,
    {
      count: () => prisma.payment.count({ where }),
      rows: ({ skip, take }) => prisma.payment.findMany({ where, include: paymentInclude, orderBy: [{ created_at: direction }, { id: direction }], skip, take }),
    },
    (payment) => paymentResource(req, payment),
  )

  const counts = await Promise.all(PAYMENT_REVIEW_STATUSES.map(async (status) => [status, await prisma.payment.count({ where: { status } })] as const))
  res.json({ ...page, counts: Object.fromEntries(counts) })
})

adminRouter.post('/payments/:payment/verify', async (req, res) => {
  const payment = await findPayment(req)
  await payments.verify(payment.id, currentUser(req))
  res.json({ data: paymentResource(req, await prisma.payment.findUniqueOrThrow({ where: { id: payment.id }, include: paymentInclude })) })
})

adminRouter.post('/payments/:payment/reject', async (req, res) => {
  const payment = await findPayment(req)
  const data = await validate(z.object({ reason: text(255).pipe(z.string().min(3, 'The :attribute field must be at least 3 characters.')) }), bodyOf(req))

  await payments.reject(payment.id, currentUser(req), data.reason)
  res.json({ data: paymentResource(req, await prisma.payment.findUniqueOrThrow({ where: { id: payment.id }, include: paymentInclude })) })
})

/* ----------------------------------------------------------------------------------------------
 | Reviews (publish immediately; staff hide or delete the ones that break the rules)
 * -------------------------------------------------------------------------------------------- */

const reviewInclude = { product: true, order: true }

async function findReview(req: Request) {
  const review = await prisma.productReview.findUnique({ where: { id: routeId(req.params.review) } })
  if (!review) notFound()
  return review!
}

adminRouter.get('/reviews', async (req, res) => {
  const query = await validate(
    z.object({ q: opt(text(100)), status: opt(oneOf(REVIEW_STATUSES)), rating: opt(intBetween(1, 5)), product_id: opt(int()), per_page: opt(int(1, 100)) }),
    req.query,
  )

  const term = query.q ? likeTerm(query.q) : null
  const where: Prisma.ProductReviewWhereInput = {
    ...(term
      ? {
          OR: [
            { comment: { contains: term } },
            { reviewer_name: { contains: term } },
            { reviewer_phone: { contains: term } },
            { reviewer_email: { contains: term } },
            { product: { name: { contains: term } } },
            { order: { order_number: { contains: term } } },
          ],
        }
      : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.rating ? { rating: query.rating } : {}),
    ...(query.product_id ? { product_id: query.product_id } : {}),
  }

  const page = await paginate(
    req,
    query.per_page ?? 20,
    {
      count: () => prisma.productReview.count({ where }),
      rows: ({ skip, take }) => prisma.productReview.findMany({ where, include: reviewInclude, orderBy: [latest, { id: 'desc' }], skip, take }),
    },
    (review) => reviewResource(req, review),
  )

  const counts = await Promise.all(REVIEW_STATUSES.map(async (status) => [status, await prisma.productReview.count({ where: { status } })] as const))
  res.json({ ...page, counts: Object.fromEntries(counts) })
})

put('/reviews/:review', async (req, res) => {
  const review = await findReview(req)
  const data = await validate(z.object({ status: oneOf(REVIEW_STATUSES) }), bodyOf(req))

  await reviews.setStatus(review, data.status)
  res.json({ data: reviewResource(req, await prisma.productReview.findUniqueOrThrow({ where: { id: review.id }, include: reviewInclude })) })
})

adminRouter.delete('/reviews/:review', async (req, res) => {
  await reviews.delete(await findReview(req))
  res.status(204).end()
})

/* ----------------------------------------------------------------------------------------------
 | Banners
 * -------------------------------------------------------------------------------------------- */

function bannerSchema(creating: boolean) {
  const required = <T extends z.ZodType>(schema: T) => (creating ? schema : schema.optional())
  return z.object({
    type: required(oneOf(BANNER_TYPES)),
    title: opt(text(255)),
    subtitle: opt(text(255)),
    image: required(url(2048)),
    link_url: opt(url(2048, true)),
    link_enabled: bool().optional(),
    is_active: bool().optional(),
    sort_order: int(0, 9999).optional(),
  })
}

async function findBanner(req: Request) {
  const banner = await prisma.banner.findUnique({ where: { id: routeId(req.params.banner) } })
  if (!banner) notFound()
  return banner!
}

adminRouter.get('/banners', async (req, res) => {
  const query = await validate(z.object({ type: opt(oneOf(BANNER_TYPES)) }), req.query)
  const banners = await prisma.banner.findMany({
    where: query.type ? { type: query.type } : {},
    orderBy: [{ type: 'asc' }, { sort_order: 'asc' }, { id: 'asc' }],
  })
  res.json({ data: banners.map(bannerResource) })
})

adminRouter.post('/banners', async (req, res) => {
  const data = await validate(bannerSchema(true), bodyOf(req))
  const banner = await prisma.banner.create({ data: { ...data, type: data.type!, image: data.image! } })
  res.status(201).json({ data: bannerResource(banner) })
})

adminRouter.get('/banners/:banner', async (req, res) => {
  res.json({ data: bannerResource(await findBanner(req)) })
})

put('/banners/:banner', async (req, res) => {
  const banner = await findBanner(req)
  const data = await validate(bannerSchema(false), bodyOf(req))
  res.json({ data: bannerResource(await prisma.banner.update({ where: { id: banner.id }, data })) })
})

adminRouter.delete('/banners/:banner', async (req, res) => {
  const banner = await findBanner(req)
  await prisma.banner.delete({ where: { id: banner.id } })
  res.status(204).end()
})

/* ----------------------------------------------------------------------------------------------
 | Pages
 * -------------------------------------------------------------------------------------------- */

adminRouter.get('/pages', async (_req, res) => {
  const pages = await prisma.page.findMany({ orderBy: { slug: 'asc' } })
  res.json({ data: pages.map(pageResource) })
})

adminRouter.get('/pages/:slug', async (req, res) => {
  const page = await prisma.page.findUnique({ where: { slug: String(req.params.slug) } })
  if (!page) notFound()
  res.json({ data: pageResource(page!) })
})

/** Create-or-update by slug (e.g. home, about, contact). `sections` is a free-form JSON array for page blocks. */
adminRouter.put('/pages/:slug', async (req, res) => {
  const pageSlug = String(req.params.slug)
  await validate(z.object({ slug: asciiDash(100) }), { slug: pageSlug })

  const data = await validate(
    z.object({
      title: text(255),
      content: opt(html(100000)),
      sections: opt(safeText(z.array(z.unknown()).max(50))),
      meta_title: opt(text(255)),
      meta_description: opt(text(500)),
      is_published: bool().optional(),
    }),
    bodyOf(req),
  )

  const { sections, ...fields } = data
  const values = { ...fields, ...(sections !== undefined ? { sections: json(sections) } : {}) }
  const existing = await prisma.page.findUnique({ where: { slug: pageSlug }, select: { id: true } })
  const page = existing
    ? await prisma.page.update({ where: { id: existing.id }, data: values })
    : await prisma.page.create({ data: { ...values, slug: pageSlug, title: fields.title } })

  res.status(existing ? 200 : 201).json({ data: pageResource(page) })
})

adminRouter.delete('/pages/:slug', async (req, res) => {
  const page = await prisma.page.findUnique({ where: { slug: String(req.params.slug) } })
  if (!page) notFound()
  await prisma.page.delete({ where: { id: page!.id } })
  res.status(204).end()
})

/* ----------------------------------------------------------------------------------------------
 | Shipping methods
 * -------------------------------------------------------------------------------------------- */

async function findShippingMethod(req: Request) {
  const method = await prisma.shippingMethod.findUnique({ where: { id: routeId(req.params.shippingMethod) } })
  if (!method) notFound()
  return method!
}

function shippingSchema(ignoreId: bigint | null) {
  const creating = ignoreId === null
  const required = <T extends z.ZodType>(schema: T) => (creating ? schema : schema.optional())
  const code = asciiDash(50).refine(
    async (value) => !(await prisma.shippingMethod.findFirst({ where: { code: value, ...(ignoreId ? { id: { not: ignoreId } } : {}) }, select: { id: true } })),
    'The code has already been taken.',
  )

  return z.object({
    code: creating ? opt(code) : code.optional(),
    title: required(text(255)),
    description: opt(text(255)),
    price: required(num(0, 100000, 2)),
    is_active: bool().optional(),
    sort_order: int(0, 9999).optional(),
  })
}

async function uniqueShippingCode(title: string): Promise<string> {
  const base = limit(slug(title), 40) || 'shipping'
  let code = base
  for (let i = 2; await prisma.shippingMethod.findFirst({ where: { code }, select: { id: true } }); i++) code = `${base}-${i}`
  return code
}

adminRouter.get('/shipping-methods', async (_req, res) => {
  const methods = await prisma.shippingMethod.findMany({ orderBy: [{ sort_order: 'asc' }, { id: 'asc' }] })
  res.json({ data: methods.map(shippingMethodResource) })
})

adminRouter.post('/shipping-methods', async (req, res) => {
  const data = await validate(shippingSchema(null), bodyOf(req))
  const method = await prisma.shippingMethod.create({
    data: { ...data, title: data.title!, price: data.price!, code: data.code || (await uniqueShippingCode(data.title!)) },
  })
  res.status(201).json({ data: shippingMethodResource(method) })
})

adminRouter.get('/shipping-methods/:shippingMethod', async (req, res) => {
  res.json({ data: shippingMethodResource(await findShippingMethod(req)) })
})

put('/shipping-methods/:shippingMethod', async (req, res) => {
  const method = await findShippingMethod(req)
  const { code, ...data } = await validate(shippingSchema(method.id), bodyOf(req))
  res.json({ data: shippingMethodResource(await prisma.shippingMethod.update({ where: { id: method.id }, data: { ...data, ...(code ? { code } : {}) } })) })
})

adminRouter.delete('/shipping-methods/:shippingMethod', async (req, res) => {
  const method = await findShippingMethod(req)
  await prisma.shippingMethod.delete({ where: { id: method.id } })
  res.status(204).end()
})

/* ----------------------------------------------------------------------------------------------
 | Admin only: users, where payments are sent, and site configuration
 * -------------------------------------------------------------------------------------------- */

const adminOnly = Router()
adminOnly.use(['/users', '/payment-accounts', '/settings'], requireRole('admin'))
adminRouter.use(adminOnly)

const adminPut = (path: string, handler: RequestHandler) => {
  adminOnly.put(path, handler)
  adminOnly.patch(path, handler)
}

const userCount = { _count: { select: { orders: true } } }

async function findUser(req: Request) {
  const user = await prisma.user.findUnique({ where: { id: routeId(req.params.user) } })
  if (!user) notFound()
  return user!
}

const uniqueUser = (field: 'email' | 'phone', ignoreId: bigint | null) => async (value: string) =>
  !(await prisma.user.findFirst({ where: { [field]: value, ...(ignoreId ? { id: { not: ignoreId } } : {}) }, select: { id: true } }))

const password = () => z.string().max(128).min(8, 'The :attribute field must be at least 8 characters.')

adminOnly.get('/users', async (req, res) => {
  const query = await validate(z.object({ q: opt(text(100)), role: opt(oneOf(USER_ROLES)), per_page: opt(int(1, 100)) }), req.query)
  const term = query.q ? likeTerm(query.q) : null
  const where: Prisma.UserWhereInput = {
    ...(term ? { OR: [{ name: { contains: term } }, { email: { contains: term } }, { phone: { contains: term } }] } : {}),
    ...(query.role ? { role: query.role } : {}),
  }

  res.json(
    await paginate(
      req,
      query.per_page ?? 20,
      { count: () => prisma.user.count({ where }), rows: ({ skip, take }) => prisma.user.findMany({ where, include: userCount, orderBy: latest, skip, take }) },
      userResource,
    ),
  )
})

adminOnly.post('/users', async (req, res) => {
  const data = await validate(
    z.object({
      name: text(255),
      email: lowercaseEmail(255).refine(uniqueUser('email', null), 'The email has already been taken.'),
      phone: opt(phone(32).refine(uniqueUser('phone', null), 'The phone has already been taken.')),
      password: password(),
      role: oneOf(USER_ROLES),
    }),
    bodyOf(req),
  )

  const user = await prisma.user.create({ data: { ...data, password: await hashPassword(data.password), email_verified_at: new Date() } })
  res.status(201).json({ data: userResource(user) })
})

adminOnly.get('/users/:user', async (req, res) => {
  const user = await findUser(req)
  res.json({ data: userResource(await prisma.user.findUniqueOrThrow({ where: { id: user.id }, include: userCount })) })
})

adminPut('/users/:user', async (req, res) => {
  const user = await findUser(req)
  const data = await validate(
    z.object({
      name: text(255).optional(),
      email: lowercaseEmail(255).refine(uniqueUser('email', user.id), 'The email has already been taken.').optional(),
      phone: opt(phone(32).refine(uniqueUser('phone', user.id), 'The phone has already been taken.')),
      role: oneOf(USER_ROLES).optional(),
      is_active: bool().optional(),
      password: password().optional(),
    }),
    bodyOf(req),
  )

  if (user.id === currentUser(req).id && (data.role !== undefined || data.is_active !== undefined)) {
    conflict('You cannot change your own role or status.')
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { ...data, ...(data.password !== undefined ? { password: await hashPassword(data.password) } : {}) },
    include: userCount,
  })

  if (!updated.is_active || data.password !== undefined || data.role !== undefined) await revokeUserSessions(user.id)

  res.json({ data: userResource(await prisma.user.findUniqueOrThrow({ where: { id: user.id }, include: userCount })) })
})

adminOnly.delete('/users/:user', async (req, res) => {
  const user = await findUser(req)
  if (user.id === currentUser(req).id) conflict('You cannot delete your own account.')

  await revokeUserSessions(user.id)
  await prisma.user.delete({ where: { id: user.id } })
  res.status(204).end()
})

/** Wallet accounts customers send money to. Admin-only: whoever edits these numbers controls where payments go. */
const accountCount = { _count: { select: { payments: true } } }

async function findAccount(req: Request) {
  const account = await prisma.paymentAccount.findUnique({ where: { id: routeId(req.params.paymentAccount) } })
  if (!account) notFound()
  return account!
}

async function validateAccount(req: Request, account: { id: bigint; method: string } | null) {
  const creating = account === null
  const required = <T extends z.ZodType>(schema: T) => (creating ? schema : schema.optional())
  const body = bodyOf(req)

  const number = body.account_number
  const input = typeof number === 'string' ? { ...body, account_number: number.replace(/[\s\-().]/g, '').replace(/^(\+?88)(?=01)/, '') } : body
  const method = (input.method ?? account?.method ?? null) as string | null

  // bKash and Nagad wallets are 11-digit BD mobile numbers; Rocket adds a 12th check digit.
  const pattern = method === 'rocket' ? /^01[3-9]\d{8}\d?$/ : /^01[3-9]\d{8}$/

  return validate(
    z.object({
      method: required(oneOf(WALLET_METHODS)),
      account_type: required(oneOf(ACCOUNT_TYPES)),
      account_number: required(
        z
          .string()
          .regex(pattern, 'Enter the wallet number as an 11-digit mobile number, e.g. 01712345678 (Rocket may have a 12th digit).')
          .refine(
            async (value) =>
              !(await prisma.paymentAccount.findFirst({
                where: { account_number: value, method: method ?? undefined, ...(account ? { id: { not: account.id } } : {}) },
                select: { id: true },
              })),
            'This number is already added for this wallet.',
          ),
      ),
      account_name: opt(text(100)),
      instructions: opt(text(1000)),
      is_active: bool().optional(),
      sort_order: int(0, 9999).optional(),
    }),
    input,
  )
}

adminOnly.get('/payment-accounts', async (req, res) => {
  const accounts = await prisma.paymentAccount.findMany({ include: accountCount, orderBy: [{ method: 'asc' }, { sort_order: 'asc' }, { id: 'asc' }] })
  res.json({ data: accounts.map((account) => paymentAccountResource(req, account)) })
})

adminOnly.post('/payment-accounts', async (req, res) => {
  const data = await validateAccount(req, null)
  const account = await prisma.paymentAccount.create({
    data: { ...data, method: data.method!, account_type: data.account_type!, account_number: data.account_number!, created_by: currentUser(req).id },
    include: accountCount,
  })
  res.status(201).json({ data: paymentAccountResource(req, account) })
})

adminOnly.get('/payment-accounts/:paymentAccount', async (req, res) => {
  const account = await findAccount(req)
  res.json({ data: paymentAccountResource(req, await prisma.paymentAccount.findUniqueOrThrow({ where: { id: account.id }, include: accountCount })) })
})

adminPut('/payment-accounts/:paymentAccount', async (req, res) => {
  const account = await findAccount(req)
  const data = await validateAccount(req, account)
  res.json({ data: paymentAccountResource(req, await prisma.paymentAccount.update({ where: { id: account.id }, data, include: accountCount })) })
})

/** Past payments keep a snapshot of the account number, so deleting is safe. */
adminOnly.delete('/payment-accounts/:paymentAccount', async (req, res) => {
  const account = await findAccount(req)
  await prisma.paymentAccount.delete({ where: { id: account.id } })
  res.status(204).end()
})

adminOnly.get('/settings', async (_req, res) => {
  res.json({ data: await settings.forAdmin() })
})

/** Body: { "settings": { "site_name": "...", "mail_port": 587, ... } } */
adminOnly.put('/settings', async (req, res) => {
  const raw = bodyOf(req).settings
  const values = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null

  if (!values || Object.keys(values).length === 0) {
    throw new ValidationError({ settings: [raw === undefined || raw === null || values ? 'The settings field is required.' : 'The settings field must be an array.'] })
  }

  const shape: Record<string, z.ZodType> = {}
  for (const key of Object.keys(values)) if (settingRegistry.has(key)) shape[key] = settingSchema(key)

  const data = await validate(z.object({ settings: z.object(shape) }), { settings: values }, () => {
    const unknown = Object.keys(values).filter((key) => !settingRegistry.has(key))
    return Object.fromEntries(unknown.map((key) => [`settings.${key}`, [`Unknown setting [${key}].`]]))
  })

  await settings.update(data.settings as Record<string, unknown>)
  res.json({ message: 'Settings saved.', data: await settings.forAdmin() })
})

adminOnly.post('/settings/test-mail', async (req, res) => {
  const data = await validate(z.object({ to: email(255) }), bodyOf(req))

  try {
    await sendMail(data.to, { subject: 'Mangrove Collection SMTP test', introLines: ['Your SMTP settings are working correctly.'] })
  } catch (error) {
    report(error)
    throw new HttpError(422, `Mail could not be sent: ${error instanceof Error ? error.message : String(error)}`)
  }

  res.json({ message: 'Test email sent.' })
})

adminOnly.post('/settings/test-sms', async (req, res) => {
  const data = await validate(z.object({ phone: phone(32) }), bodyOf(req))

  try {
    await sms.send(data.phone, 'Mangrove Collection SMS gateway test.')
  } catch (error) {
    throw new HttpError(422, `SMS could not be sent: ${error instanceof Error ? error.message : String(error)}`)
  }

  res.json({ message: 'Test SMS sent.' })
})

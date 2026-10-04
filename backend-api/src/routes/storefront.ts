import { Router, type Request } from 'express'
import { Prisma, type Product } from '../generated/prisma/client.js'
import { HttpError, fail, notFound, routeId } from '../lib/http.js'
import { paginate } from '../lib/paginate.js'
import { prisma } from '../lib/prisma.js'
import { likeTerm } from '../lib/str.js'
import { throttle } from '../middleware/rate-limit.js'
import {
  bannerResource,
  categoryResource,
  isWallet,
  orderResource,
  pageResource,
  paymentAccountResource,
  productResource,
  reviewResource,
  reviewerDisplayName,
  shippingMethodResource,
} from '../resources/index.js'
import { categoryIcons } from '../services/category-icons.js'
import { checkImage } from '../services/images.js'
import { orderInclude, orders, withLatestPayment } from '../services/orders.js'
import { PAYMENT_LABELS, PAYMENT_METHODS, payments, type PaymentMethod } from '../services/payments.js'
import { MAX_REVIEW_IMAGES, reviews } from '../services/reviews.js'
import { ReviewerIdentity } from '../services/reviewer-identity.js'
import { reviewImages } from '../services/images.js'
import { settings } from '../services/settings.js'
import { alphaDash, bool, email, int, intBetween, num, oneOf, opt, phone, text, transactionId, validate, z } from '../validation/index.js'
import { bodyOf, distinct, isFilled, listOf } from './helpers.js'

export const storefrontRouter = Router()

/** Published products in an active category (soft-deleted ones excluded). */
const publishedWhere = { status: 'published', deleted_at: null, category: { is_active: true } } satisfies Prisma.ProductWhereInput

/** Laravel's bare `abort(404)` (someone else's review or order is reported as missing, with an empty message). */
const abort404 = (): never => {
  throw new HttpError(404, '')
}

async function findPublished(slug: unknown): Promise<Product> {
  const product = await prisma.product.findFirst({ where: { ...publishedWhere, slug: String(slug) } })
  if (!product) notFound()
  return product!
}

storefrontRouter.get('/settings', async (_req, res) => {
  res.json({ data: await settings.public() })
})

storefrontRouter.get('/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    include: { _count: { select: { products: { where: { status: 'published', deleted_at: null } } } } },
    orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
  })
  res.json({ data: categories.map(categoryResource) })
})

storefrontRouter.get('/categories/:slug', async (req, res) => {
  const category = await prisma.category.findFirst({
    where: { is_active: true, slug: req.params.slug },
    include: { _count: { select: { products: { where: { status: 'published', deleted_at: null } } } } },
  })
  if (!category) notFound()
  res.json({ data: categoryResource(category!) })
})

/** The icon library rarely changes, so browsers and proxies may cache it for a day. */
storefrontRouter.get('/category-icons', (_req, res) => {
  res.set('Cache-Control', 'max-age=86400, public').json({ data: categoryIcons.all() })
})

const SORTS = ['latest', 'oldest', 'price_asc', 'price_desc', 'popular', 'rating', 'name'] as const

storefrontRouter.get('/products', async (req, res) => {
  const query = await validate(
    z.object({
      q: opt(text(100)),
      category: opt(z.string().max(255).regex(/^[A-Za-z0-9_-]+(,[A-Za-z0-9_-]+)*$/)),
      tag: opt(text(50)),
      featured: opt(bool()),
      min_price: opt(num(0)),
      max_price: opt(num(0)),
      sort: opt(oneOf(SORTS)),
      per_page: opt(int(1, 60)),
    }),
    req.query,
  )

  const where: Prisma.ProductWhereInput = { ...publishedWhere, AND: [] }
  const and = where.AND as Prisma.ProductWhereInput[]

  if (query.q) {
    const term = likeTerm(query.q)
    and.push({ OR: [{ name: { contains: term } }, { short_description: { contains: term } }] })
  }
  if (query.category) and.push({ category: { is_active: true, slug: { in: query.category.split(',') } } })
  if (query.tag) and.push({ tags: { array_contains: query.tag } })
  if (query.featured) and.push({ is_featured: true })
  if (query.min_price !== undefined && query.min_price !== null) and.push({ variants: { some: { price: { gte: query.min_price } } } })
  if (query.max_price !== undefined && query.max_price !== null) and.push({ variants: { some: { price: { lte: query.max_price } } } })

  const sort = query.sort ?? 'latest'
  const perPage = query.per_page ?? 20
  const include = { category: true, variants: { orderBy: [{ sort_order: 'asc' as const }, { id: 'asc' as const }] } }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === 'oldest'
      ? [{ created_at: 'asc' }]
      : sort === 'popular'
        ? [{ popularity: 'desc' }]
        : sort === 'rating'
          ? [{ rating_avg: 'desc' }, { rating_count: 'desc' }]
          : sort === 'name'
            ? [{ name: 'asc' }]
            : [{ created_at: 'desc' }]

  if (sort === 'price_asc' || sort === 'price_desc') {
    // Sorted by the cheapest variant; NULLs (no variants) first ascending, like MySQL.
    const rows = await prisma.product.findMany({ where, select: { id: true, variants: { select: { price: true } } } })
    const priced = rows
      .map((row) => ({ id: row.id, min: row.variants.length ? Math.min(...row.variants.map((v) => Number(v.price))) : null }))
      .sort((a, b) => {
        const direction = sort === 'price_asc' ? 1 : -1
        if (a.min === b.min) return Number(b.id - a.id)
        if (a.min === null) return -direction
        if (b.min === null) return direction
        return (a.min - b.min) * direction
      })

    res.json(
      await paginate(
        req,
        perPage,
        {
          count: async () => priced.length,
          rows: async ({ skip, take }) => {
            const page = priced.slice(skip, skip + take)
            const products = await prisma.product.findMany({ where: { id: { in: page.map((p) => p.id) } }, include })
            const byId = new Map(products.map((product) => [product.id, product]))
            return page.map((p) => ({ ...byId.get(p.id)!, min_price: p.min }))
          },
        },
        productResource,
      ),
    )
    return
  }

  res.json(
    await paginate(
      req,
      perPage,
      {
        count: () => prisma.product.count({ where }),
        rows: ({ skip, take }) => prisma.product.findMany({ where, include, orderBy: [...orderBy, { id: 'desc' }], skip, take }),
      },
      productResource,
    ),
  )
})

storefrontRouter.get('/products/:slug', async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { ...publishedWhere, slug: req.params.slug },
    include: {
      category: true,
      variants: { orderBy: [{ sort_order: 'asc' }, { id: 'asc' }] },
      images: { orderBy: [{ sort_order: 'asc' }, { id: 'asc' }] },
    },
  })
  if (!product) notFound()
  res.json({ data: productResource(product!) })
})

storefrontRouter.get('/products/:slug/related', async (req, res) => {
  const product = await findPublished(req.params.slug)
  const related = await prisma.product.findMany({
    where: { ...publishedWhere, category_id: product.category_id, id: { not: product.id } },
    include: { category: true, variants: { orderBy: [{ sort_order: 'asc' }, { id: 'asc' }] } },
    orderBy: { popularity: 'desc' },
    take: 8,
  })
  res.json({ data: related.map(productResource) })
})

/* ----------------------------------------------------------------------------------------------
 | Reviews
 * -------------------------------------------------------------------------------------------- */

const REVIEW_MESSAGES = {
  can_review: 'Thanks for shopping with us! Share your experience with this product.',
  already_reviewed: 'You have already reviewed this product. You can edit or delete your review below.',
  not_delivered: 'Your order is on its way. You can review this product once it has been delivered.',
  no_order: 'We could not find a delivered order for this product with that phone number or email. Only customers who received it can leave a review.',
} as const

/** Published reviews with a rating summary. Query: rating (1-5), with_photos, sort (newest|highest|lowest), page. */
storefrontRouter.get('/products/:slug/reviews', async (req, res) => {
  const query = await validate(
    z.object({
      rating: opt(intBetween(1, 5)),
      with_photos: opt(bool()),
      sort: opt(oneOf(['newest', 'highest', 'lowest'])),
      per_page: opt(int(1, 30)),
    }),
    req.query,
  )

  const product = await findPublished(req.params.slug)
  const published = { product_id: product.id, status: 'published' }
  const withPhotos = { images: { not: Prisma.DbNull } }

  const where: Prisma.ProductReviewWhereInput = {
    ...published,
    ...(query.rating ? { rating: query.rating } : {}),
    ...(query.with_photos ? withPhotos : {}),
  }
  const orderBy: Prisma.ProductReviewOrderByWithRelationInput[] = [
    ...(query.sort === 'highest' ? [{ rating: 'desc' as const }] : query.sort === 'lowest' ? [{ rating: 'asc' as const }] : []),
    { created_at: 'desc' },
    { id: 'desc' },
  ]

  const page = await paginate(
    req,
    query.per_page ?? 10,
    {
      count: () => prisma.productReview.count({ where }),
      rows: ({ skip, take }) => prisma.productReview.findMany({ where, orderBy, skip, take }),
    },
    (review) => reviewResource(req, review),
  )

  const breakdown = await prisma.productReview.groupBy({ by: ['rating'], where: published, _count: { _all: true } })
  const counts = new Map(breakdown.map((row) => [row.rating, row._count._all]))

  res.json({
    ...page,
    summary: {
      average: Number(product.rating_avg),
      count: product.rating_count,
      breakdown: Object.fromEntries([5, 4, 3, 2, 1].map((star) => [star, counts.get(star) ?? 0])),
      with_photos: await prisma.productReview.count({ where: { ...published, ...withPhotos } }),
    },
  })
})

/**
 * Quick buyer check with one input — the phone number or email used on the order
 * (signed-in customers can skip it). Returns a short-lived token that authorises
 * writing, editing or deleting this customer's review.
 */
storefrontRouter.post('/products/:slug/reviews/verify', throttle('review-verify'), async (req, res) => {
  const data = await validate(z.object({ contact: opt(text(255)) }), bodyOf(req))
  const product = await findPublished(req.params.slug)

  let identity: ReviewerIdentity | null
  if (data.contact) {
    identity = ReviewerIdentity.fromContact(data.contact)
    if (!identity) fail('contact', 'Enter the mobile number (e.g. 01712345678) or email address you used when ordering.')
  } else if (req.user) {
    identity = ReviewerIdentity.fromUser(req.user)
  } else {
    fail('contact', 'Enter the mobile number or email address you used when ordering.')
  }

  const check = await reviews.check(product, identity!)
  const eligible = check.status === 'can_review' || check.status === 'already_reviewed'

  res.json({
    data: {
      status: check.status,
      eligible,
      message: REVIEW_MESSAGES[check.status],
      token: eligible ? identity!.toToken(product.id) : null,
      expires_in: eligible ? ReviewerIdentity.TOKEN_TTL_SECONDS : null,
      reviewer_name: check.order ? reviewerDisplayName(check.order.customer_name) : null,
      review: check.review ? reviewResource(req, check.review) : null,
    },
  })
})

/** Collapses Windows newlines and runs of blank lines, like the Laravel request did. */
const normalizeComment = (value: unknown) => (typeof value === 'string' ? value.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim() : value)

async function validateReview(req: Request) {
  const body = bodyOf(req)
  const files = req.uploads?.images ?? []
  const keep = body.keep_images

  const data = await validate(
    z.object({
      rating: intBetween(1, 5),
      comment: z.preprocess(normalizeComment, text(1000).pipe(z.string().min(10, 'The :attribute field must be at least 10 characters.'))),
      keep_images: opt(
        z
          .array(
            z
              .string()
              .max(255)
              .refine((path) => reviewImages.isOwnPath(path), 'One of the kept photos is invalid.'),
          )
          .max(MAX_REVIEW_IMAGES),
      ),
    }),
    { ...body, keep_images: keep === undefined || keep === null ? keep : Array.isArray(keep) ? keep : [keep] },
    { attributes: { comment: 'review' } },
    async () => {
      const errors: Record<string, string[]> = {}
      if (files.length > MAX_REVIEW_IMAGES) errors.images = [`You can add up to ${MAX_REVIEW_IMAGES} photos.`]

      for (const [index, file] of files.entries()) {
        const result = await checkImage(file, `images.${index}`, {
          attribute: 'photo',
          formats: ['jpeg', 'png', 'webp'],
          mimesLabel: 'jpg, jpeg, png, webp',
          maxKilobytes: 5120,
          maxMessage: 'Each photo must be 5 MB or smaller.',
          dimensions: { minWidth: 200, minHeight: 200, maxWidth: 4096, maxHeight: 4096 },
          dimensionsMessage: 'Each photo must be between 200 and 4096 pixels wide and tall.',
        })
        Object.assign(errors, result.errors)
      }
      return errors
    },
  )

  return { data: { rating: data.rating, comment: data.comment as string }, kept: data.keep_images ?? [], files }
}

function reviewIdentity(req: Request, productId: bigint): ReviewerIdentity {
  const identity = ReviewerIdentity.fromToken(req.get('x-review-token'), productId)
  if (!identity) throw new HttpError(403, 'Your check has expired. Please confirm your phone number or email again.')
  return identity
}

async function ownedReview(req: Request) {
  const review = await prisma.productReview.findUnique({ where: { id: routeId(req.params.review) } })
  if (!review) notFound()
  return review!
}

storefrontRouter.post('/products/:slug/reviews', throttle('uploads'), async (req, res) => {
  const { data, files } = await validateReview(req)
  const product = await findPublished(req.params.slug)
  const identity = reviewIdentity(req, product.id)

  const review = await reviews.create(product, identity, data, files)
  res.status(201).json({ data: reviewResource(req, review) })
})

const updateReview = async (req: Request, res: import('express').Response) => {
  const review = await ownedReview(req)
  const { data, kept, files } = await validateReview(req)
  if (!reviewIdentity(req, review.product_id).owns(review)) abort404()

  res.json({ data: reviewResource(req, await reviews.update(review, data, kept, files)) })
}
storefrontRouter.put('/reviews/:review', throttle('uploads'), updateReview)
storefrontRouter.patch('/reviews/:review', throttle('uploads'), updateReview)

storefrontRouter.delete('/reviews/:review', throttle('writes'), async (req, res) => {
  const review = await ownedReview(req)
  if (!reviewIdentity(req, review.product_id).owns(review)) abort404()

  await reviews.delete(review)
  res.status(204).end()
})

/* ----------------------------------------------------------------------------------------------
 | Content
 * -------------------------------------------------------------------------------------------- */

storefrontRouter.get('/banners', async (req, res) => {
  const query = await validate(z.object({ type: opt(oneOf(['slide', 'right_top', 'right_bottom'])) }), req.query)
  const banners = await prisma.banner.findMany({
    where: { is_active: true, ...(query.type ? { type: query.type } : {}) },
    orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
  })
  res.json({ data: banners.map(bannerResource) })
})

storefrontRouter.get('/pages/:slug', async (req, res) => {
  const page = await prisma.page.findFirst({ where: { slug: req.params.slug, is_published: true } })
  if (!page) notFound()
  res.json({ data: pageResource(page!) })
})

/**
 * Newsletter sign-up. The reply is the same whether the address is new, already subscribed or
 * coming back after unsubscribing, so the form can't be used to find out who is on the list.
 */
storefrontRouter.post('/newsletter', throttle('newsletter'), async (req, res) => {
  const data = await validate(
    z.object({
      email: z.preprocess((value) => (typeof value === 'string' ? value.trim().toLowerCase() : value), email(255)),
      source: opt(alphaDash(50)),
    }),
    bodyOf(req),
  )

  await prisma.newsletterSubscriber.upsert({
    where: { email: data.email },
    create: { email: data.email, source: data.source ?? null, ip_address: req.ip ?? null },
    update: { status: 'subscribed', unsubscribed_at: null },
  })

  res.json({ message: "Thanks for subscribing! You'll be the first to hear about fresh arrivals and offers." })
})

storefrontRouter.get('/shipping-methods', async (_req, res) => {
  const methods = await prisma.shippingMethod.findMany({ where: { is_active: true }, orderBy: [{ sort_order: 'asc' }, { price: 'asc' }] })
  res.json({ data: methods.map(shippingMethodResource) })
})

/** Payment options for checkout: cash on delivery (when enabled) and every wallet with at least one active account. */
storefrontRouter.get('/payment-methods', async (req, res) => {
  const options = await payments.availableMethods()
  res.json({
    data: options.map((option) => ({
      method: option.method,
      label: PAYMENT_LABELS[option.method],
      accounts: option.accounts.map((account) => paymentAccountResource(req, account)),
    })),
  })
})

/* ----------------------------------------------------------------------------------------------
 | Checkout
 * -------------------------------------------------------------------------------------------- */

const cartItems = z
  .array(z.object({ variant_id: int(), quantity: int(1, 100) }))
  .min(1, 'The :attribute field is required.')
  .max(50)

const CHECKOUT_ATTRIBUTES = {
  'items.*.variant_id': 'product',
  'items.*.quantity': 'quantity',
  shipping_method_id: 'delivery method',
  payment_account_id: 'payment account',
  transaction_id: 'transaction ID',
  payment_sender_number: 'sender number',
  'address.name': 'name',
  'address.email': 'email',
  'address.phone': 'phone number',
  'address.region': 'division',
  'address.city': 'district / city',
  'address.zone': 'area',
  'address.landmark': 'landmark',
  'address.full_address': 'full address',
}

/** Guests and signed-in customers can both check out; a session cookie, when present, links the order to the account. */
storefrontRouter.post('/checkout', throttle('checkout'), async (req, res) => {
  const body = bodyOf(req)
  const wallet = typeof body.payment_method === 'string' && isWallet(body.payment_method)
  const usingSaved = isFilled(body.address_id)
  const user = req.user

  const input = {
    ...body,
    items: listOf(body.items),
    ...(wallet ? {} : { payment_account_id: null, transaction_id: null, payment_sender_number: null }),
  }

  const required = <T extends z.ZodType>(schema: T, isRequired: boolean) => (isRequired ? schema : opt(schema))
  const savedAddress = usingSaved && user && /^\d+$/.test(String(body.address_id)) ? await prisma.address.findFirst({ where: { id: BigInt(String(body.address_id)), user_id: user.id } }) : null

  const data = await validate(
    z.object({
      items: cartItems,
      shipping_method_id: int(),
      payment_method: oneOf(PAYMENT_METHODS),
      payment_account_id: opt(int()),
      transaction_id: required(transactionId(), wallet),
      payment_sender_number: required(phone(32), wallet),
      customer_note: opt(text(1000)),
      address_id: opt(int()),
      address: required(
        z.object({
          name: required(text(255), !usingSaved),
          email: opt(email(255)),
          phone: required(phone(32), !usingSaved),
          region: opt(text(255)),
          city: opt(text(255)),
          zone: opt(text(255)),
          landmark: opt(text(255)),
          full_address: required(text(1000), !usingSaved),
        }),
        !usingSaved,
      ),
      save_address: bool().optional(),
    }),
    input,
    { attributes: CHECKOUT_ATTRIBUTES },
    distinct('items', 'variant_id', 'product'),
    Object.assign(
      () => {
        // Laravel also reports the required nested fields when the address object itself is missing.
        const address = body.address
        if (usingSaved || (address && typeof address === 'object' && !Array.isArray(address))) return undefined
        return {
          'address.name': ['The name field is required.'],
          'address.phone': ['The phone number field is required.'],
          'address.full_address': ['The full address field is required.'],
        }
      },
      { prepend: true },
    ),
    () => (usingSaved && !savedAddress ? { address_id: ['The selected address is invalid.'] } : undefined),
  )

  const address = savedAddress
    ? {
        name: savedAddress.name,
        email: savedAddress.email,
        phone: savedAddress.phone,
        region: savedAddress.region,
        city: savedAddress.city,
        zone: savedAddress.zone,
        landmark: savedAddress.landmark,
        full_address: savedAddress.full_address,
      }
    : {
        name: data.address!.name!,
        email: data.address!.email ?? null,
        phone: data.address!.phone!,
        region: data.address!.region ?? null,
        city: data.address!.city ?? null,
        zone: data.address!.zone ?? null,
        landmark: data.address!.landmark ?? null,
        full_address: data.address!.full_address!,
      }

  const order = await orders.place(
    {
      items: data.items,
      shipping_method_id: data.shipping_method_id,
      payment_method: data.payment_method as PaymentMethod,
      payment_account_id: data.payment_account_id ?? null,
      transaction_id: (data.transaction_id as string | null | undefined) ?? null,
      payment_sender_number: data.payment_sender_number ?? null,
      customer_note: data.customer_note ?? null,
      address,
    },
    user,
  )

  if (user && data.save_address && !usingSaved) {
    const hasAddress = (await prisma.address.count({ where: { user_id: user.id } })) > 0
    await prisma.address.create({ data: { ...address, user_id: user.id, is_default: !hasAddress } })
  }

  res.status(201).json({ data: orderResource(req, order) })
})

/** Current prices and delivery charges for the cart; the order itself is priced the same way. */
storefrontRouter.post('/checkout/quote', throttle('quote'), async (req, res) => {
  const body = bodyOf(req)
  const data = await validate(z.object({ items: cartItems }), { ...body, items: listOf(body.items) }, distinct('items', 'variant_id'))
  res.json({ data: await orders.quote(data.items) })
})

/** Guest order tracking: requires both the order number and the phone used. */
storefrontRouter.get('/orders/track', throttle('tracking'), async (req, res) => {
  const data = await validate(
    z.object({
      order_number: z
        .string()
        .max(32)
        .regex(/^[A-Za-z0-9-]+$/),
      phone: phone(32),
    }),
    req.query,
  )

  const order = await prisma.order.findFirst({ where: { order_number: data.order_number, customer_phone: data.phone }, include: orderInclude })
  if (!order || order.customer_phone !== data.phone) notFound()
  res.json({ data: orderResource(req, withLatestPayment(order!)) })
})

/** Submit (or re-submit after a rejection) a wallet transaction ID. Owners may submit while signed in; guests give the order phone. */
storefrontRouter.post('/orders/:orderNumber/payment', throttle('checkout'), async (req, res) => {
  const data = await validate(
    z.object({
      payment_account_id: int(),
      transaction_id: transactionId(),
      payment_sender_number: phone(32),
      phone: opt(phone(32)),
    }),
    bodyOf(req),
    { attributes: { payment_account_id: 'payment account', transaction_id: 'transaction ID', payment_sender_number: 'sender number' } },
  )

  const order = await prisma.order.findUnique({ where: { order_number: String(req.params.orderNumber) } })
  const user = req.user
  const authorized = order && ((user && order.user_id === user.id) || (data.phone && order.customer_phone === data.phone))
  if (!authorized) abort404()

  await payments.resubmit(order!.id, data.payment_account_id, data.transaction_id as string, data.payment_sender_number)

  const fresh = await prisma.order.findUniqueOrThrow({ where: { id: order!.id }, include: orderInclude })
  res.json({ data: orderResource(req, withLatestPayment(fresh)) })
})

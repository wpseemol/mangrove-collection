import type { Request } from 'express'
import { isStaff } from '../auth/guards.js'
import type {
  Address,
  Banner,
  Category,
  Media,
  Order,
  OrderItem,
  Page,
  Payment,
  PaymentAccount,
  Product,
  ProductImage,
  ProductReview,
  ProductVariant,
  ShippingMethod,
  User,
} from '../generated/prisma/client.js'
import { storage, type Disk } from '../lib/storage.js'
import { id, iso, num, numOrNull } from '../lib/serialize.js'
import { categoryIcons } from '../services/category-icons.js'
import { categoryImages, reviewImages } from '../services/images.js'

type Json = Record<string, unknown>

const staff = (req: Request) => (req.user ? isStaff(req.user) : false)

/** Adds `key` only when `value` is not undefined (Laravel's `whenLoaded` / `when`). */
function when(target: Json, key: string, value: unknown): void {
  if (value !== undefined) target[key] = value
}

export const ACCOUNT_ACTIONS: Record<string, string> = { personal: 'Send Money', agent: 'Cash Out', merchant: 'Payment' }

export const hasStockFor = (variant: Pick<ProductVariant, 'stock'>, quantity: number) => variant.stock === null || variant.stock >= quantity

export function userResource(user: User & { _count?: { orders?: number } }): Json {
  const out: Json = {
    id: id(user.id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    is_active: user.is_active,
    has_password: user.password !== null,
    google_linked: user.google_id !== null,
    email_verified_at: iso(user.email_verified_at),
    last_login_at: iso(user.last_login_at),
  }
  when(out, 'orders_count', user._count?.orders)
  out.created_at = iso(user.created_at)
  return out
}

export function addressResource(address: Address): Json {
  return {
    id: id(address.id),
    label: address.label,
    name: address.name,
    email: address.email,
    phone: address.phone,
    region: address.region,
    city: address.city,
    zone: address.zone,
    landmark: address.landmark,
    full_address: address.full_address,
    is_default: address.is_default,
    created_at: iso(address.created_at),
  }
}

export function categoryResource(category: Category & { _count?: { products?: number } }): Json {
  const out: Json = {
    id: id(category.id),
    name: category.name,
    slug: category.slug,
    image: categoryImages.url(category.image),
    icon: category.icon,
    icon_nodes: categoryIcons.find(category.icon)?.nodes ?? null,
    description: category.description,
    is_active: category.is_active,
    sort_order: category.sort_order,
  }
  when(out, 'products_count', category._count?.products)
  out.created_at = iso(category.created_at)
  out.updated_at = iso(category.updated_at)
  return out
}

export function variantResource(variant: ProductVariant): Json {
  return {
    id: id(variant.id),
    title: variant.title,
    type: variant.type,
    sku: variant.sku,
    price: num(variant.price),
    compare_price: numOrNull(variant.compare_price),
    stock: variant.stock,
    in_stock: hasStockFor(variant, 1),
    is_default: variant.is_default,
    sort_order: variant.sort_order,
  }
}

export type ProductWith = Product & {
  category?: Category
  variants?: ProductVariant[]
  images?: ProductImage[]
  min_price?: number | null
}

export function productResource(product: ProductWith): Json {
  const variants = product.variants
  const fallback = variants ? (variants.find((variant) => variant.is_default) ?? variants[0] ?? null) : null
  const minPrice = product.min_price ?? (variants && variants.length > 0 ? Math.min(...variants.map((v) => num(v.price))) : null)

  const out: Json = { id: id(product.id), name: product.name, slug: product.slug }
  when(out, 'category', product.category ? categoryResource(product.category) : undefined)
  Object.assign(out, {
    unit: product.unit,
    size: product.size,
    shipping_cost: numOrNull(product.shipping_cost),
    currency: product.currency,
  })
  if (fallback || minPrice !== null) out.price = fallback ? num(fallback.price) : minPrice
  if (fallback) out.compare_price = numOrNull(fallback.compare_price)
  when(out, 'in_stock', variants ? variants.some((variant) => hasStockFor(variant, 1)) : undefined)
  Object.assign(out, {
    short_description: product.short_description,
    description: product.description,
    thumbnail: product.thumbnail,
  })
  when(out, 'images', product.images?.map((image) => ({ id: id(image.id), url: image.url, alt: image.alt })))
  when(out, 'variants', variants?.map(variantResource))
  Object.assign(out, {
    tags: product.tags ?? [],
    status: product.status,
    is_featured: product.is_featured,
    popularity: product.popularity,
    rating: { average: num(product.rating_avg), count: product.rating_count },
    meta_title: product.meta_title,
    meta_description: product.meta_description,
    created_at: iso(product.created_at),
    updated_at: iso(product.updated_at),
  })
  return out
}

export type PaymentWith = Payment & { reviewer?: User | null; order?: Order }

export function paymentResource(req: Request, payment: PaymentWith): Json {
  const isStaffUser = staff(req)
  const out: Json = {
    id: id(payment.id),
    method: payment.method,
    account_type: payment.account_type,
    action: payment.account_type ? (ACCOUNT_ACTIONS[payment.account_type] ?? null) : null,
    account_number: payment.account_number,
    amount: num(payment.amount),
    currency: payment.currency,
    sender_number: payment.sender_number,
    transaction_id: payment.transaction_id,
    status: payment.status,
    rejection_reason: payment.rejection_reason,
    reviewed_at: iso(payment.reviewed_at),
  }
  if (isStaffUser && payment.reviewer !== undefined) out.reviewer = payment.reviewer ? { id: id(payment.reviewer.id), name: payment.reviewer.name } : null
  if (isStaffUser && payment.order) {
    out.order = {
      id: id(payment.order.id),
      order_number: payment.order.order_number,
      customer_name: payment.order.customer_name,
      customer_phone: payment.order.customer_phone,
      total: num(payment.order.total),
      currency: payment.order.currency,
      status: payment.order.status,
      payment_status: payment.order.payment_status,
      created_at: iso(payment.order.created_at),
    }
  }
  out.created_at = iso(payment.created_at)
  return out
}

export function paymentAccountResource(req: Request, account: PaymentAccount & { _count?: { payments?: number } }): Json {
  const isStaffUser = staff(req)
  const out: Json = {
    id: id(account.id),
    method: account.method,
    account_type: account.account_type,
    action: ACCOUNT_ACTIONS[account.account_type] ?? null,
    account_number: account.account_number,
    account_name: account.account_name,
    instructions: account.instructions,
  }
  if (isStaffUser) {
    out.is_active = account.is_active
    out.sort_order = account.sort_order
  }
  when(out, 'payments_count', account._count?.payments)
  if (isStaffUser) {
    out.created_at = iso(account.created_at)
    out.updated_at = iso(account.updated_at)
  }
  return out
}

export const WALLET_METHODS = ['bkash', 'nagad', 'rocket'] as const
export const isWallet = (method: string) => (WALLET_METHODS as readonly string[]).includes(method)

/** A customer may send (or re-send) a wallet transaction ID while the order is open and nothing is paid or under review. */
export const acceptsPaymentSubmission = (order: Pick<Order, 'payment_method' | 'status' | 'payment_status'>) =>
  isWallet(order.payment_method) && order.status !== 'cancelled' && ['pending', 'failed'].includes(order.payment_status)

export type OrderWith = Order & {
  items?: OrderItem[]
  user?: User | null
  payments?: PaymentWith[]
  latestPayment?: PaymentWith | null
  _count?: { items?: number }
}

export function orderResource(req: Request, order: OrderWith): Json {
  const isStaffUser = staff(req)
  const out: Json = {
    id: id(order.id),
    order_number: order.order_number,
    status: order.status,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
  }
  when(out, 'payment', order.latestPayment === undefined ? undefined : order.latestPayment ? paymentResource(req, order.latestPayment) : null)
  if (isStaffUser && order.payments) out.payments = order.payments.map((payment) => paymentResource(req, payment))
  Object.assign(out, {
    can_submit_payment: acceptsPaymentSubmission(order),
    customer: { name: order.customer_name, email: order.customer_email, phone: order.customer_phone },
    shipping_address: order.shipping_address,
    shipping_method: order.shipping_method_title,
    currency: order.currency,
    subtotal: num(order.subtotal),
    shipping_cost: num(order.shipping_cost),
    discount: num(order.discount),
    total: num(order.total),
    customer_note: order.customer_note,
  })
  if (isStaffUser) out.admin_note = order.admin_note
  if (isStaffUser && order.user !== undefined) out.user = order.user ? userResource(order.user) : null
  when(
    out,
    'items',
    order.items?.map((item) => ({
      id: id(item.id),
      product_id: id(item.product_id),
      product_variant_id: id(item.product_variant_id),
      product_name: item.product_name,
      product_slug: item.product_slug,
      variant_title: item.variant_title,
      image: item.image,
      unit_price: num(item.unit_price),
      quantity: item.quantity,
      line_total: num(item.line_total),
    })),
  )
  when(out, 'items_count', order._count?.items)
  Object.assign(out, {
    can_cancel: order.status === 'pending',
    cancelled_at: iso(order.cancelled_at),
    delivered_at: iso(order.delivered_at),
    created_at: iso(order.created_at),
    updated_at: iso(order.updated_at),
  })
  return out
}

/** "Rahim Uddin" → "Rahim U." so buyers' full names are never published. */
export function reviewerDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/u).filter(Boolean)
  const first = parts[0] ?? ''
  if (first === '') return 'Verified buyer'
  return parts.length > 1 ? `${first} ${[...parts[parts.length - 1]][0].toLocaleUpperCase()}.` : first
}

export const reviewImagePaths = (images: unknown): string[] => (Array.isArray(images) ? images.filter((path): path is string => typeof path === 'string') : [])

export type ReviewWith = ProductReview & { product?: Product | null; order?: Order | null }

/** Public view shows a shortened name only; contact details and the order are staff-only. */
export function reviewResource(req: Request, review: ReviewWith): Json {
  const out: Json = {
    id: id(review.id),
    rating: review.rating,
    comment: review.comment,
    images: reviewImagePaths(review.images).map((path) => ({ path, url: reviewImages.url(path) })),
    reviewer_name: reviewerDisplayName(review.reviewer_name),
    verified_purchase: true,
    status: review.status,
    edited_at: iso(review.edited_at),
    created_at: iso(review.created_at),
  }

  if (staff(req) && review.product !== undefined) {
    out.reviewer = { name: review.reviewer_name, phone: review.reviewer_phone, email: review.reviewer_email }
    out.order = review.order ? { id: id(review.order.id), order_number: review.order.order_number } : null
    out.product = review.product ? { id: id(review.product.id), name: review.product.name, slug: review.product.slug, thumbnail: review.product.thumbnail } : null
  }

  return out
}

export function bannerResource(banner: Banner): Json {
  return {
    id: id(banner.id),
    type: banner.type,
    title: banner.title,
    subtitle: banner.subtitle,
    image: banner.image,
    link_url: banner.link_url,
    link_enabled: banner.link_enabled,
    is_active: banner.is_active,
    sort_order: banner.sort_order,
  }
}

export function pageResource(page: Page): Json {
  return {
    id: id(page.id),
    slug: page.slug,
    title: page.title,
    content: page.content,
    sections: page.sections ?? [],
    meta_title: page.meta_title,
    meta_description: page.meta_description,
    is_published: page.is_published,
    updated_at: iso(page.updated_at),
  }
}

export function shippingMethodResource(method: ShippingMethod): Json {
  return {
    id: id(method.id),
    code: method.code,
    title: method.title,
    description: method.description,
    price: num(method.price),
    is_active: method.is_active,
    sort_order: method.sort_order,
  }
}

export function mediaResource(media: Media): Json {
  return {
    id: id(media.id),
    url: storage.url(media.disk as Disk, media.path),
    path: media.path,
    original_name: media.original_name,
    mime_type: media.mime_type,
    size: Number(media.size),
    created_at: iso(media.created_at),
  }
}

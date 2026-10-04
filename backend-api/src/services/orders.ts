import type { Order, OrderItem, Prisma, Product, ProductVariant, ShippingMethod, User } from '../generated/prisma/client.js'
import { failMany, fail } from '../lib/http.js'
import { report } from '../lib/log.js'
import { prisma, type Tx } from '../lib/prisma.js'
import { num, round } from '../lib/serialize.js'
import { formatNumber, randomUpper } from '../lib/str.js'
import { hasStockFor, isWallet, type OrderWith } from '../resources/index.js'
import { sendMail } from './mail.js'
import { payments, type PaymentMethod } from './payments.js'
import { settings } from './settings.js'
import { sms } from './sms.js'

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]
export const PAYMENT_STATUSES = ['pending', 'verifying', 'paid', 'failed', 'refunded'] as const

export type CartItem = { variant_id: number; quantity: number }

export type AddressInput = {
  name: string
  phone: string
  email?: string | null
  region?: string | null
  city?: string | null
  zone?: string | null
  landmark?: string | null
  full_address: string
}

export type PlaceOrderData = {
  items: CartItem[]
  shipping_method_id: number
  address: AddressInput
  payment_method: PaymentMethod
  payment_account_id?: number | null
  transaction_id?: string | null
  payment_sender_number?: string | null
  customer_note?: string | null
}

/** Orders taken by staff (phone, Facebook, walk-in): catalog prices, optional discount and delivery charge override. */
export type StaffOrderData = {
  items: CartItem[]
  shipping_method_id: number
  address: AddressInput
  payment_method: PaymentMethod
  payment_status: (typeof PAYMENT_STATUSES)[number]
  status: OrderStatus
  shipping_cost?: number | null
  discount?: number | null
  customer_note?: string | null
  admin_note?: string | null
  user_id?: bigint | null
}

type VariantWithProduct = ProductVariant & { product: Product }

function quantities(items: CartItem[]): Map<number, number> {
  const grouped = new Map<number, number>()
  for (const item of items) grouped.set(Number(item.variant_id), (grouped.get(Number(item.variant_id)) ?? 0) + Number(item.quantity))
  return grouped
}

const extraShippingFor = (product: Product, quantity: number) => round(num(product.shipping_cost) * quantity, 2)

async function qualifiesForFreeShipping(subtotal: number): Promise<boolean> {
  const threshold = await settings.get<number | null>('free_shipping_threshold')
  return threshold !== null && threshold > 0 && subtotal >= threshold
}

/** The method's base rate plus each product's extra charge, or nothing once the order reaches the free-shipping threshold. */
export async function shippingCostFor(method: ShippingMethod, subtotal: number, extraShipping = 0): Promise<number> {
  if (await qualifiesForFreeShipping(subtotal)) return 0
  return round(num(method.price) + extraShipping, 2)
}

type PricedLine = { variant: VariantWithProduct; quantity: number; lineTotal: number }

/** Locks the variants, rejects unavailable or under-stocked lines, and prices the rest at catalog prices. */
async function priceLines(tx: Tx, items: CartItem[]) {
  const wanted = quantities(items)
  const ids = [...wanted.keys()].map(BigInt)

  if (ids.length) await tx.$queryRawUnsafe(`SELECT id FROM product_variants WHERE id IN (${ids.map(() => '?').join(',')}) FOR UPDATE`, ...ids)

  const variants = new Map<number, VariantWithProduct>(
    (await tx.productVariant.findMany({ where: { id: { in: ids } }, include: { product: true } })).map((variant) => [Number(variant.id), variant]),
  )

  const errors: Record<string, string[]> = {}
  const lines: PricedLine[] = []
  let subtotal = 0
  let extraShipping = 0

  for (const [variantId, quantity] of wanted) {
    const variant = variants.get(variantId)
    const product = variant?.product

    if (!variant || !product || product.deleted_at !== null || product.status !== 'published') {
      errors[`items.${variantId}`] = ['One of the products in your cart is no longer available.']
      continue
    }
    if (!hasStockFor(variant, quantity)) {
      errors[`items.${variantId}`] = [`Only ${variant.stock} unit(s) of ${product.name} (${variant.title}) are in stock.`]
      continue
    }

    const lineTotal = round(num(variant.price) * quantity, 2)
    subtotal += lineTotal
    extraShipping += extraShippingFor(product, quantity)
    lines.push({ variant, quantity, lineTotal })
  }

  if (Object.keys(errors).length > 0) failMany(errors)

  return { lines, subtotal: round(subtotal, 2), extraShipping }
}

async function createOrder(tx: Tx, lines: PricedLine[], data: Prisma.OrderUncheckedCreateInput): Promise<Order> {
  const created = await tx.order.create({ data })

  for (const { variant, quantity, lineTotal } of lines) {
    await tx.orderItem.create({
      data: {
        order_id: created.id,
        product_id: variant.product.id,
        product_variant_id: variant.id,
        product_name: variant.product.name,
        product_slug: variant.product.slug,
        variant_title: variant.title,
        image: variant.product.thumbnail,
        unit_price: variant.price,
        quantity,
        line_total: lineTotal,
      },
    })

    if (variant.stock !== null) await tx.productVariant.update({ where: { id: variant.id }, data: { stock: { decrement: quantity } } })
    await tx.product.update({ where: { id: variant.product.id }, data: { popularity: { increment: quantity } } })
  }

  return created
}

async function restoreStock(tx: Tx, orderId: bigint): Promise<void> {
  const items = await tx.orderItem.findMany({ where: { order_id: orderId }, include: { variant: true } })
  for (const item of items) {
    if (item.variant && item.variant.stock !== null) {
      await tx.productVariant.update({ where: { id: item.variant.id }, data: { stock: { increment: item.quantity } } })
    }
  }
}

async function generateOrderNumber(): Promise<string> {
  const now = new Date()
  const date = `${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`

  for (;;) {
    const number = `MC${date}${randomUpper(6)}`
    if (!(await prisma.order.findUnique({ where: { order_number: number }, select: { id: true } }))) return number
  }
}

/** Notification failures (bad SMTP/SMS credentials) must never fail an order. */
async function safely(callback: () => Promise<void>): Promise<void> {
  try {
    await callback()
  } catch (error) {
    report(error)
  }
}

async function notifyPlaced(order: Order & { items: OrderItem[] }, notifyStaff = true): Promise<void> {
  const money = (value: unknown) => `${order.currency} ${formatNumber(num(value as number))}`

  await safely(async () => {
    if (!order.customer_email) return
    const [storefront, siteName] = await Promise.all([settings.get<string>('storefront_url'), settings.get<string>('site_name')])

    await sendMail(order.customer_email, {
      subject: `Order ${order.order_number} received`,
      greeting: `Hi ${order.customer_name},`,
      introLines: [
        `Thank you for your order. We've received order **${order.order_number}** and will start processing it shortly.`,
        ...order.items.map((item) => `- ${item.product_name}${item.variant_title ? ` (${item.variant_title})` : ''} × ${item.quantity}: ${money(item.line_total)}`),
        `Shipping: ${money(order.shipping_cost)}`,
        `**Total: ${money(order.total)}**`,
      ],
      action: { text: 'View your orders', url: `${String(storefront ?? '').replace(/\/+$/, '')}/account/orders` },
      salutation: `— ${siteName}`,
    })
  })

  await safely(async () => {
    const email = notifyStaff ? await settings.get<string | null>('order_notification_email') : null
    if (!email) return
    const dashboard = String((await settings.get<string>('dashboard_url')) ?? '').replace(/\/+$/, '')

    await sendMail(email, {
      subject: `New order ${order.order_number}`,
      introLines: [`A new order was placed by ${order.customer_name} (${order.customer_phone}).`, `Total: ${money(order.total)}`, `Payment method: ${order.payment_method}`],
      action: { text: 'Open in dashboard', url: `${dashboard}/orders/${order.id}` },
    })
  })

  await safely(async () => {
    if (!(await sms.enabled())) return
    await sms.send(
      order.customer_phone,
      await sms.render('sms_order_placed_template', {
        name: order.customer_name,
        order_number: order.order_number,
        total: formatNumber(num(order.total)),
        currency: order.currency,
      }),
    )
  })
}

async function notifyStatusChanged(order: Order): Promise<void> {
  await safely(async () => {
    if (!(await sms.enabled())) return
    await sms.send(
      order.customer_phone,
      await sms.render('sms_order_status_template', { name: order.customer_name, order_number: order.order_number, status: order.status }),
    )
  })
}

export const orderInclude = {
  items: true,
  payments: { orderBy: { id: 'desc' as const }, take: 1 },
} as const

/** Maps the `payments` (latest first, take 1) include onto `latestPayment`. */
export function withLatestPayment<T extends { payments?: unknown[] }>(order: T): Omit<T, 'payments'> & { latestPayment: NonNullable<T['payments']>[number] | null } {
  const { payments: list, ...rest } = order
  return { ...rest, latestPayment: list?.[0] ?? null } as never
}

export const orders = {
  async place(data: PlaceOrderData, user: User | null): Promise<OrderWith> {
    if (!(await payments.isAvailable(data.payment_method))) fail('payment_method', 'This payment method is not available.')

    const account = isWallet(data.payment_method) ? await payments.resolveAccount(data.payment_method, data.payment_account_id) : null

    const shippingMethod = await prisma.shippingMethod.findFirst({ where: { id: data.shipping_method_id, is_active: true } })
    if (!shippingMethod) fail('shipping_method_id', 'The selected shipping method is not available.')
    const method = shippingMethod!
    const currency = String((await settings.get('currency', 'BDT')) ?? 'BDT')

    const order = await prisma.$transaction(async (tx) => {
      const { lines, subtotal, extraShipping } = await priceLines(tx, data.items)
      const shippingCost = await shippingCostFor(method, subtotal, extraShipping)

      const created = await createOrder(tx, lines, {
        order_number: await generateOrderNumber(),
        user_id: user?.id ?? null,
        customer_name: data.address.name,
        customer_email: data.address.email ?? user?.email ?? null,
        customer_phone: data.address.phone,
        shipping_address: data.address,
        shipping_method_id: method.id,
        shipping_method_title: method.title,
        currency,
        subtotal,
        shipping_cost: shippingCost,
        discount: 0,
        total: round(subtotal + shippingCost, 2),
        payment_method: data.payment_method,
        payment_status: 'pending',
        status: 'pending',
        customer_note: data.customer_note ?? null,
      })

      if (account) await payments.submit(tx, created, account, String(data.transaction_id), String(data.payment_sender_number))

      return created
    })

    const loaded = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude })
    await notifyPlaced(loaded)

    return withLatestPayment(loaded)
  },

  /** Staff skip the storefront's payment-method availability check: the customer already agreed how to pay. */
  async placeByStaff(data: StaffOrderData): Promise<Order> {
    const method = await prisma.shippingMethod.findUnique({ where: { id: data.shipping_method_id } })
    if (!method) fail('shipping_method_id', 'The selected shipping method is invalid.')
    const currency = String((await settings.get('currency', 'BDT')) ?? 'BDT')
    const customer = data.user_id ? await prisma.user.findUnique({ where: { id: data.user_id } }) : null

    const order = await prisma.$transaction(async (tx) => {
      const { lines, subtotal, extraShipping } = await priceLines(tx, data.items)
      const shippingCost = data.shipping_cost ?? (await shippingCostFor(method!, subtotal, extraShipping))
      const discount = round(Math.min(data.discount ?? 0, subtotal + shippingCost), 2)
      const now = new Date()

      return createOrder(tx, lines, {
        order_number: await generateOrderNumber(),
        user_id: customer?.id ?? null,
        customer_name: data.address.name,
        customer_email: data.address.email ?? customer?.email ?? null,
        customer_phone: data.address.phone,
        shipping_address: data.address,
        shipping_method_id: method!.id,
        shipping_method_title: method!.title,
        currency,
        subtotal,
        shipping_cost: shippingCost,
        discount,
        total: round(subtotal + shippingCost - discount, 2),
        payment_method: data.payment_method,
        payment_status: data.payment_status,
        status: data.status,
        customer_note: data.customer_note ?? null,
        admin_note: data.admin_note ?? null,
        delivered_at: data.status === 'delivered' ? now : null,
      })
    })

    const loaded = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude })
    await notifyPlaced(loaded, false)
    return loaded
  },

  /** Deleting an unwanted order puts its stock back without texting the customer about a cancellation. */
  async remove(order: Order): Promise<void> {
    await prisma.$transaction(async (tx) => {
      if (order.status !== 'cancelled') await restoreStock(tx, order.id)
      await tx.order.delete({ where: { id: order.id } })
    })
  },

  /**
   * Live prices for a cart, so checkout shows exactly what the order will charge.
   * Unavailable lines are flagged instead of rejected; placing the order reports them.
   */
  async quote(items: CartItem[]) {
    const wanted = quantities(items)
    const variants = new Map<number, VariantWithProduct>(
      (await prisma.productVariant.findMany({ where: { id: { in: [...wanted.keys()].map(BigInt) } }, include: { product: true } })).map((variant) => [Number(variant.id), variant]),
    )

    const lines = []
    let subtotal = 0
    let extraShipping = 0

    for (const [variantId, quantity] of wanted) {
      const variant = variants.get(variantId)
      const product = variant?.product
      const available = Boolean(variant && product && product.deleted_at === null && product.status === 'published' && hasStockFor(variant, quantity))

      if (available) {
        subtotal += round(num(variant!.price) * quantity, 2)
        extraShipping += extraShippingFor(product!, quantity)
      }

      lines.push({
        variant_id: variantId,
        available,
        unit_price: variant ? num(variant.price) : null,
        shipping_cost: num(product?.shipping_cost ?? 0),
      })
    }

    const methods = await prisma.shippingMethod.findMany({ where: { is_active: true }, orderBy: { sort_order: 'asc' } })

    return {
      subtotal: round(subtotal, 2),
      extra_shipping: round(extraShipping, 2),
      free_shipping: await qualifiesForFreeShipping(subtotal),
      items: lines,
      shipping: await Promise.all(methods.map(async (method) => ({ id: Number(method.id), cost: await shippingCostFor(method, subtotal, extraShipping) }))),
    }
  },

  /** `guard` runs on the freshly locked row, so two concurrent requests can never both cancel (and restock) the same order. */
  async updateStatus(order: Order, status: OrderStatus, guard?: (current: Order) => void): Promise<Order> {
    if (order.status === status) return order
    let changed = false

    const updated = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM orders WHERE id = ${order.id} FOR UPDATE`
      const current = await tx.order.findUniqueOrThrow({ where: { id: order.id } })
      guard?.(current)
      if (current.status === status) return current
      changed = true

      const data: Prisma.OrderUncheckedUpdateInput = { status }

      if (status === 'cancelled') {
        await restoreStock(tx, order.id)
        data.cancelled_at = new Date()
      }

      if (status === 'delivered') {
        data.delivered_at = new Date()
        if (order.payment_method === 'cod') data.payment_status = 'paid'
      }

      return tx.order.update({ where: { id: order.id }, data })
    })

    Object.assign(order, updated)
    if (changed) await notifyStatusChanged(order)
    return order
  },

  async cancel(order: Order): Promise<Order> {
    const cancellable = (current: Order) => {
      if (current.status !== 'pending') fail('order', 'This order can no longer be cancelled.')
    }
    cancellable(order)
    return this.updateStatus(order, 'cancelled', cancellable)
  },
}

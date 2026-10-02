import type { Prisma } from '../src/generated/prisma/client.js'
import { prisma } from '../src/lib/prisma.js'
import { slug } from '../src/lib/str.js'
import { hashPassword } from '../src/services/password-resets.js'

let sequence = 0
const next = () => ++sequence

let passwordHash: string | undefined
const password = async () => (passwordHash ??= await hashPassword('password'))

export async function makeUser(overrides: Partial<Prisma.UserUncheckedCreateInput> = {}) {
  const n = next()
  return prisma.user.create({
    data: {
      name: `Test User ${n}`,
      email: `user${n}@example.test`,
      email_verified_at: new Date(),
      password: await password(),
      remember_token: `remember${String(n).padStart(2, '0')}`.slice(0, 10),
      ...overrides,
    },
  })
}

export const makeAdmin = (overrides: Partial<Prisma.UserUncheckedCreateInput> = {}) => makeUser({ role: 'admin', ...overrides })
export const makeManager = (overrides: Partial<Prisma.UserUncheckedCreateInput> = {}) => makeUser({ role: 'manager', ...overrides })

export async function makeCategory(overrides: Partial<Prisma.CategoryUncheckedCreateInput> = {}) {
  const n = next()
  const name = overrides.name ?? `Category ${n}`
  return prisma.category.create({
    data: {
      name,
      slug: overrides.slug ?? slug(name),
      image: 'https://via.placeholder.com/640x480.png',
      description: 'A test category.',
      is_active: true,
      sort_order: 0,
      ...overrides,
    },
  })
}

type ProductOverrides = Partial<Prisma.ProductUncheckedCreateInput> & { variant?: { price?: number; stock?: number | null } | false }

/** Product::factory()->withVariant(500, 10) by default; pass `variant: false` for none. */
export async function makeProduct(overrides: ProductOverrides = {}) {
  const { variant = {}, ...data } = overrides
  const n = next()
  const name = data.name ?? `Test product ${n}`
  const category_id = data.category_id ?? (await makeCategory()).id

  const product = await prisma.product.create({
    data: {
      name,
      slug: data.slug ?? slug(name),
      unit: 'piece',
      currency: 'BDT',
      short_description: 'A short description.',
      description: '<p>A product description.</p>',
      thumbnail: 'https://via.placeholder.com/640x480.png',
      tags: ['fresh', 'organic'],
      status: 'published',
      is_featured: false,
      ...data,
      category_id,
    },
  })

  if (variant !== false) {
    await makeVariant({ product_id: product.id, price: variant.price ?? 500, stock: variant.stock === undefined ? 10 : variant.stock, is_default: true })
  }

  return prisma.product.findUniqueOrThrow({ where: { id: product.id }, include: { variants: true, category: true } })
}

export async function makeVariant(overrides: Partial<Prisma.ProductVariantUncheckedCreateInput> & { product_id: bigint }) {
  return prisma.productVariant.create({
    data: { title: 'Standard', type: 'size', price: 1000, compare_price: null, stock: 20, is_default: false, ...overrides },
  })
}

export async function makeShippingMethod(overrides: Partial<Prisma.ShippingMethodUncheckedCreateInput> = {}) {
  const n = next()
  return prisma.shippingMethod.create({
    data: { code: `method-${n}`, title: 'Inside Dhaka', description: '2-3 business days', price: 80, is_active: true, ...overrides },
  })
}

export async function makePaymentAccount(overrides: Partial<Prisma.PaymentAccountUncheckedCreateInput> = {}) {
  const n = next()
  return prisma.paymentAccount.create({
    data: {
      method: 'bkash',
      account_type: 'personal',
      account_number: `017${String(n).padStart(8, '0')}`,
      account_name: 'Mangrove Collection',
      is_active: true,
      sort_order: 0,
      ...overrides,
    },
  })
}

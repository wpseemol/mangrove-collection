/**
 * Idempotent: safe to run on every deploy (`pnpm db:seed`).
 */
import { prisma } from '../src/lib/prisma.js'
import { random } from '../src/lib/str.js'
import { hashPassword } from '../src/services/password-resets.js'
import { settings } from '../src/services/settings.js'

const SHIPPING_METHODS = [
  { code: 'inside-dhaka', title: 'Inside Dhaka', description: '2-3 business days', price: 160, sort_order: 1 },
  { code: 'outside-dhaka', title: 'Outside Dhaka', description: '3-5 business days', price: 160, sort_order: 2 },
]

const PAGES = { home: 'Home', about: 'About Us', contact: 'Contact Us' }

async function seedShippingMethods() {
  for (const method of SHIPPING_METHODS) {
    await prisma.shippingMethod.upsert({ where: { code: method.code }, create: method, update: {} })
  }
}

async function seedPages() {
  for (const [slug, title] of Object.entries(PAGES)) {
    await prisma.page.upsert({ where: { slug }, create: { slug, title, sections: [] }, update: {} })
  }
}

/** Bootstrap admin from ADMIN_EMAIL / ADMIN_PASSWORD on first seed only; a random password is generated and printed otherwise. */
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@mangrove-collection.com'
  if (await prisma.user.findUnique({ where: { email } })) return

  const password = process.env.ADMIN_PASSWORD || random(16)
  await prisma.user.create({
    data: { name: 'Administrator', email, password: await hashPassword(password), role: 'admin', email_verified_at: new Date() },
  })

  console.warn(`Admin created: ${email} / ${password} — change this password after first login.`)
}

await settings.syncDefaults()
await seedShippingMethods()
await seedPages()
await seedAdmin()
await prisma.$disconnect()

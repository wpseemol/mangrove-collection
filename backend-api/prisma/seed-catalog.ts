/**
 * Mangrove Collection catalog: 5 categories and the products in `prisma/seed-data/catalog.json`,
 * each with its photo from `prisma/seed-images/catalog/<slug>.jpg`.
 *
 *   pnpm db:seed:catalog          adds missing products, skips slugs that already exist
 *   pnpm db:seed:catalog:fresh    removes every existing product and category first
 *
 * Removing keeps order history intact: products that appear in orders are soft-deleted (and their slug
 * and SKUs freed), everything else is deleted. Old categories are deleted when empty, otherwise hidden.
 */
import '../src/load-env.js'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import type { Category } from '../src/generated/prisma/client.js'
import { paths } from '../src/lib/paths.js'
import { prisma } from '../src/lib/prisma.js'
import { storage } from '../src/lib/storage.js'
import { randomLower } from '../src/lib/str.js'

/** Storefront product frames are square, so every photo is center-cropped to exactly this size. */
const IMAGE_SIZE = 1000
const REPLACE = process.argv.includes('--replace')

const CATEGORIES = [
  {
    slug: 'sundarban-honey',
    name: 'Sundarban Honey',
    icon: 'droplet',
    description: 'Raw, unprocessed honey collected by Moual honey hunters from the Sundarban mangrove forest.',
  },
  {
    slug: 'sea-fish',
    name: 'Sea & Estuary Fish',
    icon: 'fish',
    description: 'Fresh saltwater and estuary fish from the Bay of Bengal and Sundarban rivers: koral, pomfret, parshe, tengra and more.',
  },
  {
    slug: 'shrimp-crab',
    name: 'Shrimp & Crab',
    icon: 'shrimp',
    description: 'Golda and bagda prawn, horina shrimp and live Sundarban mud crab, packed on ice.',
  },
  {
    slug: 'river-fish',
    name: 'River Fish',
    icon: 'waves-horizontal',
    description: 'Rui, katla and mixed small river fish, fresh from local rivers and ponds.',
  },
  {
    slug: 'fruits',
    name: 'Seasonal Fruits',
    icon: 'citrus',
    description: 'Chemical-free seasonal fruits straight from Satkhira orchards, like Himsagar and Gobindabhog mangoes.',
  },
] as const

type CategorySlug = (typeof CATEGORIES)[number]['slug']
type SeedProduct = {
  category: CategorySlug
  slug: string
  name: string
  unit: string
  short_description: string
  description: string
  tags: string[]
  featured: boolean
  variants: { title: string; type: string; price: number }[]
}

const PRODUCTS: SeedProduct[] = JSON.parse(await readFile(join(paths.root, 'prisma', 'seed-data', 'catalog.json'), 'utf8'))

const clip = (value: string, max: number) => (value.length <= max ? value : `${value.slice(0, value.lastIndexOf(' ', max - 1))}…`)

async function removeExistingCatalog() {
  const products = await prisma.product.findMany({ select: { id: true, slug: true, deleted_at: true, _count: { select: { orderItems: true } } } })
  let deleted = 0
  let archived = 0

  for (const product of products) {
    if (product._count.orderItems === 0) {
      await prisma.product.delete({ where: { id: product.id } })
      deleted++
      continue
    }
    await prisma.$transaction([
      prisma.productVariant.updateMany({ where: { product_id: product.id }, data: { sku: null } }),
      prisma.product.update({
        where: { id: product.id },
        data: { deleted_at: product.deleted_at ?? new Date(), slug: product.slug.includes('-removed-') ? product.slug : `${product.slug}-removed-${product.id}`, is_featured: false },
      }),
    ])
    archived++
  }

  const keep: string[] = CATEGORIES.map((category) => category.slug)
  for (const category of await prisma.category.findMany({ where: { slug: { notIn: keep } }, select: { id: true, _count: { select: { products: true } } } })) {
    if (category._count.products === 0) await prisma.category.delete({ where: { id: category.id } })
    else await prisma.category.update({ where: { id: category.id }, data: { is_active: false } })
  }

  console.log(`  Removed ${deleted} products, archived ${archived} that appear in orders`)
}

/** Center-crops to 1:1, resizes to IMAGE_SIZE and stores a JPEG in the media library. */
async function storeSquareImage(slug: string, adminId: bigint | null) {
  const file = `${slug}.jpg`
  const jpeg = await sharp(await readFile(join(paths.seedImages, 'catalog', file)))
    .resize(IMAGE_SIZE, IMAGE_SIZE, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()

  const now = new Date()
  const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${slug}-${randomLower(8)}.jpg`
  await storage.put('public', path, jpeg)

  return prisma.media.create({
    data: { disk: 'public', path, original_name: file, mime_type: 'image/jpeg', size: BigInt(jpeg.length), uploaded_by: adminId },
  })
}

async function createProduct(data: SeedProduct, popularity: number, target: Category, url: string, adminId: bigint | null) {
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        category_id: target.id,
        name: data.name,
        slug: data.slug,
        unit: data.unit,
        currency: 'BDT',
        short_description: data.short_description,
        description: data.description,
        thumbnail: url,
        tags: data.tags,
        status: 'published',
        is_featured: data.featured,
        popularity,
        meta_title: clip(`${data.name} | Mangrove Collection`, 255),
        meta_description: clip(data.short_description, 160),
        created_by: adminId,
      },
    })

    await tx.productImage.create({ data: { product_id: product.id, url, alt: data.name, sort_order: 0 } })
    await tx.productVariant.createMany({
      data: data.variants.map((variant, index) => ({
        product_id: product.id,
        title: variant.title,
        type: variant.type,
        sku: `MC-${data.slug.toUpperCase()}-${index + 1}`,
        price: variant.price,
        compare_price: null,
        stock: 100,
        is_default: index === 0,
        sort_order: index,
      })),
    })
  })
}

const adminId = (await prisma.user.findFirst({ where: { role: 'admin' }, select: { id: true } }))?.id ?? null

if (REPLACE) await removeExistingCatalog()

const categories = new Map<CategorySlug, Category>()
for (const [index, { slug, ...data }] of CATEGORIES.entries()) {
  const fields = { ...data, is_active: true, sort_order: index }
  categories.set(slug, await prisma.category.upsert({ where: { slug }, create: { slug, ...fields, created_by: adminId }, update: fields }))
}

for (const [index, data] of PRODUCTS.entries()) {
  if (await prisma.product.findUnique({ where: { slug: data.slug } })) {
    console.log(`  Skipped ${data.name} (already exists)`)
    continue
  }

  const media = await storeSquareImage(data.slug, adminId)
  try {
    await createProduct(data, Math.max(0, 100 - index * 5), categories.get(data.category)!, storage.url('public', media.path), adminId)
  } catch (error) {
    await storage.delete('public', media.path)
    await prisma.media.delete({ where: { id: media.id } })
    throw error
  }

  console.log(`  Created ${data.name}`)
}

await prisma.$disconnect()

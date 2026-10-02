/**
 * Starter catalog with real product photos (`pnpm db:seed:catalog`).
 * Idempotent: products whose slug already exists are skipped.
 */
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

type Variant = { title: string; type: string; sku: string; price: number; compare_price: number | null; stock: number }
type SeedProduct = {
  category: 'honey' | 'fish'
  name: string
  slug: string
  image: string
  unit: string
  size: string
  short_description: string
  description: string
  tags: string[]
  featured: boolean
  popularity: number
  variants: Variant[]
}

const PRODUCTS: SeedProduct[] = [
  {
    category: 'honey',
    name: 'Sundarban Khalisha Flower Honey',
    slug: 'sundarban-khalisha-flower-honey',
    image: 'sundarban-khalisha-honey.jpg',
    unit: 'jar',
    size: '500 g',
    short_description: 'Light, golden and mildly floral raw honey collected by Mouals from Khalisha blossoms deep in the Sundarbans.',
    description:
      '<p>Khalisha honey is the first and most prized harvest of the Sundarban season. It is light golden, smooth and delicately floral.</p><ul><li>100% raw and unprocessed, never heated</li><li>No added sugar, syrup or preservatives</li><li>Collected by traditional Moual honey hunters</li></ul><p>Natural honey may crystallise in cool weather. Place the jar in warm water to make it runny again.</p>',
    tags: ['honey', 'raw honey', 'khalisha', 'sundarban'],
    featured: true,
    popularity: 95,
    variants: [
      { title: '500 g', type: 'Weight', sku: 'HNY-KHL-500', price: 750, compare_price: 850, stock: 60 },
      { title: '1 kg', type: 'Weight', sku: 'HNY-KHL-1000', price: 1400, compare_price: 1600, stock: 40 },
    ],
  },
  {
    category: 'honey',
    name: 'Sundarban Goran Flower Honey',
    slug: 'sundarban-goran-flower-honey',
    image: 'sundarban-goran-honey.jpg',
    unit: 'jar',
    size: '500 g',
    short_description: 'Dark amber honey from Goran mangrove flowers, rich and bold with a gentle bitter-sweet finish.',
    description:
      '<p>Goran honey comes from the small white flowers of the Goran mangrove. It is darker and stronger than Khalisha, with a deep caramel taste.</p><ul><li>Raw, unfiltered and never heated</li><li>Naturally rich in minerals</li><li>Great with tea, lemon water or warm milk</li></ul>',
    tags: ['honey', 'raw honey', 'goran', 'sundarban'],
    featured: false,
    popularity: 70,
    variants: [
      { title: '500 g', type: 'Weight', sku: 'HNY-GRN-500', price: 650, compare_price: null, stock: 50 },
      { title: '1 kg', type: 'Weight', sku: 'HNY-GRN-1000', price: 1200, compare_price: 1300, stock: 30 },
    ],
  },
  {
    category: 'fish',
    name: 'Fresh Padma-Meghna Hilsa (Ilish)',
    slug: 'fresh-hilsa-ilish',
    image: 'fresh-hilsa.jpg',
    unit: 'kg',
    size: '1–1.2 kg per fish',
    short_description: 'Large, oily river-sea hilsa with bright silver scales, cleaned on request and delivered chilled.',
    description:
      '<p>Big, fatty hilsa caught at the river mouth where the Meghna meets the Bay of Bengal. Each fish weighs roughly 1 to 1.2 kg.</p><ul><li>Packed on ice the same day it is landed</li><li>Free scaling and cutting on request</li><li>Best for shorshe ilish, bhapa and fry</li></ul>',
    tags: ['fish', 'hilsa', 'ilish', 'sea fish'],
    featured: true,
    popularity: 100,
    variants: [
      { title: '1 kg', type: 'Weight', sku: 'FSH-HLS-1000', price: 1800, compare_price: 2000, stock: 25 },
      { title: '2 kg', type: 'Weight', sku: 'FSH-HLS-2000', price: 3500, compare_price: 4000, stock: 15 },
    ],
  },
  {
    category: 'fish',
    name: 'Fresh Bhetki (Sea Bass)',
    slug: 'fresh-bhetki-sea-bass',
    image: 'fresh-bhetki.jpg',
    unit: 'kg',
    size: '2–3 kg per fish',
    short_description: 'Firm, white and mild Bhetki from the Sundarban estuary, perfect for fillets, paturi and fish fry.',
    description:
      '<p>Bhetki (Asian sea bass) has thick, boneless white flesh with a clean, mild taste. Each fish weighs about 2 to 3 kg.</p><ul><li>Whole fish, or cut into fillets or steaks on request</li><li>Delivered chilled in insulated packing</li></ul>',
    tags: ['fish', 'bhetki', 'sea bass', 'sea fish'],
    featured: true,
    popularity: 80,
    variants: [
      { title: '1 kg', type: 'Weight', sku: 'FSH-BHT-1000', price: 950, compare_price: null, stock: 30 },
      { title: '2 kg', type: 'Weight', sku: 'FSH-BHT-2000', price: 1850, compare_price: 1900, stock: 20 },
    ],
  },
  {
    category: 'fish',
    name: 'Fresh Silver Pomfret (Rupchanda)',
    slug: 'fresh-silver-pomfret-rupchanda',
    image: 'fresh-pomfret.jpg',
    unit: 'kg',
    size: '3–4 fish per kg',
    short_description: 'Shiny, soft-fleshed Rupchanda from the Bay of Bengal, a family favourite for fry and curry.',
    description:
      '<p>Silver pomfret is prized for its soft, sweet white flesh and very few bones. About 3 to 4 fish make up one kilogram.</p><ul><li>Caught by local fishing boats and sent on ice</li><li>Ideal for fry, curry or grilling</li></ul>',
    tags: ['fish', 'pomfret', 'rupchanda', 'sea fish'],
    featured: false,
    popularity: 75,
    variants: [
      { title: '1 kg', type: 'Weight', sku: 'FSH-PMF-1000', price: 1300, compare_price: 1450, stock: 20 },
      { title: '2 kg', type: 'Weight', sku: 'FSH-PMF-2000', price: 2550, compare_price: 2900, stock: 10 },
    ],
  },
  {
    category: 'fish',
    name: 'Fresh Parshe (Gold-spot Mullet)',
    slug: 'fresh-parshe-mullet',
    image: 'fresh-parshe.jpg',
    unit: 'kg',
    size: '10–14 fish per kg',
    short_description: 'Small, tender Parshe from Sundarban brackish water, delicious in light jhol or crispy fry.',
    description:
      '<p>Parshe is a small mullet from the brackish rivers of the Sundarbans, known for its soft, sweet flesh. About 10 to 14 fish make up one kilogram.</p><ul><li>Cleaned and gutted on request</li><li>Delivered chilled on ice</li></ul>',
    tags: ['fish', 'parshe', 'mullet', 'sundarban'],
    featured: false,
    popularity: 60,
    variants: [
      { title: '1 kg', type: 'Weight', sku: 'FSH-PRS-1000', price: 850, compare_price: null, stock: 25 },
      { title: '500 g', type: 'Weight', sku: 'FSH-PRS-500', price: 450, compare_price: null, stock: 30 },
    ],
  },
]

const category = (slug: string, name: string, adminId: bigint | null) =>
  prisma.category.upsert({ where: { slug }, create: { slug, name, is_active: true, created_by: adminId }, update: {} })

/** Center-crops to 1:1, resizes to IMAGE_SIZE and stores a JPEG in the media library. */
async function storeSquareImage(file: string, slug: string, adminId: bigint | null) {
  const source = join(paths.seedImages, 'products', file)
  const jpeg = await sharp(await readFile(source)).resize(IMAGE_SIZE, IMAGE_SIZE, { fit: 'cover', position: 'centre' }).jpeg({ quality: 85 }).toBuffer()

  const now = new Date()
  const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${slug}-${randomLower(8)}.jpg`
  await storage.put('public', path, jpeg)

  return prisma.media.create({
    data: { disk: 'public', path, original_name: file, mime_type: 'image/jpeg', size: jpeg.length, uploaded_by: adminId },
  })
}

async function createProduct(data: SeedProduct, target: Category, url: string, adminId: bigint | null) {
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        category_id: target.id,
        name: data.name,
        slug: data.slug,
        unit: data.unit,
        size: data.size,
        currency: 'BDT',
        short_description: data.short_description,
        description: data.description,
        thumbnail: url,
        tags: data.tags,
        status: 'published',
        is_featured: data.featured,
        popularity: data.popularity,
        meta_title: `${data.name} | Mangrove Collection`,
        meta_description: data.short_description,
        created_by: adminId,
      },
    })

    await tx.productImage.create({ data: { product_id: product.id, url, alt: data.name, sort_order: 0 } })
    await tx.productVariant.createMany({
      data: data.variants.map((variant, index) => ({ ...variant, product_id: product.id, is_default: index === 0, sort_order: index })),
    })
  })
}

const adminId = (await prisma.user.findFirst({ where: { role: 'admin' }, select: { id: true } }))?.id ?? null
const categories = {
  honey: await category('honey', 'Mangrove Raw Honey', adminId),
  fish: await category('seawater-fish', 'Seawater Fish', adminId),
}

for (const data of PRODUCTS) {
  if (await prisma.product.findUnique({ where: { slug: data.slug } })) {
    console.log(`  Skipped ${data.name} (already exists)`)
    continue
  }

  const media = await storeSquareImage(data.image, data.slug, adminId)
  try {
    await createProduct(data, categories[data.category], storage.url('public', media.path), adminId)
  } catch (error) {
    await storage.delete('public', media.path)
    await prisma.media.delete({ where: { id: media.id } })
    throw error
  }

  console.log(`  Created ${data.name}`)
}

await prisma.$disconnect()

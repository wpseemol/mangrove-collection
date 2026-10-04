import { beforeEach, describe, expect, it } from 'vitest'
import { prisma } from '../src/lib/prisma.js'
import { orders } from '../src/services/orders.js'
import { makeCategory, makeManager, makeProduct, makeShippingMethod, makeVariant } from './factories.js'
import { actingAs, type Client, client, diskHas, expectErrors, expectStatus, fakeFile, fakeImage } from './helpers.js'

let staff: Client

beforeEach(async () => {
  staff = await actingAs(await makeManager())
})

describe('admin catalog and orders', () => {
  it('lets a manager create and update a product with variants', async () => {
    const category = await makeCategory()

    const created = await staff.post('/v1/admin/products', {
      category_id: Number(category.id),
      name: 'Nakshi Kantha',
      status: 'published',
      tags: ['handmade'],
      images: [{ url: 'https://cdn.example.com/1.jpg' }],
      variants: [
        { title: 'Small', price: 1200, stock: 4, sku: 'NK-S' },
        { title: 'Large', price: 2200, stock: 2, sku: 'NK-L', is_default: true },
      ],
    })

    expectStatus(created, 201)
    expect(created.body.data).toMatchObject({ slug: 'nakshi-kantha', price: 2200 })
    expect(created.body.data.variants).toHaveLength(2)
    expect(created.body.data.images).toHaveLength(1)

    const productId = created.body.data.id
    const small = created.body.data.variants.find((variant: { title: string }) => variant.title === 'Small')

    const updated = await staff.put(`/v1/admin/products/${productId}`, {
      variants: [{ id: small.id, title: 'Small', price: 1300, stock: 4, sku: 'NK-S' }],
    })
    expectStatus(updated, 200)
    expect(updated.body.data.variants).toHaveLength(1)
    expect(updated.body.data.variants[0]).toMatchObject({ id: small.id, is_default: true })
    expect(updated.body.data.price).toBe(1300)

    expectStatus(await client().get('/v1/products/nakshi-kantha'), 200)
  })

  it('rejects a sku used by another product', async () => {
    const existing = await makeProduct({ variant: false })
    await makeVariant({ product_id: existing.id, title: 'One', price: 10, sku: 'DUP-1', is_default: true })

    expectErrors(
      await staff.post('/v1/admin/products', {
        category_id: Number(existing.category_id),
        name: 'Another',
        variants: [{ title: 'One', price: 10, sku: 'DUP-1' }],
      }),
      'variants.0.sku',
    )
  })

  it('soft deletes products and restores them', async () => {
    const product = await makeProduct()

    expectStatus(await staff.delete(`/v1/admin/products/${product.id}`), 204)
    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).deleted_at).not.toBeNull()
    expectStatus(await client().get(`/v1/products/${product.slug}`), 404)

    expectStatus(await staff.post(`/v1/admin/products/${product.id}/restore`), 200)
    expect((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).deleted_at).toBeNull()
  })

  it('refuses to delete a category that has products', async () => {
    const product = await makeProduct()
    expectStatus(await staff.delete(`/v1/admin/categories/${product.category_id}`), 409)
  })

  it('restocks cancelled orders and marks delivered cod orders paid', async () => {
    const variant = (await makeProduct({ variant: { price: 100, stock: 5 } })).variants[0]
    const shipping = await makeShippingMethod()

    const place = () =>
      orders.place(
        {
          items: [{ variant_id: Number(variant.id), quantity: 2 }],
          shipping_method_id: Number(shipping.id),
          payment_method: 'cod',
          address: { name: 'A', phone: '017', full_address: 'X' },
        },
        null,
      )

    const first = await place()
    const second = await place()
    const stock = async () => (await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock
    expect(await stock()).toBe(1)

    const cancelled = await staff.patch(`/v1/admin/orders/${first.id}`, { status: 'cancelled' })
    expectStatus(cancelled, 200)
    expect(cancelled.body.data.status).toBe('cancelled')
    expect(await stock()).toBe(3)

    expectStatus(await staff.patch(`/v1/admin/orders/${first.id}`, { status: 'processing' }), 409)

    const delivered = await staff.patch(`/v1/admin/orders/${second.id}`, { status: 'delivered', admin_note: 'Handed over' })
    expectStatus(delivered, 200)
    expect(delivered.body.data).toMatchObject({ payment_status: 'paid', admin_note: 'Handed over' })
  })

  it('returns dashboard stats', async () => {
    const res = await staff.get('/v1/admin/dashboard?days=7')
    expectStatus(res, 200)
    for (const key of ['totals', 'orders_by_status', 'sales_chart', 'low_stock', 'recent_orders']) expect(res.body.data).toHaveProperty(key)
    expect(res.body.data.sales_chart).toHaveLength(7)
  })

  it('stores media uploads on the public disk', async () => {
    const res = await staff.post('/v1/admin/media', {}, { file: await fakeImage('banner.jpg', 1200, 600) })
    expectStatus(res, 201)
    expect(diskHas('public', res.body.data[0].path)).toBe(true)

    expectStatus(await staff.post('/v1/admin/media', {}, { file: fakeFile('evil.svg', 1, 'image/svg+xml') }), 422)
  })

  it('upserts pages and serves them publicly', async () => {
    expectStatus(
      await staff.put('/v1/admin/pages/about', {
        title: 'About Mangrove',
        content: '<p>Our story</p>',
        sections: [{ id: 'intro', title: 'Intro', description: 'Hello' }],
      }),
      201,
    )

    const res = await client().get('/v1/pages/about')
    expectStatus(res, 200)
    expect(res.body.data.title).toBe('About Mangrove')
    expect(res.body.data.sections[0].id).toBe('intro')
  })

  it('checks links and images inside page sections', async () => {
    const bad = await staff.put('/v1/admin/pages/home', {
      title: 'Home',
      sections: [{ type: 'hero', image: 'ftp://example.com/a.jpg', primary_url: '//evil.example', items: [{ link_url: 'not a url' }] }],
    })
    expectStatus(bad, 422)
    expect(Object.keys(bad.body.errors)).toEqual(['sections.0.image', 'sections.0.primary_url', 'sections.0.items.0.link_url'])

    expectErrors(
      await staff.put('/v1/admin/pages/home', {
        title: 'Home',
        sections: [{ type: 'info', items: [{ body: 'Fresh [crab](javascript:alert(1)) daily' }] }],
      }),
      'sections.0.items.0.body',
    )

    expectStatus(
      await staff.put('/v1/admin/pages/home', {
        title: 'Home',
        sections: [
          { type: 'hero', image: 'https://cdn.example.com/a.jpg', primary_url: '/shop', secondary_url: '' },
          { type: 'info', items: [{ body: 'Shop **fresh** [mud crab](/shop/?category=crab) or [honey](https://example.com/honey).' }] },
        ],
      }),
      201,
    )
  })
})

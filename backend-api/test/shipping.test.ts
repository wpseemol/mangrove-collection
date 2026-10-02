import { describe, expect, it } from 'vitest'
import type { ShippingMethod } from '../src/generated/prisma/client.js'
import { prisma } from '../src/lib/prisma.js'
import { settings } from '../src/services/settings.js'
import { makeCategory, makeManager, makeProduct, makeShippingMethod, makeUser } from './factories.js'
import { actingAs, client, expectErrors, expectStatus } from './helpers.js'

const checkout = (method: ShippingMethod, items: { variant_id: bigint; quantity: number }[]) => ({
  items: items.map((item) => ({ variant_id: Number(item.variant_id), quantity: item.quantity })),
  shipping_method_id: Number(method.id),
  payment_method: 'cod',
  address: { name: 'Rahim Uddin', phone: '01700000000', full_address: 'House 1, Road 2, Dhanmondi' },
})

describe('shipping', () => {
  it('adds product extra shipping per unit on top of the method', async () => {
    const method = await makeShippingMethod({ price: 60 })
    const heavy = (await makeProduct({ shipping_cost: 40, variant: { price: 500 } })).variants[0]
    const light = (await makeProduct({ variant: { price: 200 } })).variants[0]

    const res = await client().post(
      '/v1/checkout',
      checkout(method, [
        { variant_id: heavy.id, quantity: 2 },
        { variant_id: light.id, quantity: 1 },
      ]),
    )

    expectStatus(res, 201)
    expect(res.body.data).toMatchObject({ subtotal: 1200, shipping_cost: 140, total: 1340 })
  })

  it('waives product extras with the free shipping threshold too', async () => {
    await settings.update({ free_shipping_threshold: 1000 })
    const method = await makeShippingMethod({ price: 60 })
    const variant = (await makeProduct({ shipping_cost: 50, variant: { price: 600 } })).variants[0]

    const res = await client().post('/v1/checkout', checkout(method, [{ variant_id: variant.id, quantity: 2 }]))

    expectStatus(res, 201)
    expect(res.body.data).toMatchObject({ shipping_cost: 0, total: 1200 })
  })

  it('quotes what checkout will charge', async () => {
    const dhaka = await makeShippingMethod({ price: 60, sort_order: 1 })
    const outside = await makeShippingMethod({ price: 120, sort_order: 2 })
    await makeShippingMethod({ price: 10, is_active: false })
    const heavy = (await makeProduct({ shipping_cost: 40, variant: { price: 500, stock: 5 } })).variants[0]
    const draft = (await makeProduct({ status: 'draft', variant: { price: 300 } })).variants[0]

    const res = await client().post('/v1/checkout/quote', {
      items: [
        { variant_id: Number(heavy.id), quantity: 3 },
        { variant_id: Number(draft.id), quantity: 1 },
      ],
    })

    expectStatus(res, 200)
    expect(res.body.data).toMatchObject({ subtotal: 1500, extra_shipping: 120, free_shipping: false })
    expect(res.body.data.items[0]).toMatchObject({ shipping_cost: 40, available: true })
    expect(res.body.data.items[1].available).toBe(false)
    expect(res.body.data.shipping).toEqual([
      { id: Number(dhaka.id), cost: 180 },
      { id: Number(outside.id), cost: 240 },
    ])
  })

  it('validates the quote input', async () => {
    expectErrors(await client().post('/v1/checkout/quote', { items: [{ variant_id: 'x', quantity: 0 }] }), ['items.0.variant_id', 'items.0.quantity'])
  })

  it('lets staff set a product shipping cost that customers see', async () => {
    const staff = await actingAs(await makeManager())
    const category = await makeCategory()

    const created = await staff.post('/v1/admin/products', {
      category_id: Number(category.id),
      name: 'Giant Mud Crab',
      status: 'published',
      shipping_cost: 75.5,
      variants: [{ title: 'Default', price: 1500 }],
    })
    expectStatus(created, 201)
    expect(created.body.data.shipping_cost).toBe(75.5)
    const id = created.body.data.id

    const cleared = await staff.put(`/v1/admin/products/${id}`, { shipping_cost: null })
    expectStatus(cleared, 200)
    expect(cleared.body.data.shipping_cost).toBeNull()

    expectErrors(await staff.put(`/v1/admin/products/${id}`, { shipping_cost: -5 }), 'shipping_cost')
    expectErrors(await staff.put(`/v1/admin/products/${id}`, { shipping_cost: '10.999' }), 'shipping_cost')
    expectErrors(await staff.put(`/v1/admin/products/${id}`, { shipping_cost: '1; DROP TABLE products' }), 'shipping_cost')

    expectStatus(await staff.put(`/v1/admin/products/${id}`, { shipping_cost: 30 }), 200)

    const res = await client().get('/v1/products/giant-mud-crab')
    expectStatus(res, 200)
    expect(res.body.data.shipping_cost).toBe(30)
  })

  it('lets a manager manage global shipping methods', async () => {
    const staff = await actingAs(await makeManager())

    const created = await staff.post('/v1/admin/shipping-methods', { title: 'Inside Dhaka', price: 60 })
    expectStatus(created, 201)
    expect(created.body.data).toMatchObject({ code: 'inside-dhaka', is_active: true })
    const id = created.body.data.id

    const duplicate = await staff.post('/v1/admin/shipping-methods', { title: 'Inside Dhaka', price: 80 })
    expectStatus(duplicate, 201)
    expect(duplicate.body.data.code).toBe('inside-dhaka-2')

    const updated = await staff.put(`/v1/admin/shipping-methods/${id}`, { price: 70, is_active: false })
    expectStatus(updated, 200)
    expect(updated.body.data).toMatchObject({ price: 70, is_active: false })

    const publicList = await client().get('/v1/shipping-methods')
    expectStatus(publicList, 200)
    expect(publicList.body.data).toHaveLength(1)

    expectStatus(await staff.delete(`/v1/admin/shipping-methods/${id}`), 204)
    expect(await prisma.shippingMethod.findUnique({ where: { id: BigInt(id) } })).toBeNull()
  })

  it('validates shipping method input', async () => {
    const staff = await actingAs(await makeManager())

    expectErrors(
      await staff.post('/v1/admin/shipping-methods', {
        title: '<script>alert(1)</script>',
        description: "' OR 1=1 --<?php echo 1; ?>",
        price: -1,
        code: 'bad code!',
      }),
      ['title', 'description', 'price', 'code'],
    )
  })

  it('keeps customers from managing shipping methods', async () => {
    const customer = await actingAs(await makeUser())

    expectStatus(await customer.get('/v1/admin/shipping-methods'), 403)
    expectStatus(await customer.post('/v1/admin/shipping-methods', { title: 'Free', price: 0 }), 403)
  })
})

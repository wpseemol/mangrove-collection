import { describe, expect, it } from 'vitest'
import { prisma } from '../src/lib/prisma.js'
import { smsOutbox } from '../src/services/sms.js'
import { settings } from '../src/services/settings.js'
import { makeManager, makeProduct, makeShippingMethod, makeUser } from './factories.js'
import { actingAs, expectErrors, expectStatus } from './helpers.js'

const address = { name: 'Rahim', phone: '01711000000', full_address: 'House 1, Road 2, Dhaka' }

describe('staff orders', () => {
  it('creates an order at catalog prices with a discount and a delivery charge override', async () => {
    const staff = await actingAs(await makeManager())
    const product = await makeProduct({ variant: { price: 500, stock: 10 } })
    const variant = product.variants[0]
    const shipping = await makeShippingMethod({ price: 80 })

    const res = await staff.post('/v1/admin/orders', {
      items: [{ variant_id: Number(variant.id), quantity: 3 }],
      shipping_method_id: Number(shipping.id),
      shipping_cost: 50,
      discount: 100,
      payment_method: 'cod',
      status: 'processing',
      admin_note: 'Phone order',
      address,
    })

    expectStatus(res, 201)
    expect(res.body.data).toMatchObject({
      status: 'processing',
      payment_status: 'pending',
      subtotal: 1500,
      shipping_cost: 50,
      discount: 100,
      total: 1450,
      admin_note: 'Phone order',
      customer: { name: 'Rahim', phone: '01711000000' },
    })
    expect(res.body.data.items).toHaveLength(1)
    expect((await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock).toBe(7)
  })

  it('uses the shipping method rate when no override is given, and validates input', async () => {
    const staff = await actingAs(await makeManager())
    const variant = (await makeProduct({ variant: { price: 200, stock: 1 } })).variants[0]
    const shipping = await makeShippingMethod({ price: 80 })

    const ok = await staff.post('/v1/admin/orders', {
      items: [{ variant_id: Number(variant.id), quantity: 1 }],
      shipping_method_id: Number(shipping.id),
      payment_method: 'bkash',
      payment_status: 'paid',
      address,
    })
    expectStatus(ok, 201)
    expect(ok.body.data).toMatchObject({ shipping_cost: 80, total: 280, payment_status: 'paid' })

    const res = await staff.post('/v1/admin/orders', {
      items: [{ variant_id: Number(variant.id), quantity: 1 }],
      shipping_method_id: Number(shipping.id),
      payment_method: 'cod',
      address,
    })
    expectStatus(res, 422)
    expect(Object.keys(res.body.errors)[0]).toMatch(/^items\./)

    expectErrors(await staff.post('/v1/admin/orders', { items: [], payment_method: 'cash', address: { name: '<b>x</b>' } }), [
      'items',
      'shipping_method_id',
      'payment_method',
      'address.name',
      'address.phone',
      'address.full_address',
    ])
  })

  it('looks up a returning customer by phone', async () => {
    const staff = await actingAs(await makeManager())
    const customer = await makeUser({ phone: '01711000000' })
    const variant = (await makeProduct()).variants[0]
    const shipping = await makeShippingMethod()
    await staff.post('/v1/admin/orders', { items: [{ variant_id: Number(variant.id), quantity: 1 }], shipping_method_id: Number(shipping.id), payment_method: 'cod', address })

    const res = await staff.get('/v1/admin/orders/customer-lookup?phone=01711000000')
    expectStatus(res, 200)
    expect(res.body.data).toMatchObject({ user: { id: Number(customer.id) }, orders_count: 1, address: { full_address: address.full_address } })
  })

  it('prints, bulk-updates and bulk-deletes orders, restocking without texting customers', async () => {
    await settings.update({ sms_enabled: true })
    const staff = await actingAs(await makeManager())
    const variant = (await makeProduct({ variant: { price: 100, stock: 10 } })).variants[0]
    const shipping = await makeShippingMethod()
    const place = async () =>
      (await staff.post('/v1/admin/orders', { items: [{ variant_id: Number(variant.id), quantity: 2 }], shipping_method_id: Number(shipping.id), payment_method: 'cod', address })).body
        .data.id as number

    const ids = [await place(), await place(), await place()]
    const stock = async () => (await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock
    expect(await stock()).toBe(4)

    const print = await staff.get(`/v1/admin/orders/print?ids=${ids.join(',')}`)
    expectStatus(print, 200)
    expect(print.body.data.map((order: { id: number }) => order.id)).toEqual(ids)
    expect(print.body.data[0].items).toHaveLength(1)
    expectErrors(await staff.get('/v1/admin/orders/print?ids='), 'ids')

    const shipped = await staff.post('/v1/admin/orders/bulk-status', { ids: ids.slice(0, 2), status: 'shipped' })
    expectStatus(shipped, 200)
    expect(shipped.body.data).toEqual({ updated: 2, skipped: 0 })

    smsOutbox.length = 0
    const deleted = await staff.post('/v1/admin/orders/bulk-delete', { ids })
    expectStatus(deleted, 200)
    expect(deleted.body.data).toEqual({ deleted: 3 })
    expect(await prisma.order.count()).toBe(0)
    expect(await stock()).toBe(10)
    expect(smsOutbox).toHaveLength(0)
  })

  it('keeps customers out', async () => {
    const customer = await actingAs(await makeUser())
    expectStatus(await customer.post('/v1/admin/orders', {}), 403)
    expectStatus(await customer.post('/v1/admin/orders/bulk-delete', { ids: [1] }), 403)
  })
})

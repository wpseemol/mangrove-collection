import { beforeEach, describe, expect, it } from 'vitest'
import type { ShippingMethod } from '../src/generated/prisma/client.js'
import { prisma } from '../src/lib/prisma.js'
import { outbox } from '../src/services/mail.js'
import { settings } from '../src/services/settings.js'
import { makePaymentAccount, makeProduct, makeShippingMethod, makeUser } from './factories.js'
import { actingAs, client, expectErrors, expectStatus, fakeHttp } from './helpers.js'

let shipping: ShippingMethod

beforeEach(async () => {
  shipping = await makeShippingMethod({ price: 80 })
})

const address = (overrides: Record<string, string> = {}) => ({
  name: 'Rahim Uddin',
  phone: '01700000000',
  city: 'Dhaka',
  full_address: 'House 1, Road 2, Dhanmondi',
  ...overrides,
})

const payload = (variantId: bigint, quantity: number, overrides: Record<string, unknown> = {}) => ({
  items: [{ variant_id: Number(variantId), quantity }],
  shipping_method_id: Number(shipping.id),
  payment_method: 'cod',
  address: address(),
  ...overrides,
})

const variantOf = async (price = 500, stock: number | null = 10) => (await makeProduct({ variant: { price, stock } })).variants[0]
const stockOf = async (id: bigint) => (await prisma.productVariant.findUniqueOrThrow({ where: { id } })).stock

const smsGateway = { sms_enabled: true, sms_driver: 'http', sms_api_url: 'https://sms.example.com/send', sms_api_key: 'k' }

describe('checkout', () => {
  it('computes guest totals server side and decrements stock', async () => {
    const variant = await variantOf(250, 5)

    const res = await client().post('/v1/checkout', payload(variant.id, 2, { address: address({ email: 'guest@example.com' }) }))

    expectStatus(res, 201)
    expect(res.body.data).toMatchObject({ subtotal: 500, shipping_cost: 80, total: 580, status: 'pending' })
    expect(res.body.data.items[0].quantity).toBe(2)

    expect(await stockOf(variant.id)).toBe(3)
    expect((await prisma.order.findFirstOrThrow()).user_id).toBeNull()
    expect(outbox.some((mail) => mail.to === 'guest@example.com' && mail.subject.includes(res.body.data.order_number))).toBe(true)

    const orderNumber = res.body.data.order_number
    expectStatus(await client().get(`/v1/orders/track?${new URLSearchParams({ order_number: orderNumber, phone: '01700000000' })}`), 200)
    expectStatus(await client().get(`/v1/orders/track?${new URLSearchParams({ order_number: orderNumber, phone: '01999999999' })}`), 404)
  })

  it('rejects insufficient stock', async () => {
    const variant = await variantOf(100, 1)

    expectStatus(await client().post('/v1/checkout', payload(variant.id, 2)), 422)

    expect(await stockOf(variant.id)).toBe(1)
    expect(await prisma.order.count()).toBe(0)
  })

  it('needs an active account for wallets and lets cod be switched off', async () => {
    const variant = await variantOf()
    const wallet = { payment_method: 'bkash', transaction_id: 'TX1234567', payment_sender_number: '01811111111' }

    expectErrors(await client().post('/v1/checkout', payload(variant.id, 1, wallet)), 'payment_method')

    await makePaymentAccount()
    expectStatus(await client().post('/v1/checkout', payload(variant.id, 1, wallet)), 201)

    await settings.update({ cod_enabled: false })
    expectErrors(await client().post('/v1/checkout', payload(variant.id, 1)), 'payment_method')
  })

  it('applies the free shipping threshold from settings', async () => {
    await settings.update({ free_shipping_threshold: 1000 })
    const variant = await variantOf(600)

    const res = await client().post('/v1/checkout', payload(variant.id, 2))
    expectStatus(res, 201)
    expect(res.body.data).toMatchObject({ shipping_cost: 0, total: 1200 })
  })

  it('links an authenticated customer order and lets them cancel it', async () => {
    const user = await makeUser()
    const browser = await actingAs(user)
    const variant = await variantOf(100, 10)

    const res = await browser.post('/v1/checkout', payload(variant.id, 3, { save_address: true }))
    expectStatus(res, 201)
    const orderNumber = res.body.data.order_number

    expect(await stockOf(variant.id)).toBe(7)
    expect(await prisma.address.count({ where: { user_id: user.id } })).toBe(1)

    const orders = await browser.get('/v1/account/orders')
    expectStatus(orders, 200)
    expect(orders.body.data).toHaveLength(1)

    const cancelled = await browser.post(`/v1/account/orders/${orderNumber}/cancel`)
    expectStatus(cancelled, 200)
    expect(cancelled.body.data.status).toBe('cancelled')
    expect(await stockOf(variant.id)).toBe(10)

    expectStatus(await browser.post(`/v1/account/orders/${orderNumber}/cancel`), 422)
  })

  it("hides other customers' orders", async () => {
    const variant = await variantOf()
    const owner = await actingAs(await makeUser())
    const orderNumber = (await owner.post('/v1/checkout', payload(variant.id, 1))).body.data.order_number

    const stranger = await actingAs(await makeUser())
    expectStatus(await stranger.get(`/v1/account/orders/${orderNumber}`), 404)
  })

  it('sends the order sms through the configured gateway', async () => {
    const sent = fakeHttp()
    await settings.update(smsGateway)
    const variant = await variantOf()

    const orderNumber = (await client().post('/v1/checkout', payload(variant.id, 1))).body.data.order_number

    expect(sent.some(({ body }) => body.get('number') === '01700000000' && body.get('message')?.includes(orderNumber))).toBe(true)
  })

  it('does not break checkout when notifications fail', async () => {
    fakeHttp(500)
    await settings.update(smsGateway)
    const variant = await variantOf()

    expectStatus(await client().post('/v1/checkout', payload(variant.id, 1)), 201)
  })
})

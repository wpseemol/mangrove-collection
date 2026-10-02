import { beforeEach, describe, expect, it } from 'vitest'
import type { PaymentAccount, ProductVariant, ShippingMethod } from '../src/generated/prisma/client.js'
import { prisma } from '../src/lib/prisma.js'
import { settings } from '../src/services/settings.js'
import { makeAdmin, makeManager, makePaymentAccount, makeProduct, makeShippingMethod, makeUser } from './factories.js'
import { actingAs, type Client, client, expectErrors, expectStatus, fakeHttp } from './helpers.js'

let shipping: ShippingMethod
let variant: ProductVariant
let bkash: PaymentAccount

beforeEach(async () => {
  shipping = await makeShippingMethod({ price: 60 })
  variant = (await makeProduct({ variant: { price: 500, stock: 20 } })).variants[0]
  bkash = await makePaymentAccount({ account_number: '01711111111' })
})

const checkout = (overrides: Record<string, unknown> = {}, browser: Client = client()) =>
  browser.post('/v1/checkout', {
    items: [{ variant_id: Number(variant.id), quantity: 1 }],
    shipping_method_id: Number(shipping.id),
    payment_method: 'bkash',
    payment_account_id: Number(bkash.id),
    transaction_id: 'TXN9876543',
    payment_sender_number: '01811111111',
    address: { name: 'Rahim Uddin', phone: '01700000000', full_address: 'House 1, Road 2, Dhanmondi' },
    ...overrides,
  })

const stock = async () => (await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).stock

describe('payments', () => {
  it('lists cod and only active wallet accounts publicly', async () => {
    await makePaymentAccount({ method: 'nagad', is_active: false })
    await makePaymentAccount({ method: 'rocket', account_number: '017222222225' })

    const res = await client().get('/v1/payment-methods')
    expectStatus(res, 200)
    expect(res.body.data.map((method: { method: string }) => method.method)).toEqual(['cod', 'bkash', 'rocket'])
    expect(res.body.data[1].accounts[0]).toMatchObject({ account_number: '01711111111', action: 'Send Money' })
    expect(res.body.data[1].accounts[0]).not.toHaveProperty('is_active')
  })

  it('records a wallet checkout payment for review', async () => {
    const res = await checkout({ transaction_id: ' 9ab7 cd6e5f ' })

    expectStatus(res, 201)
    expect(res.body.data.payment_status).toBe('verifying')
    expect(res.body.data.payment).toMatchObject({ transaction_id: '9AB7CD6E5F', account_number: '01711111111', amount: 560, status: 'submitted' })
    expect(res.body.data.can_submit_payment).toBe(false)

    expect(
      await prisma.payment.count({ where: { order_id: BigInt(res.body.data.id), payment_account_id: bkash.id, sender_number: '01811111111' } }),
    ).toBe(1)
  })

  it('validates the account, transaction id and sender of wallet checkouts', async () => {
    const nagad = await makePaymentAccount({ method: 'nagad' })
    const inactive = await makePaymentAccount({ is_active: false })

    expectErrors(await checkout({ transaction_id: null, payment_sender_number: null }), ['transaction_id', 'payment_sender_number'])
    expectErrors(await checkout({ transaction_id: "<script>alert('x')</script>" }), 'transaction_id')
    expectErrors(await checkout({ payment_account_id: Number(nagad.id) }), 'payment_account_id')
    expectErrors(await checkout({ payment_account_id: Number(inactive.id) }), 'payment_account_id')

    expect(await prisma.order.count()).toBe(0)
    expect(await stock()).toBe(20)
  })

  it('does not let one transaction id pay for two orders', async () => {
    expectStatus(await checkout({ transaction_id: 'TRX1234567' }), 201)
    expectErrors(await checkout({ transaction_id: 'trx1234567' }), 'transaction_id')

    expect(await prisma.order.count()).toBe(1)
    expect(await stock()).toBe(19)
  })

  it('marks the order paid and processing when staff verify the payment', async () => {
    const orderId = (await checkout()).body.data.id
    const payment = await prisma.payment.findFirstOrThrow()
    const manager = await makeManager()
    const browser = await actingAs(manager)

    const list = await browser.get('/v1/admin/payments?status=submitted')
    expectStatus(list, 200)
    expect(list.body.counts.submitted).toBe(1)
    expect(list.body.data[0].order.id).toBe(orderId)

    const verified = await browser.post(`/v1/admin/payments/${payment.id}/verify`)
    expectStatus(verified, 200)
    expect(verified.body.data.status).toBe('verified')
    expect(verified.body.data.reviewer.name).toBe(manager.name)
    expect(verified.body.data.order).toMatchObject({ payment_status: 'paid', status: 'processing' })

    expectStatus(await browser.post(`/v1/admin/payments/${payment.id}/verify`), 409)
    expectStatus(await browser.post(`/v1/admin/payments/${payment.id}/reject`, { reason: 'Late change' }), 409)
  })

  it('lets the guest resubmit a rejected payment with the order phone', async () => {
    const sent = fakeHttp()
    await settings.update({ sms_enabled: true, sms_driver: 'http', sms_api_url: 'https://sms.example.com/send', sms_api_key: 'k' })

    const orderNumber = (await checkout({ transaction_id: 'WRONG12345' })).body.data.order_number
    const payment = await prisma.payment.findFirstOrThrow()
    const admin = await actingAs(await makeAdmin())

    expectErrors(await admin.post(`/v1/admin/payments/${payment.id}/reject`, { reason: '<b>bad</b>' }), 'reason')

    const rejected = await admin.post(`/v1/admin/payments/${payment.id}/reject`, { reason: 'No payment with this transaction ID' })
    expectStatus(rejected, 200)
    expect(rejected.body.data.order.payment_status).toBe('failed')
    expect(sent.some(({ body }) => body.get('message')?.includes('No payment with this transaction ID'))).toBe(true)

    const resubmit = (overrides: Record<string, unknown> = {}) =>
      client().post(`/v1/orders/${orderNumber}/payment`, {
        payment_account_id: Number(bkash.id),
        transaction_id: 'RIGHT12345',
        payment_sender_number: '01811111111',
        phone: '01700000000',
        ...overrides,
      })

    expectStatus(await resubmit({ phone: '01999999999' }), 404)
    expectStatus(await resubmit({ phone: null }), 404)

    const ok = await resubmit()
    expectStatus(ok, 200)
    expect(ok.body.data.payment_status).toBe('verifying')
    expect(ok.body.data.payment.transaction_id).toBe('RIGHT12345')

    expectErrors(await resubmit({ transaction_id: 'AGAIN12345' }), 'transaction_id')
    expect(await prisma.payment.count({ where: { order: { order_number: orderNumber } } })).toBe(2)
  })

  it('lets the signed-in owner resubmit but not other customers', async () => {
    const owner = await makeUser()
    const ownerBrowser = await actingAs(owner)
    const orderNumber = (await checkout({}, ownerBrowser)).body.data.order_number
    await prisma.payment.updateMany({ data: { status: 'rejected' } })
    await prisma.order.updateMany({ data: { payment_status: 'failed' } })

    const body = { payment_account_id: Number(bkash.id), transaction_id: 'NEWTRX1234', payment_sender_number: '01811111111' }

    expectStatus(await (await actingAs(await makeUser())).post(`/v1/orders/${orderNumber}/payment`, body), 404)
    expectStatus(await ownerBrowser.post(`/v1/orders/${orderNumber}/payment`, body), 200)
  })

  it('lets only admins manage payment accounts', async () => {
    const manager = await actingAs(await makeManager())
    expectStatus(await manager.get('/v1/admin/payment-accounts'), 403)
    expectStatus(await manager.post('/v1/admin/payment-accounts', { method: 'bkash', account_type: 'personal', account_number: '01733333333' }), 403)

    expectStatus(await (await actingAs(await makeUser())).get('/v1/admin/payments'), 403)

    const admin = await actingAs(await makeAdmin())

    expectErrors(
      await admin.post('/v1/admin/payment-accounts', {
        method: 'cod',
        account_type: 'personal',
        account_number: '12345',
        instructions: '<script>steal()</script>',
      }),
      ['method', 'account_number', 'instructions'],
    )

    expectErrors(await admin.post('/v1/admin/payment-accounts', { method: 'bkash', account_type: 'personal', account_number: '017-1111-1111' }), 'account_number')

    const created = await admin.post('/v1/admin/payment-accounts', {
      method: 'nagad',
      account_type: 'merchant',
      account_number: '+880 1733-333333',
      account_name: 'Mangrove Collection',
      instructions: 'Use your order number as the reference.',
    })
    expectStatus(created, 201)
    expect(created.body.data).toMatchObject({ account_number: '01733333333', action: 'Payment' })
    const id = created.body.data.id

    const updated = await admin.patch(`/v1/admin/payment-accounts/${id}`, { is_active: false })
    expectStatus(updated, 200)
    expect(updated.body.data.is_active).toBe(false)

    expectStatus(await admin.delete(`/v1/admin/payment-accounts/${id}`), 204)
  })
})

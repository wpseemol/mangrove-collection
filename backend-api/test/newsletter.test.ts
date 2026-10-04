import { describe, expect, it } from 'vitest'
import { prisma } from '../src/lib/prisma.js'
import { makeManager, makeUser } from './factories.js'
import { actingAs, expectErrors, expectStatus, storefront } from './helpers.js'

describe('newsletter', () => {
  it('subscribes an address once and gives the same reply every time', async () => {
    const first = await storefront().post('/v1/newsletter', { email: '  Rina@Example.com ', source: 'footer' })
    expectStatus(first, 200)

    const again = await storefront().post('/v1/newsletter', { email: 'rina@example.com' })
    expectStatus(again, 200)
    expect(again.body.message).toBe(first.body.message)

    const rows = await prisma.newsletterSubscriber.findMany()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ email: 'rina@example.com', status: 'subscribed', source: 'footer' })
  })

  it('brings back an address that had unsubscribed', async () => {
    await prisma.newsletterSubscriber.create({ data: { email: 'back@example.com', status: 'unsubscribed', unsubscribed_at: new Date() } })

    expectStatus(await storefront().post('/v1/newsletter', { email: 'back@example.com' }), 200)

    const row = await prisma.newsletterSubscriber.findUniqueOrThrow({ where: { email: 'back@example.com' } })
    expect(row).toMatchObject({ status: 'subscribed', unsubscribed_at: null })
  })

  it('rejects invalid input', async () => {
    expectErrors(await storefront().post('/v1/newsletter', { email: 'not-an-email' }), 'email')
    expectErrors(await storefront().post('/v1/newsletter', {}), 'email')
    expectErrors(await storefront().post('/v1/newsletter', { email: 'ok@example.com', source: '<b>x</b>' }), 'source')
    expect(await prisma.newsletterSubscriber.count()).toBe(0)
  })

  it('throttles repeated sign-ups from one address', async () => {
    const client = storefront()
    for (let i = 0; i < 5; i++) expectStatus(await client.post('/v1/newsletter', { email: `user${i}@example.com` }), 200)
    expectStatus(await client.post('/v1/newsletter', { email: 'user6@example.com' }), 429)
  })

  it('lets staff list, filter, update, export and delete subscribers', async () => {
    const staff = await actingAs(await makeManager())
    const active = await prisma.newsletterSubscriber.create({ data: { email: 'active@example.com', source: 'footer' } })
    await prisma.newsletterSubscriber.create({ data: { email: '=cmd@example.com', status: 'unsubscribed', unsubscribed_at: new Date() } })

    const list = await staff.get('/v1/admin/newsletter-subscribers')
    expectStatus(list, 200)
    expect(list.body.data).toHaveLength(2)
    expect(list.body.counts).toEqual({ subscribed: 1, unsubscribed: 1 })
    expect(list.body.meta.total).toBe(2)

    const filtered = await staff.get('/v1/admin/newsletter-subscribers?status=subscribed&q=active')
    expect(filtered.body.data.map((s: { email: string }) => s.email)).toEqual(['active@example.com'])

    const updated = await staff.put(`/v1/admin/newsletter-subscribers/${active.id}`, { status: 'unsubscribed' })
    expectStatus(updated, 200)
    expect(updated.body.data.status).toBe('unsubscribed')
    expect(updated.body.data.unsubscribed_at).not.toBeNull()
    expectErrors(await staff.put(`/v1/admin/newsletter-subscribers/${active.id}`, { status: 'gone' }), 'status')

    const csv = await staff.get('/v1/admin/newsletter-subscribers/export')
    expectStatus(csv, 200)
    expect(csv.headers['content-type']).toContain('text/csv')
    expect(csv.headers['content-disposition']).toContain('attachment')
    expect(csv.text).toContain('email,status,source,subscribed_at,unsubscribed_at')
    expect(csv.text).toContain('active@example.com,unsubscribed,footer')
    expect(csv.text).toContain("'=cmd@example.com")

    expectStatus(await staff.delete(`/v1/admin/newsletter-subscribers/${active.id}`), 204)
    expectStatus(await staff.delete(`/v1/admin/newsletter-subscribers/${active.id}`), 404)
  })

  it('keeps the subscriber list away from customers', async () => {
    const customer = await actingAs(await makeUser())
    expectStatus(await customer.get('/v1/admin/newsletter-subscribers'), 403)
  })
})

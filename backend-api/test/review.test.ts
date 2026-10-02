import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Prisma } from '../src/generated/prisma/client.js'
import { encryptString } from '../src/lib/crypt.js'
import { prisma } from '../src/lib/prisma.js'
import { ReviewerIdentity } from '../src/services/reviewer-identity.js'
import { makeManager, makeProduct, makeUser } from './factories.js'
import { actingAs, app, type Client, client, diskFiles, diskHas, expectErrors, expectStatus, type FakeFile, fakeFile, fakeImage } from './helpers.js'

type Product = Awaited<ReturnType<typeof makeProduct>>
let product: Product
let sequence = 0

beforeEach(async () => {
  product = await makeProduct({ variant: { price: 500, stock: 20 } })
})

const verify = (contact: string | null, browser: Client = client()) =>
  browser.post(`/v1/products/${product.slug}/reviews/verify`, contact === null ? {} : { contact })

async function tokenFor(contact: string): Promise<string> {
  const res = await verify(contact)
  expectStatus(res, 200)
  return res.body.data.token
}

function writeReview(token: string | null, body: Record<string, unknown>, images?: FakeFile[]) {
  const browser = client()
  if (token !== null) browser.withHeaders({ 'X-Review-Token': token })
  return images ? browser.post(`/v1/products/${product.slug}/reviews`, body, { 'images[]': images }) : browser.post(`/v1/products/${product.slug}/reviews`, body)
}

const withToken = (token: string) => client().withHeaders({ 'X-Review-Token': token })

async function order(attributes: Partial<Prisma.OrderUncheckedCreateInput> = {}) {
  sequence++
  const created = await prisma.order.create({
    data: {
      order_number: `MCTEST${String(sequence).padStart(6, '0')}`,
      customer_name: 'Rahim Uddin',
      customer_email: null,
      customer_phone: '01712345678',
      shipping_address: { address: 'House 1, Road 2', city: 'Dhaka' },
      shipping_method_title: 'Inside Dhaka',
      currency: 'BDT',
      subtotal: 500,
      shipping_cost: 60,
      discount: 0,
      total: 560,
      payment_method: 'cod',
      payment_status: 'paid',
      status: 'delivered',
      delivered_at: new Date(),
      ...attributes,
    },
  })

  await prisma.orderItem.create({
    data: {
      order_id: created.id,
      product_id: product.id,
      product_variant_id: product.variants[0].id,
      product_name: product.name,
      product_slug: product.slug,
      unit_price: 500,
      quantity: 1,
      line_total: 500,
    },
  })

  return created
}

const freshProduct = () => prisma.product.findUniqueOrThrow({ where: { id: product.id } })

describe('reviews', () => {
  it('only lets customers with a delivered order review', async () => {
    let res = await verify('01712345678')
    expectStatus(res, 200)
    expect(res.body.data).toMatchObject({ status: 'no_order', eligible: false, token: null })

    const placed = await order({ status: 'shipped' })
    expect((await verify('01712345678')).body.data.status).toBe('not_delivered')

    await prisma.order.update({ where: { id: placed.id }, data: { status: 'cancelled' } })
    expect((await verify('01712345678')).body.data.status).toBe('no_order')

    await prisma.order.update({ where: { id: placed.id }, data: { status: 'delivered', delivered_at: new Date() } })
    res = await verify('01712345678')
    expectStatus(res, 200)
    expect(res.body.data).toMatchObject({ status: 'can_review', eligible: true, reviewer_name: 'Rahim U.' })
  })

  it('finds the order by phone in any format or by email', async () => {
    await order({ customer_phone: '+880 1712-345678', customer_email: 'Rahim@Example.com' })

    for (const contact of ['01712345678', '+8801712345678', '8801712345678', '1712345678', '017-1234 5678', 'rahim@example.COM']) {
      const res = await verify(contact)
      expectStatus(res, 200)
      expect(res.body.data.status, contact).toBe('can_review')
    }

    expect((await verify('01812345678')).body.data.status).toBe('no_order')
    expect((await verify('other@example.com')).body.data.status).toBe('no_order')
  })

  it('validates the contact input', async () => {
    for (const contact of ['', '12345', 'not-an-email@', '<script>alert(1)</script>', "1' OR '1'='1"]) expectErrors(await verify(contact), 'contact')
  })

  it('lets a buyer write a review with photos', async () => {
    await order()
    const token = await tokenFor('01712345678')

    const res = await writeReview(
      token,
      { rating: 4, comment: '  Lovely fabric and the colour is exactly as shown.\n\n\n\nWould buy again.  ' },
      [await fakeImage('a.jpg', 1200, 900), await fakeImage('b.png', 400, 400)],
    )

    expectStatus(res, 201)
    expect(res.body.data).toMatchObject({
      rating: 4,
      comment: 'Lovely fabric and the colour is exactly as shown.\n\nWould buy again.',
      reviewer_name: 'Rahim U.',
      verified_purchase: true,
    })
    expect(res.body.data.images).toHaveLength(2)
    expect(res.body.data).not.toHaveProperty('reviewer')

    const review = await prisma.productReview.findFirstOrThrow()
    expect(review.reviewer_phone).toBe('01712345678')
    for (const path of review.images as string[]) {
      expect(path).toMatch(/^reviews\/\d{6}\/[a-z0-9]{24}\.webp$/)
      expect(diskHas('uploads', path)).toBe(true)
    }

    const refreshed = await freshProduct()
    expect(Number(refreshed.rating_avg)).toBe(4)
    expect(refreshed.rating_count).toBe(1)

    expectErrors(await writeReview(token, { rating: 5, comment: 'Second review should be blocked.' }), 'review')

    const again = await verify('01712345678')
    expect(again.body.data.status).toBe('already_reviewed')
    expect(again.body.data.review.id).toBe(Number(review.id))
  })

  it('validates review fields', async () => {
    await order()
    const token = await tokenFor('01712345678')

    expectErrors(await writeReview(token, { rating: 6, comment: 'short' }), ['rating', 'comment'])
    expectErrors(await writeReview(token, { rating: 5, comment: 'Great product <script>alert(1)</script>' }), 'comment')

    const five = await Promise.all([1, 2, 3, 4, 5].map((i) => fakeImage(`p${i}.jpg`, 400, 400)))
    expectErrors(await writeReview(token, { rating: 5, comment: 'Five photos is one too many here.' }, five), 'images')

    expectErrors(
      await writeReview(token, { rating: 5, comment: 'This attachment is not an image.' }, [fakeFile('evil.php', 10, 'application/x-php')]),
      'images.0',
    )

    expect(await prisma.productReview.count()).toBe(0)
    expect(diskFiles('uploads')).toEqual([])
  })

  it('requires a review token bound to the product', async () => {
    await order()
    const other = await makeProduct({ variant: { price: 300, stock: 5 } })
    const body = { rating: 5, comment: 'Trying without a valid check.' }

    expectStatus(await writeReview(null, body), 403)
    expectStatus(await writeReview('garbage', body), 403)

    const otherToken = ReviewerIdentity.fromContact('01712345678')!.toToken(other.id)
    expectStatus(await writeReview(otherToken, body), 403)

    const expired = encryptString(
      JSON.stringify({ p: Number(product.id), u: null, ph: '01712345678', em: null, exp: Math.floor(Date.now() / 1000) - 60 }),
    )
    expectStatus(await writeReview(expired, body), 403)

    expect(await prisma.productReview.count()).toBe(0)
  })

  it('allows browsers to send the review token header', async () => {
    const res = await request(app)
      .options(`/v1/products/${product.slug}/reviews`)
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'x-review-token')

    expect(res.status).toBe(204)
    expect(String(res.headers['access-control-allow-headers']).toLowerCase()).toContain('x-review-token')
  })

  it('lets a buyer edit and delete their review', async () => {
    await order({ customer_email: 'rahim@example.com' })
    const token = await tokenFor('01712345678')

    const created = await writeReview(token, { rating: 2, comment: 'Arrived late but the quality is fine.' }, [
      await fakeImage('a.jpg', 600, 600),
      await fakeImage('b.jpg', 600, 600),
    ])
    expectStatus(created, 201)

    const [keep, drop] = created.body.data.images.map((image: { path: string }) => image.path)
    const id = created.body.data.id

    const emailToken = await tokenFor('rahim@example.com')
    const edited = await withToken(emailToken).post(
      `/v1/reviews/${id}`,
      { _method: 'PUT', rating: 5, comment: 'Changed my mind, it is excellent.', keep_images: [keep] },
      { 'images[]': [await fakeImage('c.jpg', 600, 600)] },
    )
    expectStatus(edited, 200)
    expect(edited.body.data.rating).toBe(5)
    expect(edited.body.data.images).toHaveLength(2)
    expect(edited.body.data.images[0].path).toBe(keep)

    expect(diskHas('uploads', keep)).toBe(true)
    expect(diskHas('uploads', drop)).toBe(false)
    expect((await prisma.productReview.findUniqueOrThrow({ where: { id: BigInt(id) } })).edited_at).not.toBeNull()
    expect(Number((await freshProduct()).rating_avg)).toBe(5)

    expectErrors(
      await withToken(emailToken).put(`/v1/reviews/${id}`, { rating: 5, comment: 'Trying to point at other files.', keep_images: ['../../.env'] }),
      'keep_images.0',
    )

    const paths = (await prisma.productReview.findUniqueOrThrow({ where: { id: BigInt(id) } })).images as string[]
    const foreign = `reviews/202601/${'a'.repeat(24)}.webp`
    const ignored = await withToken(emailToken).put(`/v1/reviews/${id}`, {
      rating: 5,
      comment: 'A path I do not own is ignored.',
      keep_images: [...paths, foreign],
    })
    expectStatus(ignored, 200)
    expect(ignored.body.data.images).toHaveLength(2)

    expectStatus(await withToken(emailToken).delete(`/v1/reviews/${id}`), 204)

    expect(await prisma.productReview.findUnique({ where: { id: BigInt(id) } })).toBeNull()
    for (const path of paths) expect(diskHas('uploads', path)).toBe(false)
    expect((await freshProduct()).rating_count).toBe(0)
    expect((await verify('01712345678')).body.data.status).toBe('can_review')
  })

  it("does not let someone else edit or delete a review", async () => {
    await order()
    const review = (await writeReview(await tokenFor('01712345678'), { rating: 5, comment: 'My own honest review.' })).body.data.id

    await order({ customer_phone: '01812345678', customer_name: 'Karim' })
    const strangerToken = await tokenFor('01812345678')

    expectStatus(await withToken(strangerToken).put(`/v1/reviews/${review}`, { rating: 1, comment: 'Hijacking this review.' }), 404)
    expectStatus(await withToken(strangerToken).delete(`/v1/reviews/${review}`), 404)

    expect(await prisma.productReview.count({ where: { id: BigInt(review), rating: 5 } })).toBe(1)
  })

  it('lets a signed-in customer check without typing a contact', async () => {
    const user = await makeUser({ phone: '01912345678' })
    await order({ user_id: user.id, customer_phone: '01900000000', customer_email: null })

    expectErrors(await verify(null), 'contact')

    const res = await verify(null, await actingAs(user))
    expectStatus(res, 200)
    expect(res.body.data.status).toBe('can_review')

    expectStatus(await writeReview(res.body.data.token, { rating: 3, comment: 'Decent for the price.' }), 201)
    expect(await prisma.productReview.count({ where: { user_id: user.id } })).toBe(1)
  })

  it('lists published reviews publicly with a summary', async () => {
    await order()
    await order({ customer_phone: '01812345678', customer_name: 'Karim' })
    expectStatus(
      await writeReview(await tokenFor('01712345678'), { rating: 5, comment: 'Beautiful, exactly as pictured.' }, [await fakeImage('a.jpg', 600, 600)]),
      201,
    )
    expectStatus(await writeReview(await tokenFor('01812345678'), { rating: 3, comment: 'Good but runs a bit small.' }), 201)

    const res = await client().get(`/v1/products/${product.slug}/reviews`)
    expectStatus(res, 200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.summary).toMatchObject({ average: 4, count: 2, with_photos: 1 })
    expect(res.body.summary.breakdown['5']).toBe(1)
    expect(res.body.summary.breakdown['3']).toBe(1)
    expect(res.body.data[0]).not.toHaveProperty('reviewer')

    expect((await client().get(`/v1/products/${product.slug}/reviews?with_photos=1`)).body.data).toHaveLength(1)
    expect((await client().get(`/v1/products/${product.slug}/reviews?rating=3`)).body.data[0].rating).toBe(3)
    expect((await client().get(`/v1/products/${product.slug}/reviews?sort=lowest`)).body.data[0].rating).toBe(3)
    expectStatus(await client().get(`/v1/products/${product.slug}/reviews?sort=drop`), 422)

    const detail = await client().get(`/v1/products/${product.slug}`)
    expectStatus(detail, 200)
    expect(detail.body.data.rating).toMatchObject({ average: 4, count: 2 })
  })

  it('lets staff hide and delete reviews', async () => {
    await order()
    await order({ customer_phone: '01812345678', customer_name: 'Karim' })
    const keep = (await writeReview(await tokenFor('01712345678'), { rating: 5, comment: 'Beautiful, exactly as pictured.' })).body.data.id
    const spam = (await writeReview(await tokenFor('01812345678'), { rating: 1, comment: 'Visit my shop for cheaper.' })).body.data.id

    expectStatus(await client().get('/v1/admin/reviews'), 401)
    expectStatus(await (await actingAs(await makeUser())).get('/v1/admin/reviews'), 403)

    const staff = await actingAs(await makeManager())

    const search = await staff.get('/v1/admin/reviews?q=Karim')
    expectStatus(search, 200)
    expect(search.body.data).toHaveLength(1)
    expect(search.body.data[0].reviewer.phone).toBe('01812345678')
    expect(search.body.data[0].product.slug).toBe(product.slug)
    expect(search.body.counts.published).toBe(2)

    expectStatus(await staff.patch(`/v1/admin/reviews/${spam}`, { status: 'deleted' }), 422)
    const hidden = await staff.patch(`/v1/admin/reviews/${spam}`, { status: 'hidden' })
    expectStatus(hidden, 200)
    expect(hidden.body.data.status).toBe('hidden')

    const refreshed = await freshProduct()
    expect(Number(refreshed.rating_avg)).toBe(5)
    expect(refreshed.rating_count).toBe(1)

    const publicList = await client().get(`/v1/products/${product.slug}/reviews`)
    expect(publicList.body.data).toHaveLength(1)
    expect(publicList.body.data[0].id).toBe(keep)

    const hiddenList = await staff.get('/v1/admin/reviews?status=hidden')
    expect(hiddenList.body.data).toHaveLength(1)
    expect(hiddenList.body.counts.hidden).toBe(1)

    expectStatus(await staff.delete(`/v1/admin/reviews/${spam}`), 204)
    expect(await prisma.productReview.findUnique({ where: { id: BigInt(spam) } })).toBeNull()
  })

  it('includes status counts in the admin order list', async () => {
    await order()
    await order({ status: 'pending' })
    await order({ status: 'pending' })

    const res = await (await actingAs(await makeManager())).get('/v1/admin/orders')
    expectStatus(res, 200)
    expect(res.body.counts).toMatchObject({ pending: 2, delivered: 1, cancelled: 0 })
  })
})

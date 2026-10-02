import { describe, expect, it } from 'vitest'
import { prisma } from '../src/lib/prisma.js'
import { makeCategory, makeProduct } from './factories.js'
import { client, expectStatus } from './helpers.js'

describe('catalog', () => {
  it('lists only published products in active categories', async () => {
    const visible = await makeProduct({ variant: { price: 300 } })
    await makeProduct({ status: 'draft' })
    await makeProduct({ category_id: (await makeCategory({ is_active: false })).id })

    const res = await client().get('/v1/products')
    expectStatus(res, 200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].slug).toBe(visible.slug)
    expect(res.body.data[0].price).toBe(300)
    expect(res.body).toHaveProperty('links')
    expect(res.body).toHaveProperty('meta')
  })

  it('filters and sorts products', async () => {
    const shirts = await makeCategory({ name: 'Shirts' })
    await makeProduct({ category_id: shirts.id, name: 'Linen Shirt', variant: { price: 900 } })
    await makeProduct({ category_id: shirts.id, name: 'Cotton Shirt', variant: { price: 400 } })
    await makeProduct({ name: 'Cap', variant: { price: 100 } })

    const sorted = await client().get('/v1/products?category=shirts&sort=price_asc')
    expectStatus(sorted, 200)
    expect(sorted.body.data.map((product: { name: string }) => product.name)).toEqual(['Cotton Shirt', 'Linen Shirt'])

    const cap = await prisma.product.findFirstOrThrow({ where: { name: 'Cap' }, include: { category: true } })
    expect((await client().get(`/v1/products?category=shirts,${cap.category.slug}`)).body.data).toHaveLength(3)
    expect((await client().get('/v1/products?q=linen')).body.data).toHaveLength(1)
    expect((await client().get('/v1/products?max_price=450')).body.data).toHaveLength(2)
  })

  it('shows product detail by slug and hides drafts', async () => {
    const product = await makeProduct({ name: 'Jamdani Saree' })
    const draft = await makeProduct({ status: 'draft' })

    const res = await client().get('/v1/products/jamdani-saree')
    expectStatus(res, 200)
    expect(res.body.data.id).toBe(Number(product.id))
    for (const key of ['variants', 'images', 'category', 'description']) expect(res.body.data).toHaveProperty(key)

    const hidden = await client().get(`/v1/products/${draft.slug}`)
    expectStatus(hidden, 404)
    expect(hidden.body).toMatchObject({ message: 'Resource not found.' })
  })

  it('lists categories with published product counts', async () => {
    const category = await makeCategory()
    await makeProduct({ category_id: category.id })
    await makeProduct({ category_id: category.id })
    await makeProduct({ category_id: category.id, status: 'draft' })

    const res = await client().get('/v1/categories')
    expectStatus(res, 200)
    expect(res.body.data[0].products_count).toBe(2)
  })
})

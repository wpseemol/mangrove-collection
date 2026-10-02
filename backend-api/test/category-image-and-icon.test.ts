import { join } from 'node:path'
import sharp from 'sharp'
import { beforeEach, describe, expect, it } from 'vitest'
import { paths } from '../src/lib/paths.js'
import { prisma } from '../src/lib/prisma.js'
import { makeManager } from './factories.js'
import { actingAs, type Client, diskFiles, diskHas, expectErrors, expectStatus, fakeFile, fakeImage } from './helpers.js'

let staff: Client

beforeEach(async () => {
  staff = await actingAs(await makeManager())
})

const soleCategory = () => prisma.category.findFirstOrThrow()

describe('category images and icons', () => {
  it('has between 300 and 350 renderable icons', async () => {
    const res = await staff.get('/v1/category-icons')
    expectStatus(res, 200)
    expect(res.headers['cache-control']).toBeTruthy()

    const icons = res.body.data as { name: string; nodes: [string, unknown][] }[]
    expect(icons.length).toBeGreaterThanOrEqual(300)
    expect(icons.length).toBeLessThanOrEqual(350)
    expect(icons.map((icon) => icon.name)).toContain('fish')

    for (const icon of icons) {
      expect(icon.nodes.length).toBeGreaterThan(0)
      for (const [tag] of icon.nodes) expect(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse']).toContain(tag)
    }
  })

  it('stores the image under uploads/category named after the category', async () => {
    const res = await staff.post('/v1/admin/categories', { name: 'Sundarban Honey', icon: 'hexagon' }, { image: await fakeImage('anything.png', 1200, 900) })

    expectStatus(res, 201)
    expect(res.body.data.icon).toBe('hexagon')
    expect(res.body.data).toHaveProperty('icon_nodes')

    const path = (await soleCategory()).image!
    expect(path).toMatch(/^category\/sundarban-honey-[a-z0-9]{8}\.webp$/)
    expect(diskHas('uploads', path)).toBe(true)
    expect(res.body.data.image.endsWith(`/${path}`)).toBe(true)

    const { width, height } = await sharp(join(paths.uploads, path)).metadata()
    expect([width, height]).toEqual([800, 600])
  })

  it('requires the image to match the dimensions', async () => {
    expectErrors(await staff.post('/v1/admin/categories', { name: 'Fish' }, { image: await fakeImage('small.jpg', 400, 300) }), 'image')
    expectErrors(await staff.post('/v1/admin/categories', { name: 'Fish' }, { image: await fakeImage('square.jpg', 1000, 1000) }), 'image')
    expectErrors(await staff.post('/v1/admin/categories', { name: 'Fish' }, { image: fakeFile('shell.php', 10, 'image/jpeg') }), 'image')

    expect(diskFiles('uploads').filter((file) => file.startsWith('category/'))).toEqual([])
  })

  it('rejects unknown icons', async () => {
    expectErrors(await staff.post('/v1/admin/categories', { name: 'Fish', icon: '"><script>' }), 'icon')
  })

  it('deletes the old file when the image is replaced or removed', async () => {
    expectStatus(await staff.post('/v1/admin/categories', { name: 'Crab' }, { image: await fakeImage('a.jpg', 800, 600) }), 201)

    const category = await soleCategory()
    const first = category.image!

    expectStatus(await staff.post(`/v1/admin/categories/${category.id}`, { _method: 'PUT' }, { image: await fakeImage('b.jpg', 1600, 1200) }), 200)

    const second = (await soleCategory()).image!
    expect(second).not.toBe(first)
    expect(diskHas('uploads', first)).toBe(false)
    expect(diskHas('uploads', second)).toBe(true)

    const removed = await staff.post(`/v1/admin/categories/${category.id}`, { _method: 'PUT', remove_image: '1' }, {})
    expectStatus(removed, 200)
    expect(removed.body.data.image).toBeNull()
    expect(diskHas('uploads', second)).toBe(false)
  })

  it('deletes the image together with the category', async () => {
    expectStatus(await staff.post('/v1/admin/categories', { name: 'Prawn' }, { image: await fakeImage('a.jpg', 800, 600) }), 201)

    const category = await soleCategory()
    expectStatus(await staff.delete(`/v1/admin/categories/${category.id}`), 204)
    expect(diskHas('uploads', category.image!)).toBe(false)
  })

  it('rejects html, php and sql in category fields', async () => {
    for (const payload of ['<script>alert(1)</script>', '<?php system("id"); ?>', "Fish' OR '1'='1", 'x UNION SELECT password FROM users']) {
      expectErrors(await staff.post('/v1/admin/categories', { name: payload }), 'name')
    }

    expectStatus(await staff.post('/v1/admin/categories', { name: 'Fish & Seafood', description: "Fresh hilsa, 1-2 kg each. Rahim's pick!" }), 201)
  })
})

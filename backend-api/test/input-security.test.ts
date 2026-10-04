import { describe, expect, it } from 'vitest'
import { isSafeHtml, isSafeUrl, isUnsafeText } from '../src/validation/rules.js'
import { makeCategory, makeManager, makeUser } from './factories.js'
import { actingAs, client, DASHBOARD, diskFiles, expectErrors, expectStatus, fakeImage, storefront } from './helpers.js'

describe('input security', () => {
  it.each([
    ['script tag', '<script>alert(1)</script>'],
    ['img onerror', '<img src=x onerror=alert(1)>'],
    ['php open tag', '<?php echo 1;'],
    ['php close tag', 'name ?>'],
    ['html comment', '<!-- hi -->'],
    ['javascript url', 'javascript:alert(1)'],
    ['or 1=1', "admin' OR 1=1"],
    ['comment out', "admin'--"],
    ['union select', '1 UNION ALL SELECT email FROM users'],
    ['stacked drop', 'x; DROP TABLE users'],
    ['sleep', '1 AND sleep(5)'],
    ['null byte', 'abc\0def'],
  ])('safe text rejects %s', (_name, payload) => {
    expect(isUnsafeText(payload)).toBe(true)
  })

  it('safe text allows normal writing', () => {
    for (const text of [
      'Sundarban honey 500g — pure & raw',
      "Rahim's shop, Road #4, Khulna-9100",
      'Price < 500 tk? Ask us: 01712-345678',
      'Select the size you want and update the cart',
      'Line one\nLine two',
      'মধু ও মাছ',
    ]) {
      expect(isUnsafeText(text), text).toBe(false)
    }
  })

  it('safe html allows formatting but not scripts', () => {
    expect(
      isSafeHtml('<p>Fresh <strong>hilsa</strong></p><ul><li>1 kg</li></ul><a href="https://example.com" target="_blank" rel="noopener">More</a>'),
    ).toBe(true)

    for (const html of [
      '<script>alert(1)</script>',
      '<p onclick="alert(1)">x</p>',
      '<a href="javascript:alert(1)">x</a>',
      '<iframe src="https://evil.test"></iframe>',
      '<p style="background:url(x)">x</p>',
      '<?php echo 1; ?>',
      '<img src=x onerror=alert(1)>',
      '<p>unclosed <script',
      '<a href="/\\evil.test">x</a>',
    ]) {
      expect(isSafeHtml(html), html).toBe(false)
    }
  })

  it('validates urls', () => {
    expect(isSafeUrl('https://cdn.example.com/a.jpg')).toBe(true)
    expect(isSafeUrl('/shop?category=honey', true)).toBe(true)
    expect(isSafeUrl('/shop', false)).toBe(false)
    expect(isSafeUrl('javascript:alert(1)', true)).toBe(false)
    expect(isSafeUrl('//evil.test/x', true)).toBe(false)
    expect(isSafeUrl('https://x.test/"onmouseover="alert(1)')).toBe(false)
  })

  it('rejects markup in storefront forms', async () => {
    expectErrors(
      await client().post('/v1/auth/register', {
        name: '<b>Hacker</b>',
        email: 'hacker@example.com',
        phone: "01712345678' OR '1'='1",
        password: 'password123',
        password_confirmation: 'password123',
      }),
      ['name', 'phone'],
    )

    expectErrors(await client().get(`/v1/products?q=${encodeURIComponent("' UNION SELECT password FROM users--")}`), 'q')
    expectErrors(await client().get(`/v1/orders/track?order_number=${encodeURIComponent("MC-1' OR 1=1--")}&phone=01712345678`), 'order_number')
  })

  it('only accepts basic html in admin product descriptions', async () => {
    const browser = await actingAs(await makeManager())
    const category = await makeCategory()
    const payload = (description: string) => ({
      category_id: Number(category.id),
      name: 'Honey',
      description,
      variants: [{ title: '500g', price: 600 }],
    })

    expectStatus(await browser.post('/v1/admin/products', payload('<p>Pure <em>raw</em> honey</p>')), 201)
    expectErrors(await browser.post('/v1/admin/products', payload('<p>Hi</p><script>steal()</script>')), 'description')
  })

  it('adds security headers to api responses', async () => {
    const res = await client().get('/v1/categories')
    expectStatus(res, 200)
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['x-frame-options']).toBe('DENY')
    expect(res.headers['referrer-policy']).toBe('no-referrer')
  })

  it('rate limits uploads', async () => {
    const browser = await actingAs(await makeManager())

    for (let i = 0; i < 20; i++) expectStatus(await browser.post('/v1/admin/categories', { name: '' }), 422)
    expectStatus(await browser.post('/v1/admin/categories', { name: '' }), 429)
  })

  it('never stores admin uploads from guests or customers', async () => {
    const photo = await fakeImage('a.jpg', 50, 50)

    expectStatus(await storefront().post('/v1/admin/media', {}, { file: photo }), 401)
    expectStatus(await (await actingAs(await makeUser(), DASHBOARD)).post('/v1/admin/media', {}, { file: photo }), 403)
    expect(diskFiles('public')).toEqual([])
  })

  it('caps how many files an anonymous request can upload', async () => {
    const photos = await Promise.all([1, 2, 3, 4, 5, 6].map((i) => fakeImage(`p${i}.jpg`, 20, 20)))
    const res = await storefront().post('/v1/reviews/1', { _method: 'PUT' }, { 'images[]': photos })
    expectStatus(res, 422)
    expect(res.body.message).toBe('Too many files were uploaded.')
  })
})

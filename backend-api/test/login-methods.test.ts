import { beforeEach, describe, expect, it } from 'vitest'
import { outbox } from '../src/services/mail.js'
import { settings } from '../src/services/settings.js'
import { makeAdmin, makeManager, makeUser } from './factories.js'
import { actingAs, client, expectErrors, expectStatus, storefront } from './helpers.js'

beforeEach(async () => {
  await settings.syncDefaults()
})

const turnOffPasswordLogin = () => settings.update({ password_login_enabled: false })

describe('email and password sign-in switch', () => {
  it('is on by default and public', async () => {
    expect((await client().get('/v1/settings')).body.data.password_login_enabled).toBe(true)
  })

  it('blocks customer login and registration when turned off', async () => {
    await makeUser({ email: 'karim@example.com' })
    await turnOffPasswordLogin()

    expectErrors(await storefront().post('/v1/auth/login', { login: 'karim@example.com', password: 'password' }), 'login')
    expectStatus(
      await storefront().post('/v1/auth/register', {
        name: 'Rahim',
        email: 'rahim@example.com',
        password: 'secret-pass',
        password_confirmation: 'secret-pass',
      }),
      403,
    )
  })

  it('keeps staff able to sign in so the dashboard never locks itself out', async () => {
    await makeAdmin({ email: 'admin@example.com' })
    await makeManager({ email: 'manager@example.com' })
    await turnOffPasswordLogin()

    expectStatus(await storefront().post('/v1/auth/login', { login: 'admin@example.com', password: 'password' }), 200)
    expectStatus(await storefront().post('/v1/auth/dashboard/login', { login: 'manager@example.com', password: 'password' }), 200)
  })

  it('only sends reset links to staff when turned off', async () => {
    await makeUser({ email: 'customer@example.com' })
    await makeAdmin({ email: 'admin@example.com' })
    await turnOffPasswordLogin()
    outbox.length = 0

    expectStatus(await client().post('/v1/auth/forgot-password', { email: 'customer@example.com' }), 200)
    expectStatus(await client().post('/v1/auth/forgot-password', { email: 'admin@example.com' }), 200)

    expect(outbox.map((mail) => mail.to)).toEqual(['admin@example.com'])
  })
})

describe('revealing saved secrets', () => {
  it('returns the decrypted secret only with the admin password', async () => {
    await settings.update({ google_client_secret: 'GOCSPX-secret' })
    const admin = await actingAs(await makeAdmin())

    expectErrors(await admin.post('/v1/admin/settings/reveal', { key: 'google_client_secret', password: 'wrong' }), 'password')
    expectErrors(await admin.post('/v1/admin/settings/reveal', { key: 'google_client_secret', password: '' }), 'password')

    const res = await admin.post('/v1/admin/settings/reveal', { key: 'google_client_secret', password: 'password' })
    expectStatus(res, 200)
    expect(res.body.data).toEqual({ key: 'google_client_secret', value: 'GOCSPX-secret' })
  })

  it('only reveals encrypted settings and returns null when nothing is saved', async () => {
    const admin = await actingAs(await makeAdmin())

    expectErrors(await admin.post('/v1/admin/settings/reveal', { key: 'site_name', password: 'password' }), 'key')
    expect((await admin.post('/v1/admin/settings/reveal', { key: 'mail_password', password: 'password' })).body.data.value).toBeNull()
  })

  it('is admin-only', async () => {
    await settings.update({ google_client_secret: 'GOCSPX-secret' })

    expectStatus(await (await actingAs(await makeManager())).post('/v1/admin/settings/reveal', { key: 'google_client_secret', password: 'password' }), 403)
    expectStatus(await (await actingAs(await makeUser())).post('/v1/admin/settings/reveal', { key: 'google_client_secret', password: 'password' }), 403)
  })
})

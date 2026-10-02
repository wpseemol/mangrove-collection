import { describe, expect, it } from 'vitest'
import { revokeUserSessions } from '../src/auth/session.js'
import { prisma } from '../src/lib/prisma.js'
import { outbox } from '../src/services/mail.js'
import { hashPassword as hash, passwordResets } from '../src/services/password-resets.js'
import { makeManager, makeUser } from './factories.js'
import { actingAs, client, expectErrors, expectStatus, storefront } from './helpers.js'

const login = (overrides: Record<string, unknown> = {}) => ({ login: 'a@example.com', password: 'secret-pass', ...overrides })
const setCookie = (res: { headers: Record<string, unknown> }, name: string) =>
  ((res.headers['set-cookie'] as string[] | undefined) ?? []).find((cookie) => cookie.startsWith(`${name}=`))

describe('auth', () => {
  it('lets a customer register and signs them in with a session', async () => {
    const browser = storefront()
    const res = await browser.post('/v1/auth/register', {
      name: 'Rahim',
      email: 'rahim@example.com',
      phone: '01700000000',
      password: 'secret-pass',
      password_confirmation: 'secret-pass',
    })

    expectStatus(res, 201)
    expect(res.body).not.toHaveProperty('token')
    expect(res.body.user.role).toBe('customer')

    const me = await browser.get('/v1/auth/me')
    expectStatus(me, 200)
    expect(me.body.data.email).toBe('rahim@example.com')
  })

  it('logs in with email or phone', async () => {
    await makeUser({ email: 'karim@example.com', phone: '01811111111', password: await hash('secret-pass') })

    expectStatus(await storefront().post('/v1/auth/login', { login: 'karim@example.com', password: 'secret-pass' }), 200)
    expectStatus(await storefront().post('/v1/auth/login', { login: '01811111111', password: 'secret-pass' }), 200)
    expectErrors(await storefront().post('/v1/auth/login', { login: 'karim@example.com', password: 'wrong' }), 'login')
  })

  it('sets an http-only session cookie and never returns a token', async () => {
    await makeUser({ email: 'a@example.com', password: await hash('secret-pass') })

    const res = await storefront().post('/v1/auth/login', login())

    expectStatus(res, 200)
    expect(res.body).not.toHaveProperty('token')
    expect(res.body.user.email).toBe('a@example.com')
    expect(res.headers['cache-control']).toBe('no-store, private')

    const cookie = setCookie(res, 'mangrove_session')
    expect(cookie).toBeDefined()
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)
  })

  it('sets a remember cookie only when asked', async () => {
    await makeUser({ email: 'a@example.com', password: await hash('secret-pass') })

    expect(setCookie(await storefront().post('/v1/auth/login', login()), 'mangrove_remember')).toBeUndefined()
    expect(setCookie(await storefront().post('/v1/auth/login', login({ remember: true })), 'mangrove_remember')).toBeDefined()
  })

  it('refuses logins from unknown origins', async () => {
    await makeUser({ email: 'a@example.com', password: await hash('secret-pass') })

    expectStatus(await client().withHeaders({ Origin: 'https://evil.example' }).post('/v1/auth/login', login()), 403)
    expectStatus(await client().post('/v1/auth/login', login()), 403)
    expect(await prisma.session.count({ where: { user_id: { not: null } } })).toBe(0)
  })

  it('does not accept bearer tokens', async () => {
    await makeUser()
    expectStatus(await client().withHeaders({ Authorization: 'Bearer 1|legacy-token' }).get('/v1/auth/me'), 401)
  })

  it('reports the signed-in user on the session endpoint without a 401 for guests', async () => {
    const browser = storefront()
    const guest = await browser.get('/v1/auth/session')
    expectStatus(guest, 200)
    expect(guest.body).toMatchObject({ authenticated: false, user: null })

    const user = await makeUser({ email: 's@example.com', password: await hash('secret-pass') })
    await browser.post('/v1/auth/login', { login: 's@example.com', password: 'secret-pass' })

    const res = await browser.get('/v1/auth/session')
    expectStatus(res, 200)
    expect(res.body.authenticated).toBe(true)
    expect(res.body.user.id).toBe(Number(user.id))
  })

  it('ends the session on logout', async () => {
    await makeUser({ email: 'a@example.com', password: await hash('secret-pass') })
    const browser = storefront()

    await browser.post('/v1/auth/login', login())
    const me = await browser.get('/v1/auth/me')
    expectStatus(me, 200)
    expect(me.body.data.email).toBe('a@example.com')

    expectStatus(await browser.post('/v1/auth/logout'), 200)
    expectStatus(await browser.get('/v1/auth/me'), 401)
  })

  it('deletes stored sessions and rotates the remember token when revoking', async () => {
    const user = await makeUser({ remember_token: 'old-token' })
    const other = await makeUser()
    const now = Math.floor(Date.now() / 1000)

    await prisma.session.createMany({
      data: [
        { id: 'keep-me', user_id: user.id, payload: '', last_activity: now },
        { id: 'drop-me', user_id: user.id, payload: '', last_activity: now },
        { id: 'someone-else', user_id: other.id, payload: '', last_activity: now },
      ],
    })

    await revokeUserSessions(user.id, 'keep-me')

    expect((await prisma.session.findMany({ orderBy: { id: 'asc' } })).map((session) => session.id)).toEqual(['keep-me', 'someone-else'])
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).remember_token).not.toBe('old-token')
  })

  it('signs the user out everywhere after a password reset', async () => {
    const user = await makeUser({ email: 'r@example.com' })
    await prisma.session.create({ data: { id: 'old', user_id: user.id, payload: '', last_activity: Math.floor(Date.now() / 1000) } })

    const token = await passwordResets.createToken(user)

    const res = await storefront().post('/v1/auth/reset-password', {
      token,
      email: 'r@example.com',
      password: 'new-secret-pass',
      password_confirmation: 'new-secret-pass',
    })

    expectStatus(res, 200)
    expect(await prisma.session.findUnique({ where: { id: 'old' } })).toBeNull()
  })

  it('does not let deactivated users log in', async () => {
    await makeUser({ email: 'off@example.com', password: await hash('secret-pass'), is_active: false })
    expectStatus(await storefront().post('/v1/auth/login', { login: 'off@example.com', password: 'secret-pass' }), 422)
  })

  it('restricts the dashboard login to staff', async () => {
    await makeUser({ email: 'c@example.com', password: await hash('secret-pass') })
    await makeManager({ email: 'm@example.com', password: await hash('secret-pass') })

    expectStatus(await storefront().post('/v1/auth/dashboard/login', { login: 'c@example.com', password: 'secret-pass' }), 422)

    const res = await storefront().post('/v1/auth/dashboard/login', { login: 'm@example.com', password: 'secret-pass' })
    expectStatus(res, 200)
    expect(res.body.user.role).toBe('manager')
  })

  it('keeps customers out of admin endpoints', async () => {
    const browser = await actingAs(await makeUser())
    expectStatus(await browser.get('/v1/admin/dashboard'), 403)
  })

  it('keeps managers out of admin-only endpoints', async () => {
    const browser = await actingAs(await makeManager())

    expectStatus(await browser.get('/v1/admin/dashboard'), 200)
    expectStatus(await browser.get('/v1/admin/settings'), 403)
    expectStatus(await browser.get('/v1/admin/users'), 403)
  })

  it('points the password reset link to the storefront', async () => {
    await makeUser({ email: 'reset@example.com' })

    expectStatus(await client().post('/v1/auth/forgot-password', { email: 'reset@example.com' }), 200)
    expectStatus(await client().post('/v1/auth/forgot-password', { email: 'nobody@example.com' }), 200)

    expect(outbox).toHaveLength(1)
    expect(outbox[0].to).toBe('reset@example.com')
    expect(outbox[0].action?.url.startsWith('https://mangrove-collection.com/reset-password/?token=')).toBe(true)
  })

  it('answers unauthenticated requests with a JSON 401', async () => {
    const res = await client().get('/v1/auth/me')
    expectStatus(res, 401)
    expect(res.body).toEqual({ message: 'Unauthenticated.' })
  })
})


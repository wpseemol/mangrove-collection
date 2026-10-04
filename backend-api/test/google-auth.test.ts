import { describe, expect, it, vi } from 'vitest'
import { prisma } from '../src/lib/prisma.js'
import { google } from '../src/services/google.js'
import { settings } from '../src/services/settings.js'
import { makeUser } from './factories.js'
import { client, expectStatus, storefront } from './helpers.js'

const configureGoogle = () =>
  settings.update({
    google_login_enabled: true,
    google_client_id: 'client-123',
    google_client_secret: 'secret-xyz',
    google_redirect_uri: 'http://localhost:3000/auth/google/callback',
  })

function mockGoogleUser(id: string, email: string) {
  google.fake({
    async userFromToken(token) {
      if (token !== 'valid-token') throw new Error('Unexpected token')
      return { id, name: 'Google User', email, avatar: 'https://lh3.googleusercontent.com/a.png', emailVerified: true }
    },
  })
}

describe('google auth', () => {
  it('returns 503 when google is not configured', async () => {
    expectStatus(await client().post('/v1/auth/google', { access_token: 'x' }), 503)
  })

  it('loads the google credentials from the database', async () => {
    await configureGoogle()

    expect(await google.configured(true)).toBe(true)
    const url = new URL(await google.redirectUrl())
    expect(url.searchParams.get('client_id')).toBe('client-123')
    expect(await settings.get('google_client_secret')).toBe('secret-xyz')
  })

  it('creates and logs in a user from a google access token', async () => {
    await configureGoogle()
    mockGoogleUser('g-1', 'new@gmail.com')

    const res = await storefront().post('/v1/auth/google', { access_token: 'valid-token' })

    expectStatus(res, 200)
    expect(res.body).not.toHaveProperty('token')
    expect(res.body.user).toMatchObject({ email: 'new@gmail.com', google_linked: true })
    expect(await prisma.user.count({ where: { email: 'new@gmail.com', google_id: 'g-1' } })).toBe(1)
  })

  it('rejects access tokens that were issued to a different google app', async () => {
    await configureGoogle()
    const requested: string[] = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      requested.push(String(input))
      return Response.json({ aud: 'someone-elses-client', azp: 'someone-elses-client', sub: 'g-9', email: 'victim@gmail.com', email_verified: true })
    })

    const res = await storefront().post('/v1/auth/google', { access_token: 'stolen-token' })

    expectStatus(res, 422)
    expect(res.body.errors).toHaveProperty('google')
    expect(requested.some((url) => url.includes('/userinfo'))).toBe(false)
    expect(await prisma.user.count({ where: { email: 'victim@gmail.com' } })).toBe(0)
  })

  it('links an existing account by email', async () => {
    await configureGoogle()
    const existing = await makeUser({ email: 'old@gmail.com' })
    mockGoogleUser('g-2', 'old@gmail.com')

    const res = await storefront().post('/v1/auth/google', { access_token: 'valid-token' })

    expectStatus(res, 200)
    expect(res.body.user.id).toBe(Number(existing.id))
    expect((await prisma.user.findUniqueOrThrow({ where: { id: existing.id } })).google_id).toBe('g-2')
  })
})

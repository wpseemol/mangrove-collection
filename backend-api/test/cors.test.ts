import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app, client, expectStatus } from './helpers.js'

const allowed = ['https://mangrove-collection.com', 'https://dashboard.mangrove-collection.com', 'http://localhost:3000', 'http://localhost:5173']

describe('cors', () => {
  it.each(allowed)('sends credentialed cors headers to %s', async (origin) => {
    const res = await client().withHeaders({ Origin: origin }).get('/v1/settings')
    expectStatus(res, 200)
    expect(res.headers['access-control-allow-origin']).toBe(origin)
    expect(res.headers['access-control-allow-credentials']).toBe('true')
  })

  it.each(allowed)('allows the csrf header in preflights from %s', async (origin) => {
    const res = await request(app)
      .options('/v1/auth/login')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'x-xsrf-token,content-type')

    expect(res.status).toBe(204)
    expect(res.headers['access-control-allow-origin']).toBe(origin)
    expect(res.headers['access-control-allow-credentials']).toBe('true')
    expect(String(res.headers['access-control-allow-headers']).toLowerCase()).toContain('x-xsrf-token')
  })

  it('does not allow unknown origins', async () => {
    for (const origin of ['https://evil.example.com', 'https://mangrove-collection.com.evil.io', 'http://mangrove-collection.com', 'http://localhost:8080']) {
      const res = await client().withHeaders({ Origin: origin }).get('/v1/settings')
      expect(res.headers['access-control-allow-origin']).not.toBe(origin)
    }
  })
})

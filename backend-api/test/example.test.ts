import { describe, expect, it } from 'vitest'
import { client, expectStatus } from './helpers.js'

describe('application', () => {
  it('returns a successful response', async () => {
    const res = await client().get('/')
    expectStatus(res, 200)
    expect(res.body).toMatchObject({ version: 'v1' })
  })
})

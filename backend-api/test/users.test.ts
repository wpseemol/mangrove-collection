import { describe, expect, it } from 'vitest'
import { prisma } from '../src/lib/prisma.js'
import { makeAdmin, makeManager, makeUser } from './factories.js'
import { actingAs, expectErrors, expectStatus } from './helpers.js'

describe('managing users', () => {
  it('lists users with role and status counts, and filters by status', async () => {
    const admin = await makeAdmin()
    await makeManager()
    await makeUser()
    await makeUser({ is_active: false })
    const client = await actingAs(admin)

    const all = await client.get('/v1/admin/users')
    expectStatus(all, 200)
    expect(all.body.meta.total).toBe(4)
    expect(all.body.counts).toEqual({ customer: 2, manager: 1, admin: 1, inactive: 1 })

    const inactive = await client.get('/v1/admin/users?status=inactive')
    expect(inactive.body.data).toHaveLength(1)
    expect(inactive.body.data[0].is_active).toBe(false)

    expect((await client.get('/v1/admin/users?role=manager&status=active')).body.data).toHaveLength(1)
    expectErrors(await client.get('/v1/admin/users?status=banned'), 'status')
  })

  it('adds a new admin or employee who can sign in straight away', async () => {
    const client = await actingAs(await makeAdmin())

    const res = await client.post('/v1/admin/users', { name: 'Sumi Akter', email: 'sumi@example.com', password: 'strong-pass-1', role: 'manager' })
    expectStatus(res, 201)
    expect(res.body.data).toMatchObject({ email: 'sumi@example.com', role: 'manager', is_active: true })

    expectErrors(await client.post('/v1/admin/users', { name: 'Again', email: 'sumi@example.com', password: 'strong-pass-1', role: 'admin' }), 'email')
    expectErrors(await client.post('/v1/admin/users', { name: 'Short', email: 'short@example.com', password: 'short', role: 'admin' }), 'password')
  })

  it('edits a user and signs them out when their access changes', async () => {
    const client = await actingAs(await makeAdmin())
    const manager = await makeManager()
    await actingAs(manager)

    const res = await client.patch(`/v1/admin/users/${manager.id}`, { name: 'New Name', role: 'customer', is_active: false })
    expectStatus(res, 200)
    expect(res.body.data).toMatchObject({ name: 'New Name', role: 'customer', is_active: false })
    expect(await prisma.session.count({ where: { user_id: manager.id } })).toBe(0)
  })

  it('deletes a user, and protects your own account', async () => {
    const admin = await makeAdmin()
    const client = await actingAs(admin)
    const customer = await makeUser()

    expectStatus(await client.delete(`/v1/admin/users/${customer.id}`), 204)
    expect(await prisma.user.findUnique({ where: { id: customer.id } })).toBeNull()

    expectStatus(await client.delete(`/v1/admin/users/${admin.id}`), 409)
    expectStatus(await client.patch(`/v1/admin/users/${admin.id}`, { role: 'manager' }), 409)
  })

  it('is admin-only', async () => {
    const user = await makeUser()
    expectStatus(await (await actingAs(await makeManager())).get('/v1/admin/users'), 403)
    expectStatus(await (await actingAs(await makeManager())).delete(`/v1/admin/users/${user.id}`), 403)
  })
})

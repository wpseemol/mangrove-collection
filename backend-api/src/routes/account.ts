import { Router, type Request } from 'express'
import { currentUser, requireActive, requireAuth } from '../auth/guards.js'
import { revokeUserSessions } from '../auth/session.js'
import { fail, notFound, routeId, ValidationError } from '../lib/http.js'
import { paginate } from '../lib/paginate.js'
import { prisma } from '../lib/prisma.js'
import { storage } from '../lib/storage.js'
import { random } from '../lib/str.js'
import { throttle } from '../middleware/rate-limit.js'
import { addressResource, orderResource, userResource } from '../resources/index.js'
import { checkImage, extensionFor } from '../services/images.js'
import { ORDER_STATUSES, orderInclude, orders, withLatestPayment } from '../services/orders.js'
import { checkPassword, hashPassword } from '../services/password-resets.js'
import { bool, confirmed, email, int, lowercaseEmail, oneOf, opt, phone, text, url, validate, z } from '../validation/index.js'
import { bodyOf } from './helpers.js'

export const accountRouter = Router()

accountRouter.use(requireAuth, requireActive, throttle('writes'))

/* ----------------------------------------------------------------------------------------------
 | Profile
 * -------------------------------------------------------------------------------------------- */

accountRouter.patch('/profile', async (req, res) => {
  const user = currentUser(req)

  const data = await validate(
    z.object({
      name: text(255).optional(),
      email: lowercaseEmail(255)
        .refine(async (value) => !(await prisma.user.findFirst({ where: { email: value, id: { not: user.id } }, select: { id: true } })), 'The email has already been taken.')
        .optional(),
      phone: opt(
        phone(32).refine(async (value) => !(await prisma.user.findFirst({ where: { phone: value, id: { not: user.id } }, select: { id: true } })), 'The phone has already been taken.'),
      ),
      avatar: opt(url(2048)),
    }),
    bodyOf(req),
  )

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { ...data, ...(data.email !== undefined && data.email !== user.email ? { email_verified_at: null } : {}) },
  })

  res.json({ data: userResource(updated) })
})

accountRouter.put('/password', throttle('auth'), async (req, res) => {
  const user = currentUser(req)

  const data = await validate(
    z.object({
      current_password: user.password ? z.string().max(128) : opt(z.string().max(128)),
      password: z.string().max(128).min(8, 'The :attribute field must be at least 8 characters.'),
    }),
    bodyOf(req),
    confirmed('password'),
  )

  if (user.password && !(await checkPassword(data.current_password ?? '', user.password))) fail('current_password', 'The current password is incorrect.')

  await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(data.password) } })

  // Sign out every other browser; this one stays signed in.
  await revokeUserSessions(user.id, req.session?.id ?? null)

  res.json({ message: 'Password updated.' })
})

accountRouter.post('/avatar', throttle('uploads'), async (req, res) => {
  const file = req.uploads?.avatar?.[0]
  if (!file) throw new ValidationError({ avatar: ['The avatar field is required.'] })

  const { info, errors } = await checkImage(file, 'avatar', {
    formats: ['jpeg', 'png', 'webp'],
    mimesLabel: 'jpg, jpeg, png, webp',
    maxKilobytes: 2048,
    dimensions: { minWidth: 64, minHeight: 64, maxWidth: 4000, maxHeight: 4000 },
  })
  if (Object.keys(errors).length > 0) throw new ValidationError(errors)

  const path = `avatars/${random(40)}.${extensionFor(info!)}`
  await storage.put('public', path, file.buffer)

  const user = await prisma.user.update({ where: { id: currentUser(req).id }, data: { avatar: storage.url('public', path) } })
  res.json({ data: userResource(user) })
})

/* ----------------------------------------------------------------------------------------------
 | Addresses
 * -------------------------------------------------------------------------------------------- */

function addressSchema(creating: boolean) {
  const required = <T extends z.ZodType>(schema: T) => (creating ? schema : schema.optional())

  return z.object({
    label: opt(text(50)),
    name: required(text(255)),
    email: opt(email(255)),
    phone: required(phone(32)),
    region: opt(text(255)),
    city: opt(text(255)),
    zone: opt(text(255)),
    landmark: opt(text(255)),
    full_address: required(text(1000)),
    is_default: bool().optional(),
  })
}

async function findAddress(req: Request) {
  const address = await prisma.address.findFirst({ where: { id: routeId(req.params.address), user_id: currentUser(req).id } })
  if (!address) notFound()
  return address!
}

accountRouter.get('/addresses', async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { user_id: currentUser(req).id },
    orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
  })
  res.json({ data: addresses.map(addressResource) })
})

accountRouter.post('/addresses', async (req, res) => {
  const user = currentUser(req)
  const data = await validate(addressSchema(true), bodyOf(req))

  const address = await prisma.$transaction(async (tx) => {
    const isDefault = data.is_default === true || (await tx.address.count({ where: { user_id: user.id } })) === 0
    if (isDefault) await tx.address.updateMany({ where: { user_id: user.id }, data: { is_default: false } })

    return tx.address.create({ data: { ...data, user_id: user.id, is_default: isDefault } as never })
  })

  res.status(201).json({ data: addressResource(address) })
})

accountRouter.get('/addresses/:address', async (req, res) => {
  res.json({ data: addressResource(await findAddress(req)) })
})

const updateAddress = async (req: Request, res: import('express').Response) => {
  const address = await findAddress(req)
  const data = await validate(addressSchema(false), bodyOf(req))

  const updated = await prisma.$transaction(async (tx) => {
    if (data.is_default === true) {
      await tx.address.updateMany({ where: { user_id: address.user_id, id: { not: address.id } }, data: { is_default: false } })
    }
    return tx.address.update({ where: { id: address.id }, data })
  })

  res.json({ data: addressResource(updated) })
}
accountRouter.put('/addresses/:address', updateAddress)
accountRouter.patch('/addresses/:address', updateAddress)

accountRouter.delete('/addresses/:address', async (req, res) => {
  const address = await findAddress(req)
  await prisma.address.delete({ where: { id: address.id } })

  if (address.is_default) {
    const next = await prisma.address.findFirst({ where: { user_id: address.user_id }, orderBy: { created_at: 'desc' } })
    if (next) await prisma.address.update({ where: { id: next.id }, data: { is_default: true } })
  }

  res.status(204).end()
})

/* ----------------------------------------------------------------------------------------------
 | Orders
 * -------------------------------------------------------------------------------------------- */

async function findOrder(req: Request) {
  const order = await prisma.order.findFirst({ where: { order_number: String(req.params.orderNumber), user_id: currentUser(req).id } })
  if (!order) notFound()
  return order!
}

async function loadOrder(id: bigint) {
  return withLatestPayment(await prisma.order.findUniqueOrThrow({ where: { id }, include: orderInclude }))
}

accountRouter.get('/orders', async (req, res) => {
  const query = await validate(z.object({ status: opt(oneOf(ORDER_STATUSES)), per_page: opt(int(1, 50)) }), req.query)
  const where = { user_id: currentUser(req).id, ...(query.status ? { status: query.status } : {}) }

  res.json(
    await paginate(
      req,
      query.per_page ?? 10,
      {
        count: () => prisma.order.count({ where }),
        rows: async ({ skip, take }) =>
          (await prisma.order.findMany({ where, include: orderInclude, orderBy: { created_at: 'desc' }, skip, take })).map(withLatestPayment),
      },
      (order) => orderResource(req, order),
    ),
  )
})

accountRouter.get('/orders/:orderNumber', async (req, res) => {
  const order = await findOrder(req)
  res.json({ data: orderResource(req, await loadOrder(order.id)) })
})

accountRouter.post('/orders/:orderNumber/cancel', async (req, res) => {
  const order = await orders.cancel(await findOrder(req))
  res.json({ data: orderResource(req, await loadOrder(order.id)) })
})

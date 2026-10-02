import type { Request, RequestHandler } from 'express'
import type { User } from '../generated/prisma/client.js'
import { HttpError } from '../lib/http.js'
import { revokeUserSessions } from './session.js'

export type Role = 'customer' | 'manager' | 'admin'

export const isStaff = (user: Pick<User, 'role'>) => user.role === 'admin' || user.role === 'manager'

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) throw new HttpError(401, 'Unauthenticated.')
  next()
}

/** Deactivated accounts are signed out everywhere as soon as they make a request. */
export const requireActive: RequestHandler = async (req, _res, next) => {
  const user = req.user
  if (user && !user.is_active) {
    await revokeUserSessions(user.id)
    await req.session?.logout(req)
    throw new HttpError(403, 'Your account has been deactivated.')
  }
  next()
}

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    const user = req.user
    if (!user || !user.is_active || !roles.includes(user.role as Role)) {
      throw new HttpError(403, 'You are not authorized to perform this action.')
    }
    next()
  }

/** The signed-in user; only call behind `requireAuth`. */
export function currentUser(req: Request): User {
  if (!req.user) throw new HttpError(401, 'Unauthenticated.')
  return req.user
}

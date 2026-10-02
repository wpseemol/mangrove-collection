import { timingSafeEqual } from 'node:crypto'
import type { Request, RequestHandler, Response } from 'express'
import onHeaders from 'on-headers'
import { env } from '../config/env.js'
import type { User } from '../generated/prisma/client.js'
import { signed, unsign } from '../lib/crypt.js'
import { HttpError } from '../lib/http.js'
import { prisma } from '../lib/prisma.js'
import { random } from '../lib/str.js'

export const REMEMBER_COOKIE = 'mangrove_remember'
const TOUCH_AFTER_SECONDS = 60

type SessionData = { csrf: string; userId: string | null }

declare global {
  namespace Express {
    interface Request {
      session: SessionState | null
      user: User | null
    }
  }
}

const now = () => Math.floor(Date.now() / 1000)

export class SessionState {
  remember: { action: 'set'; value: string } | { action: 'clear' } | null = null

  constructor(
    public id: string,
    public data: SessionData,
    public lastActivity: number,
    public isNew: boolean,
  ) {}

  static fresh(): SessionState {
    return new SessionState(random(40), { csrf: random(40), userId: null }, now(), true)
  }

  get csrfToken(): string {
    return this.data.csrf
  }

  async save(req: Request): Promise<void> {
    const row = {
      user_id: this.data.userId ? BigInt(this.data.userId) : null,
      ip_address: req.ip?.slice(0, 45) ?? null,
      user_agent: req.get('user-agent')?.slice(0, 1000) ?? null,
      payload: Buffer.from(JSON.stringify(this.data)).toString('base64'),
      last_activity: now(),
    }

    await prisma.session.upsert({ where: { id: this.id }, create: { id: this.id, ...row }, update: row })
    this.lastActivity = row.last_activity
    this.isNew = false
  }

  /** New session id + CSRF token: prevents session fixation. */
  async regenerate(req: Request, keepUser = true): Promise<void> {
    await prisma.session.deleteMany({ where: { id: this.id } })
    this.id = random(40)
    this.data = { csrf: random(40), userId: keepUser ? this.data.userId : null }
    await this.save(req)
  }

  async login(req: Request, user: User, remember = false): Promise<void> {
    this.data.userId = String(user.id)
    await this.regenerate(req)
    req.user = user

    if (remember) {
      let token = user.remember_token
      if (!token) {
        token = random(60)
        await prisma.user.update({ where: { id: user.id }, data: { remember_token: token } })
        user.remember_token = token
      }
      this.remember = { action: 'set', value: `${user.id}|${token}` }
    }
  }

  async logout(req: Request): Promise<void> {
    const user = req.user
    if (user?.remember_token) {
      await prisma.user.updateMany({ where: { id: user.id }, data: { remember_token: random(60) } })
    }

    req.user = null
    this.remember = { action: 'clear' }
    await this.regenerate(req, false)
  }
}

/** Requests from the storefront or dashboard origins (STATEFUL_DOMAINS) get a session and CSRF protection. */
export function isStateful(req: Request): boolean {
  const source = req.get('origin') || req.get('referer')
  if (!source) return false

  try {
    return env().statefulDomains.includes(new URL(source).host.toLowerCase())
  } catch {
    return false
  }
}

async function load(id: string): Promise<SessionState | null> {
  const row = await prisma.session.findUnique({ where: { id } })
  if (!row) return null

  if (row.last_activity + env().SESSION_LIFETIME * 60 < now()) {
    await prisma.session.deleteMany({ where: { id } })
    return null
  }

  try {
    const data = JSON.parse(Buffer.from(row.payload, 'base64').toString('utf8')) as Partial<SessionData>
    if (typeof data.csrf !== 'string' || data.csrf.length < 40) return null
    return new SessionState(row.id, { csrf: data.csrf, userId: typeof data.userId === 'string' ? data.userId : null }, row.last_activity, false)
  } catch {
    return null
  }
}

async function userFromRememberCookie(req: Request): Promise<User | null> {
  const value = unsign(req.cookies?.[REMEMBER_COOKIE])
  const match = value?.match(/^(\d{1,19})\|([A-Za-z0-9]{60})$/)
  if (!match) return null

  const user = await prisma.user.findUnique({ where: { id: BigInt(match[1]) } })
  if (!user?.remember_token) return null

  const given = Buffer.from(match[2])
  const expected = Buffer.from(user.remember_token)
  return given.length === expected.length && timingSafeEqual(given, expected) ? user : null
}

function writeCookies(req: Request, res: Response): void {
  const state = req.session
  if (!state) return

  const config = env()
  const base = {
    path: '/',
    domain: config.SESSION_DOMAIN,
    secure: config.SESSION_SECURE_COOKIE,
    sameSite: config.SESSION_SAME_SITE,
  } as const
  const maxAge = config.SESSION_LIFETIME * 60 * 1000

  res.cookie(config.SESSION_COOKIE, signed(state.id), { ...base, httpOnly: true, maxAge })
  // Readable by the SPA, which echoes it back in the X-XSRF-TOKEN header.
  res.cookie('XSRF-TOKEN', state.csrfToken, { ...base, httpOnly: false, maxAge })

  if (state.remember?.action === 'set') {
    res.cookie(REMEMBER_COOKIE, signed(state.remember.value), { ...base, httpOnly: true, maxAge: config.AUTH_REMEMBER_MINUTES * 60 * 1000 })
  } else if (state.remember?.action === 'clear' && req.cookies?.[REMEMBER_COOKIE]) {
    res.clearCookie(REMEMBER_COOKIE, { ...base, httpOnly: true })
  }
}

function tokensMatch(given: unknown, expected: string): boolean {
  if (typeof given !== 'string') return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export const sessionMiddleware: RequestHandler = async (req, res, next) => {
  req.session = null
  req.user = null

  if (!isStateful(req)) return next()

  const id = unsign(req.cookies?.[env().SESSION_COOKIE])
  const state = (id ? await load(id) : null) ?? SessionState.fresh()
  req.session = state

  let dirty = state.isNew || now() - state.lastActivity >= TOUCH_AFTER_SECONDS

  if (state.data.userId) {
    req.user = await prisma.user.findUnique({ where: { id: BigInt(state.data.userId) } })
    if (!req.user) {
      state.data.userId = null
      dirty = true
    }
  } else if (req.cookies?.[REMEMBER_COOKIE]) {
    const user = await userFromRememberCookie(req)
    if (user) {
      req.user = user
      state.data.userId = String(user.id)
      dirty = true
    } else {
      state.remember = { action: 'clear' }
    }
  }

  onHeaders(res, () => writeCookies(req, res))

  if (dirty) await state.save(req)

  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const token = req.get('x-xsrf-token') ?? req.get('x-csrf-token') ?? req.body?._token
    if (!tokensMatch(token, state.csrfToken)) throw new HttpError(419, 'CSRF token mismatch.')
  }

  next()
}

/** Signs a user out of every browser and rotates the remember-me token. Pass the current session id to keep it. */
export async function revokeUserSessions(userId: bigint, exceptSessionId?: string | null): Promise<void> {
  await prisma.session.deleteMany({
    where: { user_id: userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
  })
  await prisma.user.updateMany({ where: { id: userId }, data: { remember_token: random(60) } })
}

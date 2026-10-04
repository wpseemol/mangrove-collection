import { Router, type Request, type Response } from 'express'
import { isStaff, requireActive, requireAuth, currentUser } from '../auth/guards.js'
import { revokeUserSessions } from '../auth/session.js'
import type { User } from '../generated/prisma/client.js'
import { HttpError, fail } from '../lib/http.js'
import { report } from '../lib/log.js'
import { prisma } from '../lib/prisma.js'
import { throttle } from '../middleware/rate-limit.js'
import { userResource } from '../resources/index.js'
import { google, type GoogleUser } from '../services/google.js'
import { checkPassword, hashPassword, passwordResets } from '../services/password-resets.js'
import { settings } from '../services/settings.js'
import { EMAIL_PATTERN } from '../validation/rules.js'
import { bool, confirmed, email, lowercaseEmail, opt, phone, text, validate, z } from '../validation/index.js'

export const authRouter = Router()

/** Sessions only exist for requests from the storefront/dashboard origins, so sign-in from anywhere else is refused. */
function ensureBrowserSession(req: Request): void {
  if (!req.session) throw new HttpError(403, 'Sign-in is only available from the Mangrove Collection website or dashboard.')
}

async function startSession(req: Request, res: Response, user: User, remember = false, status = 200): Promise<void> {
  ensureBrowserSession(req)
  await req.session!.login(req, user, remember)
  const saved = await prisma.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } })
  req.user = saved
  res.status(status).json({ user: userResource(saved) })
}

async function endSession(req: Request): Promise<void> {
  await req.session?.logout(req)
  req.user = null
}

/** Turns off email/password sign-in for customers only; staff always keep it so the dashboard stays reachable. */
const passwordLoginEnabled = async () => Boolean(await settings.get('password_login_enabled'))
const PASSWORD_LOGIN_OFF = 'Email and password sign-in is turned off. Please use another sign-in option.'

const passwordRule = z.string().min(8, 'The :attribute field must be at least 8 characters.').max(128)

const loginSchema = z.object({
  login: text(255),
  password: z.string().max(128),
  remember: bool().optional(),
})

/** `login` accepts either an email address or a phone number. */
async function authenticate(login: string, password: string): Promise<User> {
  const value = login.trim()
  const user = EMAIL_PATTERN.test(value) && value.includes('@')
    ? await prisma.user.findFirst({ where: { email: value.toLowerCase() } })
    : await prisma.user.findFirst({ where: { phone: value } })

  if (!user || user.password === null || !(await checkPassword(password, user.password))) fail('login', 'These credentials do not match our records.')
  if (!user!.is_active) fail('login', 'Your account has been deactivated.')
  return user!
}

const authLimited = Router()
authLimited.use(['/register', '/login', '/dashboard/login', '/forgot-password', '/reset-password', '/google'], throttle('auth'))

authLimited.post('/register', async (req, res) => {
  if (!(await passwordLoginEnabled())) throw new HttpError(403, PASSWORD_LOGIN_OFF)

  const data = await validate(
    z.object({
      name: text(255),
      email: lowercaseEmail(255).refine(async (value) => !(await prisma.user.findUnique({ where: { email: value }, select: { id: true } })), 'The email has already been taken.'),
      phone: opt(phone(32).refine(async (value) => !(await prisma.user.findUnique({ where: { phone: value }, select: { id: true } })), 'The phone has already been taken.')),
      password: passwordRule,
      remember: bool().optional(),
    }),
    req.body,
    confirmed('password'),
  )

  ensureBrowserSession(req)

  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, phone: data.phone ?? null, password: await hashPassword(data.password), role: 'customer' },
  })

  await startSession(req, res, user, data.remember ?? false, 201)
})

authLimited.post('/login', async (req, res) => {
  const data = await validate(loginSchema, req.body)
  ensureBrowserSession(req)

  const user = await authenticate(data.login, data.password)
  if (!isStaff(user) && !(await passwordLoginEnabled())) fail('login', PASSWORD_LOGIN_OFF)

  await startSession(req, res, user, data.remember ?? false)
})

/** Same as login, but only staff may sign in, and never with a remember-me cookie. */
authLimited.post('/dashboard/login', async (req, res) => {
  const data = await validate(loginSchema, req.body)
  ensureBrowserSession(req)

  const user = await authenticate(data.login, data.password)
  if (!isStaff(user)) fail('login', 'You do not have access to the dashboard.')

  await startSession(req, res, user)
})

authLimited.post('/forgot-password', async (req, res) => {
  const data = await validate(z.object({ email: email(255) }), req.body)

  try {
    await passwordResets.sendResetLink(data.email, { staffOnly: !(await passwordLoginEnabled()) })
  } catch (error) {
    report(error)
  }

  // Identical response either way to avoid account enumeration.
  res.json({ message: 'If an account exists for that email, a password reset link has been sent.' })
})

authLimited.post('/reset-password', async (req, res) => {
  const data = await validate(
    z.object({
      token: z.string().max(255).regex(/^[A-Za-z0-9]+$/),
      email: email(255),
      password: passwordRule,
    }),
    req.body,
    confirmed('password'),
  )

  const result = await passwordResets.verify(data.email, data.token)
  if (typeof result === 'string') fail('email', result)

  const user = result as User
  if (!isStaff(user) && !(await passwordLoginEnabled())) fail('email', PASSWORD_LOGIN_OFF)

  await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(data.password) } })
  await revokeUserSessions(user.id)
  await passwordResets.deleteToken(user.email)

  res.json({ message: 'Your password has been reset.' })
})

/** Returns the Google consent-screen URL for the authorization-code flow. */
authLimited.get('/google/redirect', async (_req, res) => {
  if (!(await google.configured(true))) throw new HttpError(503, 'Google login is not configured.')
  res.json({ url: await google.redirectUrl() })
})

const googleToken = (max: number) => opt(z.string().max(max).regex(/^[A-Za-z0-9._\-~+/=]+$/))

/** Accepts either an `access_token` (Google Identity Services token client) or an authorization `code` (redirect flow). */
authLimited.post('/google', async (req, res) => {
  const data = await validate(
    z.object({ access_token: googleToken(4096), code: googleToken(2048), remember: bool().optional() }),
    req.body,
    (input) => {
      if (input.access_token || input.code) return undefined
      return {
        access_token: ['The access token field is required when code is not present.'],
        code: ['The code field is required when access token is not present.'],
      }
    },
  )

  if (!(await google.configured(Boolean(data.code)))) throw new HttpError(503, 'Google login is not configured.')
  ensureBrowserSession(req)

  let googleUser: GoogleUser
  try {
    googleUser = data.access_token ? await google.userFromToken(data.access_token) : await google.userFromCode(data.code!)
  } catch (error) {
    report(error)
    fail('google', 'Unable to authenticate with Google.')
  }

  const user = await resolveGoogleUser(googleUser!)
  if (!user.is_active) fail('google', 'Your account has been deactivated.')

  await startSession(req, res, user, data.remember ?? false)
})

async function resolveGoogleUser(googleUser: GoogleUser): Promise<User> {
  const emailAddress = (googleUser.email ?? '').toLowerCase()
  if (emailAddress === '' || !googleUser.emailVerified) fail('google', 'Your Google account email is not verified.')

  const user = (await prisma.user.findUnique({ where: { google_id: googleUser.id } })) ?? (await prisma.user.findUnique({ where: { email: emailAddress } }))

  if (!user) {
    return prisma.user.create({
      data: {
        name: googleUser.name || emailAddress,
        email: emailAddress,
        avatar: googleUser.avatar,
        google_id: googleUser.id,
        email_verified_at: new Date(),
      },
    })
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      google_id: user.google_id ?? googleUser.id,
      avatar: user.avatar ?? googleUser.avatar,
      email_verified_at: user.email_verified_at ?? new Date(),
    },
  })
}

authRouter.use(authLimited)

/** Public: lets the frontends find out whether the session cookie belongs to a signed-in user, without a 401 for guests. */
authRouter.get('/session', async (req, res) => {
  let user = req.user
  if (user && !user.is_active) {
    await endSession(req)
    user = null
  }
  res.json({ authenticated: user !== null, user: user ? userResource(user) : null })
})

authRouter.get('/me', requireAuth, requireActive, (req, res) => {
  res.json({ data: userResource(currentUser(req)) })
})

authRouter.post('/logout', requireAuth, requireActive, async (req, res) => {
  await endSession(req)
  res.json({ message: 'Logged out.' })
})

authRouter.post('/logout-all', requireAuth, requireActive, async (req, res) => {
  await revokeUserSessions(currentUser(req).id)
  await endSession(req)
  res.json({ message: 'Logged out from all devices.' })
})

import { createHmac } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { isStaff } from '../auth/guards.js'
import { env } from '../config/env.js'
import type { User } from '../generated/prisma/client.js'
import { prisma } from '../lib/prisma.js'
import { random } from '../lib/str.js'
import { sendMail } from './mail.js'
import { settings } from './settings.js'

const EXPIRE_MINUTES = 60
const THROTTLE_SECONDS = 60

/** Stored with PHP's `$2y$` prefix (same algorithm as `$2b$`) so hashes stay interchangeable with password_verify(). */
export const hashPassword = async (password: string) => (await bcrypt.hash(password, env().BCRYPT_ROUNDS)).replace(/^\$2b\$/, '$2y$')
export const checkPassword = (password: string, hash: string | null) => (hash ? bcrypt.compare(password, hash.replace(/^\$2y\$/, '$2b$')) : Promise.resolve(false))

/** Laravel's password broker, using the same `password_reset_tokens` table. */
export const passwordResets = {
  async createToken(user: User): Promise<string> {
    const token = createHmac('sha256', env().appKey).update(random(40)).digest('hex')
    const data = { token: await hashPassword(token), created_at: new Date() }
    await prisma.passwordResetToken.upsert({ where: { email: user.email }, create: { email: user.email, ...data }, update: data })
    return token
  },

  /** Staff reset on the dashboard; customers on the storefront (static export with trailing-slash URLs). */
  async resetUrl(user: User, token: string): Promise<string> {
    const page = isStaff(user)
      ? `${String((await settings.get('dashboard_url')) ?? '').replace(/\/+$/, '')}/reset-password`
      : `${String((await settings.get('storefront_url')) ?? '').replace(/\/+$/, '')}/reset-password/`
    return `${page}?${new URLSearchParams({ token, email: user.email }).toString()}`
  },

  async sendResetLink(email: string, { staffOnly = false } = {}): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || (staffOnly && !isStaff(user))) return

    const existing = await prisma.passwordResetToken.findUnique({ where: { email: user.email } })
    if (existing?.created_at && Date.now() - existing.created_at.getTime() < THROTTLE_SECONDS * 1000) return

    const token = await this.createToken(user)
    await sendMail(user.email, {
      subject: 'Reset Password Notification',
      introLines: ['You are receiving this email because we received a password reset request for your account.'],
      action: { text: 'Reset Password', url: await this.resetUrl(user, token) },
      outroLines: [`This password reset link will expire in ${EXPIRE_MINUTES} minutes.`, 'If you did not request a password reset, no further action is required.'],
    })
  },

  /** Returns the user when the token is valid, otherwise the Laravel error message for the `email` field. */
  async verify(email: string, token: string): Promise<User | string> {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return "We can't find a user with that email address."

    const record = await prisma.passwordResetToken.findUnique({ where: { email: user.email } })
    const expired = !record?.created_at || Date.now() - record.created_at.getTime() > EXPIRE_MINUTES * 60 * 1000
    if (!record || expired || !(await checkPassword(token, record.token))) return 'This password reset token is invalid.'

    return user
  },

  async deleteToken(email: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({ where: { email } })
  },
}

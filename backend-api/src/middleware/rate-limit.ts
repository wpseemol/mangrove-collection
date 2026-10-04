import { createHash } from 'node:crypto'
import type { Request, RequestHandler } from 'express'

type Limit = { key: string; max: number; windowSeconds: number }
type Bucket = { hits: number; resetAt: number }

const buckets = new Map<string, Bucket>()

setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key)
}, 60_000).unref()

export function resetRateLimits(): void {
  buckets.clear()
}

const perMinute = (max: number, key: string): Limit => ({ key, max, windowSeconds: 60 })
const perHour = (max: number, key: string): Limit => ({ key, max, windowSeconds: 3600 })

const userOrIp = (req: Request) => (req.user ? `user:${req.user.id}` : `ip:${req.ip}`)
const input = (req: Request, key: string) => {
  const value = req.body?.[key]
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}
const isSafeMethod = (req: Request) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method)

const limiters: Record<string, (req: Request) => Limit[]> = {
  api: (req) => [perMinute(120, userOrIp(req))],
  auth: (req) => {
    const identifier = input(req, 'login') || input(req, 'email')
    return [perMinute(10, `auth-ip:${req.ip}`), ...(identifier ? [perMinute(5, `auth-login:${identifier}`)] : [])]
  },
  checkout: (req) => [perMinute(10, userOrIp(req))],
  quote: (req) => [perMinute(60, userOrIp(req))],
  newsletter: (req) => [perMinute(5, `ip:${req.ip}`), perHour(30, `newsletter-ip-hour:${req.ip}`)],
  tracking: (req) => [perMinute(20, `ip:${req.ip}`)],
  // Phone/email buyer checks: slows down anyone trying numbers one after another.
  'review-verify': (req) => {
    const contact = input(req, 'contact')
    return [
      perMinute(10, `review-ip:${req.ip}`),
      perHour(60, `review-ip-hour:${req.ip}`),
      ...(contact ? [perMinute(5, `review-contact:${createHash('sha1').update(contact).digest('hex')}`)] : []),
    ]
  },
  uploads: (req) => [perMinute(20, userOrIp(req))],
  // Revealing a stored secret needs the admin's password, so guessing it is kept slow.
  'reveal-secret': (req) => [perMinute(5, userOrIp(req)), perHour(30, `reveal-hour:${userOrIp(req)}`)],
  // Reads stay on the global `api` limit; creates, updates and deletes get a tighter one.
  writes: (req) => (isSafeMethod(req) ? [] : [perMinute(60, userOrIp(req))]),
}

export type LimiterName = keyof typeof limiters

/** Named fixed-window limiter, mirroring Laravel's `throttle:<name>` middleware. */
export function throttle(name: LimiterName): RequestHandler {
  return (req, res, next) => {
    const now = Date.now()
    const limits = limiters[name](req)

    const entries = limits.map((limit) => {
      const key = `${name}|${limit.key}`
      let bucket = buckets.get(key)
      if (!bucket || bucket.resetAt <= now) {
        bucket = { hits: 0, resetAt: now + limit.windowSeconds * 1000 }
        buckets.set(key, bucket)
      }
      return { limit, bucket }
    })

    for (const { limit, bucket } of entries) {
      if (bucket.hits >= limit.max) {
        const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
        res.set({
          'Retry-After': String(retryAfter),
          'X-RateLimit-Reset': String(Math.ceil(bucket.resetAt / 1000)),
          'X-RateLimit-Limit': String(limit.max),
          'X-RateLimit-Remaining': '0',
        })
        res.status(429).json({ message: 'Too Many Attempts.' })
        return
      }
    }

    for (const { limit, bucket } of entries) {
      bucket.hits++
      res.set({ 'X-RateLimit-Limit': String(limit.max), 'X-RateLimit-Remaining': String(Math.max(0, limit.max - bucket.hits)) })
    }

    next()
  }
}

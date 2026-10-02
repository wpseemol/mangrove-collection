import cors from 'cors'
import type { RequestHandler } from 'express'
import { env } from '../config/env.js'

const NO_STORE = [/^\/v1\/auth\//, /^\/v1\/account\//, /^\/v1\/admin\//, /^\/v1\/checkout$/, /^\/sanctum\//]

/** The API only returns JSON, so responses opt out of framing, sniffing and referrers entirely. */
export const securityHeaders: RequestHandler = (req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  })

  // Personal data must never land in a shared or browser cache.
  if (NO_STORE.some((pattern) => pattern.test(req.path))) res.set('Cache-Control', 'no-store, private')
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  next()
}

/** Strict allow-list: only the storefront and the dashboard may call the API from a browser, with credentials. */
export function corsMiddleware(): RequestHandler {
  return cors({
    origin: (origin, callback) => {
      const allowed = env().CORS_ALLOWED_ORIGINS.map((item) => item.replace(/\/+$/, ''))
      callback(null, origin !== undefined && allowed.includes(origin) ? origin : false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Content-Type', 'X-Requested-With', 'X-XSRF-TOKEN', 'X-Review-Token', 'Origin'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'Retry-After'],
    maxAge: 7200,
    optionsSuccessStatus: 204,
  })
}

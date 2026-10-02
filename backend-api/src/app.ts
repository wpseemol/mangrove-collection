import cookieParser from 'cookie-parser'
import express, { type Express } from 'express'
import { sessionMiddleware } from './auth/session.js'
import { env } from './config/env.js'
import { paths } from './lib/paths.js'
import { errorHandler, notFoundHandler } from './middleware/errors.js'
import { methodOverride, multipart, normalizeRequest } from './middleware/input.js'
import { throttle } from './middleware/rate-limit.js'
import { corsMiddleware, securityHeaders } from './middleware/security.js'
import { apiRouter } from './routes/index.js'

;(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function (this: bigint) {
  return Number(this)
}

export function createApp(): Express {
  const app = express()

  app.disable('x-powered-by')
  const trustProxy = process.env.TRUST_PROXY || 'loopback'
  app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy)
  app.set('query parser', 'extended')
  app.set('json replacer', (_key: string, value: unknown) => (typeof value === 'bigint' ? Number(value) : value))

  app.use(corsMiddleware())
  app.use(securityHeaders)

  app.get('/', (_req, res) => {
    res.json({ name: env().APP_NAME, version: 'v1', health: `${env().APP_URL}/up` })
  })

  app.get('/up', (_req, res) => {
    res.json({ status: 'ok' })
  })

  const staticOptions = { index: false, dotfiles: 'deny', maxAge: '7d', fallthrough: false } as const
  app.use('/uploads', express.static(paths.uploads, staticOptions))
  app.use('/storage', express.static(paths.publicStorage, staticOptions))

  app.use(cookieParser())
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true, limit: '2mb' }))
  app.use(multipart)
  app.use(normalizeRequest)
  app.use(methodOverride)
  app.use(sessionMiddleware)

  app.get('/sanctum/csrf-cookie', (_req, res) => {
    res.status(204).end()
  })

  app.use('/v1', throttle('api'), apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

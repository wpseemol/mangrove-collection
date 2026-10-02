import type { RequestHandler } from 'express'
import multer from 'multer'

const UNTRIMMED = new Set(['password', 'password_confirmation', 'current_password'])

/** Laravel's TrimStrings + ConvertEmptyStringsToNull, applied recursively. */
export function normalizeInput(value: unknown, key?: string): unknown {
  if (typeof value === 'string') {
    const trimmed = key && UNTRIMMED.has(key) ? value : value.trim()
    return trimmed === '' ? null : trimmed
  }
  if (Array.isArray(value)) return value.map((item) => normalizeInput(item))
  if (value !== null && typeof value === 'object' && Object.getPrototypeOf(value) !== Buffer.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, item]) => [k, normalizeInput(item, k)]))
  }
  return value
}

export const normalizeRequest: RequestHandler = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') req.body = normalizeInput(req.body)

  const query = normalizeInput({ ...req.query }) as Record<string, unknown>
  for (const key of Object.keys(query)) if (query[key] === null) delete query[key]
  Object.defineProperty(req, 'query', { value: query, writable: true, configurable: true, enumerable: true })

  next()
}

/**
 * Multipart bodies are buffered in memory and grouped by field name, so `images[]`,
 * `images[0]` and `images` all become `req.files.images`. Size and type rules live in the route validators.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 21, fields: 200, fieldSize: 1024 * 1024 },
}).any()

export type UploadedFile = Express.Multer.File

declare global {
  namespace Express {
    interface Request {
      uploads?: Record<string, UploadedFile[]>
    }
  }
}

export const multipart: RequestHandler = (req, res, next) => {
  if (!req.is('multipart/form-data')) return next()

  upload(req, res, (error?: unknown) => {
    if (error) return next(error)

    const grouped: Record<string, UploadedFile[]> = {}
    for (const file of (req.files as UploadedFile[] | undefined) ?? []) {
      const name = file.fieldname.replace(/\[\d*\]$/, '')
      ;(grouped[name] ??= []).push(file)
    }
    req.uploads = grouped
    next()
  })
}

/** `_method=PUT|PATCH|DELETE` on a POST form, like Laravel's method spoofing (used for multipart updates). */
export const methodOverride: RequestHandler = (req, _res, next) => {
  if (req.method === 'POST' && req.body && typeof req.body === 'object') {
    const override = typeof req.body._method === 'string' ? req.body._method.toUpperCase() : null
    if (override && ['PUT', 'PATCH', 'DELETE'].includes(override)) {
      req.method = override
      delete req.body._method
    }
  }
  next()
}

import type { Request, RequestHandler } from 'express'
import multer from 'multer'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { isStaff } from '../auth/guards.js'
import { ValidationError } from '../lib/http.js'

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

export const VIDEO_UPLOAD_PATH = '/v1/admin/media/videos'
export const MAX_VIDEO_MEGABYTES = 100

/** Videos are too big to buffer, so this one route streams a single file to the temp folder (`file.path`). */
const videoUpload = multer({
  storage: multer.diskStorage({ destination: tmpdir() }),
  limits: { fileSize: MAX_VIDEO_MEGABYTES * 1024 * 1024, files: 1, fields: 20, fieldSize: 64 * 1024 },
}).any()

/** Anonymous uploads (review photos) get one file of slack over MAX_REVIEW_IMAGES so the route can report "too many photos" itself. */
const publicUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5, fields: 30, fieldSize: 64 * 1024 },
}).any()

/**
 * Who may make the server buffer a file. Admin and account routes reject the request anyway, so
 * their bodies are never read for visitors who aren't allowed in; the route guards then answer 401/403.
 * Runs after the session middleware so `req.user` is known.
 */
function uploaderFor(req: Request): RequestHandler | null {
  const user = req.user
  if (req.path.startsWith('/v1/admin/')) return user?.is_active && isStaff(user) ? upload : null
  if (req.path.startsWith('/v1/account/')) return user?.is_active ? upload : null
  return publicUpload
}

export const multipart: RequestHandler = (req, res, next) => {
  if (!req.is('multipart/form-data')) return next()

  const video = req.method === 'POST' && req.path === VIDEO_UPLOAD_PATH
  const uploader = uploaderFor(req)
  if (!uploader) return next()
  if (video) {
    // The temp file must go even when auth, CSRF or validation rejects the request before the route runs.
    res.on('close', () => {
      for (const file of (req.files as UploadedFile[] | undefined) ?? []) if (file.path) void rm(file.path, { force: true }).catch(() => undefined)
    })
  }

  ;(video ? videoUpload : uploader)(req, res, (error?: unknown) => {
    if (video && error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? `The video must not be larger than ${MAX_VIDEO_MEGABYTES} MB.`
          : error.code === 'LIMIT_FILE_COUNT'
            ? 'Upload one video at a time.'
            : 'The upload could not be processed.'
      return next(new ValidationError({ file: [message] }))
    }
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

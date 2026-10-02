import sharp from 'sharp'
import { fail, type FieldErrors } from '../lib/http.js'
import { storage } from '../lib/storage.js'
import { randomLower, slug } from '../lib/str.js'
import type { UploadedFile } from '../middleware/input.js'
import { attributeName } from '../validation/index.js'

sharp.cache(false)

export type ImageInfo = { format: string; width: number; height: number }

const MIME: Record<string, string> = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }
const EXTENSION: Record<string, string> = { jpeg: 'jpg', png: 'png', webp: 'webp', gif: 'gif' }

/** Reads the real image type from the file contents (never the client's file name or MIME type). */
export async function inspectImage(file: UploadedFile): Promise<ImageInfo | null> {
  try {
    const meta = await sharp(file.buffer, { failOn: 'error' }).metadata()
    if (!meta.format || !meta.width || !meta.height || !(meta.format in MIME)) return null
    // Phone photos may be stored sideways; validate the upright size.
    const rotated = (meta.orientation ?? 1) >= 5
    return { format: meta.format, width: rotated ? meta.height : meta.width, height: rotated ? meta.width : meta.height }
  } catch {
    return null
  }
}

export const mimeFor = (info: ImageInfo) => MIME[info.format]
export const extensionFor = (info: ImageInfo) => EXTENSION[info.format]

type ImageRules = {
  /** Allowed formats, e.g. ['jpeg', 'png', 'webp']. */
  formats: string[]
  /** Laravel `mimes:` list used in the message. */
  mimesLabel: string
  maxKilobytes: number
  dimensions?: { minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number; ratio?: number }
  dimensionsMessage?: string
  maxMessage?: string
  /** Display name used in messages (defaults to the key). */
  attribute?: string
}

/** Laravel's `image|mimes:...|max:...|dimensions:...` for one uploaded file. Returns the errors for `key`. */
export async function checkImage(file: UploadedFile, key: string, rules: ImageRules): Promise<{ info: ImageInfo | null; errors: FieldErrors }> {
  const attribute = rules.attribute ?? attributeName(key.split('.'))
  const messages: string[] = []
  const info = await inspectImage(file)

  if (!info || !rules.formats.includes(info.format)) {
    if (!info) messages.push(`The ${attribute} field must be an image.`)
    messages.push(`The ${attribute} field must be a file of type: ${rules.mimesLabel}.`)
  }

  if (file.size > rules.maxKilobytes * 1024) messages.push(rules.maxMessage ?? `The ${attribute} field must not be greater than ${rules.maxKilobytes} kilobytes.`)

  if (info && rules.dimensions) {
    const d = rules.dimensions
    const ratioOk = d.ratio === undefined || Math.abs(d.ratio - info.width / info.height) <= 1 / (Math.max(info.width, info.height) + 1)
    const bad =
      (d.minWidth !== undefined && info.width < d.minWidth) ||
      (d.minHeight !== undefined && info.height < d.minHeight) ||
      (d.maxWidth !== undefined && info.width > d.maxWidth) ||
      (d.maxHeight !== undefined && info.height > d.maxHeight) ||
      !ratioOk
    if (bad) messages.push(rules.dimensionsMessage ?? `The ${attribute} field has invalid image dimensions.`)
  }

  return { info, errors: messages.length ? { [key]: messages } : {} }
}

/** Category images: re-encoded to exactly 800×600 WEBP, which drops anything hidden inside the original file. */
export const categoryImages = {
  DISK: 'uploads' as const,
  DIRECTORY: 'category',

  async store(file: UploadedFile, categoryName: string): Promise<string> {
    let binary: Buffer
    try {
      binary = await sharp(file.buffer).rotate().resize(800, 600, { fit: 'fill' }).webp({ quality: 85 }).toBuffer()
    } catch {
      fail('image', 'The image could not be read. Please upload a JPG, PNG or WEBP file.')
    }

    const path = `${this.DIRECTORY}/${slug(categoryName) || 'category'}-${randomLower(8)}.webp`
    await storage.put(this.DISK, path, binary!)
    return path
  },

  /** Removes a stored category image; external URLs and other folders are left alone. */
  async delete(path: string | null | undefined): Promise<void> {
    if (path && !isExternal(path) && path.startsWith(`${this.DIRECTORY}/`) && !path.includes('..')) {
      await storage.delete(this.DISK, path)
    }
  },

  url(path: string | null | undefined): string | null {
    if (!path) return null
    return isExternal(path) ? path : storage.url(this.DISK, path)
  },
}

/**
 * Customer review photos: `reviews/{yyyymm}/{random}.webp`. Turned upright (EXIF), shrunk to
 * fit 1600px and re-encoded, which drops metadata (GPS) and anything hidden in the file.
 */
export const reviewImages = {
  DISK: 'uploads' as const,
  MAX_SIDE: 1600,

  async store(file: UploadedFile, field = 'images'): Promise<string> {
    let binary: Buffer
    try {
      binary = await sharp(file.buffer)
        .rotate()
        .resize(this.MAX_SIDE, this.MAX_SIDE, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer()
    } catch {
      fail(field, 'A photo could not be read. Please upload JPG, PNG or WEBP images.')
    }

    const now = new Date()
    const month = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}`
    const path = `reviews/${month}/${randomLower(24)}.webp`
    await storage.put(this.DISK, path, binary!)
    return path
  },

  async deleteMany(paths: unknown): Promise<void> {
    for (const path of Array.isArray(paths) ? paths : []) {
      if (this.isOwnPath(path)) await storage.delete(this.DISK, path)
    }
  },

  url(path: string): string {
    return storage.url(this.DISK, path)
  },

  isOwnPath(path: unknown): path is string {
    return typeof path === 'string' && /^reviews\/\d{6}\/[a-z0-9]{24}\.webp$/.test(path)
  },
}

function isExternal(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://')
}

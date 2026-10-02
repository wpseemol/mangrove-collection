import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { env } from '../config/env.js'

/**
 * Laravel compatible AES-256-CBC encryption, so values encrypted by the old API
 * (settings secrets) keep decrypting with the same APP_KEY.
 */
export function encryptString(value: string): string {
  const key = env().appKey
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]).toString('base64')
  const ivB64 = iv.toString('base64')
  const mac = createHmac('sha256', key).update(ivB64 + encrypted).digest('hex')

  return Buffer.from(JSON.stringify({ iv: ivB64, value: encrypted, mac, tag: '' })).toString('base64')
}

export function decryptString(payload: string): string {
  const key = env().appKey
  let data: { iv?: unknown; value?: unknown; mac?: unknown }

  try {
    data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
  } catch {
    throw new Error('The payload is invalid.')
  }

  if (typeof data?.iv !== 'string' || typeof data.value !== 'string' || typeof data.mac !== 'string') {
    throw new Error('The payload is invalid.')
  }

  const iv = Buffer.from(data.iv, 'base64')
  if (iv.length !== 16) throw new Error('The payload is invalid.')

  const expected = createHmac('sha256', key).update(data.iv + data.value).digest()
  const given = Buffer.from(data.mac, 'hex')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw new Error('The MAC is invalid.')

  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([decipher.update(Buffer.from(data.value, 'base64')), decipher.final()]).toString('utf8')
}

/** HMAC signature used for cookies. */
export function sign(value: string): string {
  return createHmac('sha256', env().appKey).update(value).digest('base64url')
}

export function signed(value: string): string {
  return `${value}.${sign(value)}`
}

export function unsign(cookie: string | undefined): string | null {
  if (!cookie) return null
  const index = cookie.lastIndexOf('.')
  if (index <= 0) return null

  const value = cookie.slice(0, index)
  const expected = Buffer.from(sign(value))
  const given = Buffer.from(cookie.slice(index + 1))

  return given.length === expected.length && timingSafeEqual(given, expected) ? value : null
}

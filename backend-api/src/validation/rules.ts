/**
 * Input security rules. Queries are always parameter-bound (Prisma), so these are
 * defence in depth that keep hostile payloads out of the database, logs, emails and SMS.
 *
 * Keep SAFE_TEXT_PATTERNS in sync with `unsafeTextPattern` in the dashboard and storefront `lib/validation.ts`.
 */
export const SAFE_TEXT_PATTERNS: RegExp[] = [
  /<\s*\/?\s*[a-z!?%]/i,
  /[?%]>/,
  /\b(?:javascript|vbscript)\s*:|\bdata\s*:\s*[a-z]+\/[\w.+-]+[;,]/i,
  /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/,
  /\bunion\s+(?:all\s+)?select\b/i,
  /;\s*(?:drop|truncate|alter|delete|insert|update|create|grant|shutdown)\s/i,
  /['"`]\s*(?:or|and)\s+['"`]?\w+['"`]?\s*(?:=|like)\s*['"`]?\w+/i,
  /['"`]\s*(?:--|#|\/\*)/,
  /\/\*.*?\*\//s,
  /\b(?:sleep|benchmark|pg_sleep)\(/i,
  /\bwaitfor\s+delay\b/i,
  /\b(?:information_schema|load_file)\b|\binto\s+(?:out|dump)file\b/i,
]

export const SAFE_TEXT_MESSAGE = 'The :attribute must not contain HTML, PHP, script or SQL code.'

/** Plain text: rejects tags, PHP/ASP tags, script URLs, control characters and SQL payloads. Arrays are checked leaf by leaf, keys included. */
export function isUnsafeText(value: unknown): boolean {
  if (Array.isArray(value)) return value.some((item) => isUnsafeText(item))
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).some(([key, item]) => isUnsafeText(key) || isUnsafeText(item))
  }
  if (typeof value !== 'string' || value === '') return false

  return SAFE_TEXT_PATTERNS.some((pattern) => pattern.test(value))
}

const HTML_TAGS = new Set(['p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a'])
const LINK_ATTRIBUTES = new Set(['href', 'title', 'target', 'rel'])

export const SAFE_HTML_MESSAGE = 'The :attribute may only use basic formatting (p, strong, em, ul, ol, li, h2–h4, blockquote and http links).'

/** Rich text: only basic formatting tags; scripts, styles, event handlers and non-http(s) links are rejected. */
export function isSafeHtml(html: string): boolean {
  if (/<[?%!]|[?%]>|[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(html)) return false
  if (/\b(?:javascript|vbscript)\s*:|\bdata\s*:\s*[a-z]+\/[\w.+-]+[;,]/i.test(html)) return false

  const tags = [...html.matchAll(/<\s*(\/?)\s*([a-z][a-z0-9]*)\b([^<>]*)>/gi)]
  const openings = html.match(/<\s*\/?\s*[a-z]/gi)?.length ?? 0

  // Every "<letter" must belong to a complete, well-formed tag.
  if (openings !== tags.length) return false

  for (const [, closing, rawName, rawAttributes] of tags) {
    const name = rawName.toLowerCase()
    if (!HTML_TAGS.has(name)) return false

    const attributes = rawAttributes.replace(/\/+$/, '').trim()
    if (closing !== '' || attributes === '') continue
    if (name !== 'a' || !linkAttributesAreSafe(attributes)) return false
  }

  return true
}

function linkAttributesAreSafe(attributes: string): boolean {
  const pairs = [...attributes.matchAll(/([a-z-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/gi)]
  const consumed = pairs.map((pair) => pair[0]).join(' ')

  if (consumed.replace(/\s+/g, '') !== attributes.replace(/\s+/g, '')) return false

  for (const [, rawKey, rawValue] of pairs) {
    const key = rawKey.toLowerCase()
    const value = rawValue.replace(/^["']+|["']+$/g, '')

    if (!LINK_ATTRIBUTES.has(key)) return false
    if (key === 'href' && !/^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(value)) return false
  }

  return true
}

/** An absolute http(s) URL, or (when allowed) a site path such as `/shop`. */
export function isSafeUrl(url: string, allowRelative = false): boolean {
  if (/[\s<>"'`\\\x00-\x1F\x7F]/.test(url)) return false
  if (allowRelative && /^\/(?![/\\])/.test(url)) return true

  return isHttpUrl(url)
}

export function isHttpUrl(url: string): boolean {
  if (!/^https?:\/\/[^/?#]+/i.test(url)) return false
  try {
    const parsed = new URL(url)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname !== ''
  } catch {
    return false
  }
}

export const PHONE_PATTERN = /^\+?[0-9][0-9\s\-()]{5,19}$/
export const PHONE_MESSAGE = 'The :attribute must be a valid phone number.'

export const TRANSACTION_ID_PATTERN = /^[A-Z0-9]{6,20}$/
export const TRANSACTION_ID_MESSAGE = 'The :attribute must be 6–20 letters or digits, exactly as shown in your payment SMS.'

export function normalizeTransactionId(value: unknown): unknown {
  return typeof value === 'string' ? value.replace(/[\s-]+/g, '').toUpperCase() : value
}

export const WHATSAPP_MESSAGE = 'Enter the WhatsApp number in international format with the country code, e.g. +8801712345678.'

export function isWhatsAppNumber(value: string): boolean {
  return /^\+?[1-9]\d{7,14}$/.test(value.replace(/[\s\-().]/g, ''))
}

export const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/

export function isEmail(value: string): boolean {
  return value.length <= 255 && EMAIL_PATTERN.test(value)
}

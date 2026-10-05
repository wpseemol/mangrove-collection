/**
 * Client-side mirror of the API's SafeText / SafeHtml rules (backend-api/app/Rules).
 * The server is the real gate; this just gives instant feedback before a request is sent.
 */
const UNSAFE_TEXT = [
  /<\s*\/?\s*[a-z!?%]/i,
  /[?%]>/,
  /\b(?:javascript|vbscript)\s*:|\bdata\s*:\s*[a-z]+\/[\w.+-]+[;,]/i,
  // eslint-disable-next-line no-control-regex
  /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/,
  /\bunion\s+(?:all\s+)?select\b/i,
  /;\s*(?:drop|truncate|alter|delete|insert|update|create|grant|shutdown)\s/i,
  /['"`]\s*(?:or|and)\s+['"`]?\w+['"`]?\s*(?:=|like)\s*['"`]?\w+/i,
  /['"`]\s*(?:--|#|\/\*)/,
  /\/\*[\s\S]*?\*\//,
  /\b(?:sleep|benchmark|pg_sleep)\(/i,
  /\bwaitfor\s+delay\b/i,
  /\b(?:information_schema|load_file)\b|\binto\s+(?:out|dump)file\b/i,
]

const UNSAFE_HTML = [
  /<\s*\/?\s*(?:script|style|iframe|frame|object|embed|link|meta|base|form|input|button|textarea|select|svg|math|img|video|audio|source)\b/i,
  /\son[a-z]+\s*=/i,
  /\sstyle\s*=/i,
  /<[?%!]|[?%]>/,
  /\b(?:javascript|vbscript)\s*:|\bdata\s*:\s*[a-z]+\/[\w.+-]+[;,]/i,
]

/** Blog posts may also hold images, video placeholders and text alignment; anything executable is still refused. */
const UNSAFE_BLOG_HTML = [
  /<\s*\/?\s*(?:script|style|iframe|frame|object|embed|link|meta|base|form|input|button|textarea|select|svg|math|video|audio|source|template)\b/i,
  /\son[a-z]+\s*=/i,
  /\sstyle\s*=\s*["'](?!\s*text-align:\s*(?:left|center|right|justify);?\s*["'])/i,
  /<[?%!]|[?%]>/,
  /\b(?:javascript|vbscript)\s*:|\bdata\s*:\s*[a-z]+\/[\w.+-]+[;,]/i,
]

export const UNSAFE_BLOG_HTML_MESSAGE = 'The post contains code, scripts or embeds that are not allowed. Remove pasted code and try again.'
export const isUnsafeBlogHtml = (value: string) => UNSAFE_BLOG_HTML.some((pattern) => pattern.test(value))

export const UNSAFE_TEXT_MESSAGE = 'This field must not contain HTML, PHP, script or SQL code.'
export const UNSAFE_HTML_MESSAGE = 'Only basic formatting is allowed (p, strong, em, ul, ol, li, h2–h4, blockquote and http links).'

export const isUnsafeText = (value: string) => UNSAFE_TEXT.some((pattern) => pattern.test(value))
export const isUnsafeHtml = (value: string) => UNSAFE_HTML.some((pattern) => pattern.test(value))

export const LINK_MESSAGE = 'Enter a full http(s) link or a site path starting with /, e.g. /shop.'

/** Mirrors the API's `isSafeUrl(url, true)`: an absolute http(s) URL or a site path such as `/shop`. */
export function isSafeLink(url: string): boolean {
  // eslint-disable-next-line no-control-regex
  if (/[\s<>"'`\\\x00-\x1F\x7F]/.test(url)) return false
  if (/^\/(?![/\\])/.test(url)) return true
  try {
    const parsed = new URL(url)
    return /^https?:\/\/[^/?#]+/i.test(url) && (parsed.protocol === 'http:' || parsed.protocol === 'https:')
  } catch {
    return false
  }
}

/** Fields that may legitimately contain anything (passwords are hashed, scripts are admin-only). */
const RAW_FIELD = /password|^custom_(?:head|body)_script$|^settings\.(?:custom_(?:head|body)_script|\w+_(?:password|secret|key))$/

/** Fields that accept the basic-formatting HTML subset instead of plain text. */
const HTML_FIELDS = new Set(['description', 'content'])

/**
 * Walks a request body (plain object or FormData) and returns Laravel-style errors,
 * keyed by dotted path, for any string that would be rejected by the API.
 */
export function findUnsafeFields(body: unknown, htmlFields: ReadonlySet<string> = HTML_FIELDS, blogFields: ReadonlySet<string> = new Set()): Record<string, string[]> {
  const errors: Record<string, string[]> = {}

  const visit = (value: unknown, path: string) => {
    if (typeof value === 'string') {
      if (!path || RAW_FIELD.test(path)) return
      if (blogFields.has(path)) {
        if (isUnsafeBlogHtml(value)) errors[path] = [UNSAFE_BLOG_HTML_MESSAGE]
      } else if (htmlFields.has(path)) {
        if (isUnsafeHtml(value)) errors[path] = [UNSAFE_HTML_MESSAGE]
      } else if (isUnsafeText(value)) {
        errors[path] = [UNSAFE_TEXT_MESSAGE]
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, path ? `${path}.${index}` : String(index)))
    } else if (value && typeof value === 'object' && !(value instanceof Blob)) {
      for (const [key, item] of Object.entries(value)) visit(item, path ? `${path}.${key}` : key)
    }
  }

  if (body instanceof FormData) {
    body.forEach((value, key) => visit(value, key))
  } else {
    visit(body, '')
  }

  return errors
}

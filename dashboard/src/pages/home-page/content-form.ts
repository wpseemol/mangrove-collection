import { HOME_BLOCKS, type HomeContent } from '@/lib/home-content'
import { isSafeLink, isUnsafeText, LINK_MESSAGE, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'

/** Field errors keyed by dotted path, e.g. `hero.title` or `trust.items.0.text`. */
export type Errors = Record<string, string>

const LONG_FIELD = /(?:^|\.)(?:description|body|text)$/
const LINK_FIELD = /(?:^|\.)(?:image|\w+_url)$/
const INLINE_LINK = /\[[^\]\n]*\]\(([^)\s]*)\)/g

export const INFO_CARD_LIMIT = 24

export const limitFor = (path: string) => (LINK_FIELD.test(path) ? 2048 : LONG_FIELD.test(path) ? 1000 : 255)

const splitPath = (path: string) => path.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : part))

export function getIn(source: unknown, path: string): unknown {
  return splitPath(path).reduce<unknown>((value, key) => (value as Record<string | number, unknown> | undefined)?.[key], source)
}

export function setIn<T>(source: T, path: string, value: unknown): T {
  const write = (target: unknown, keys: (string | number)[]): unknown => {
    if (!keys.length) return value
    const [head, ...rest] = keys
    const copy = (Array.isArray(target) ? [...target] : { ...(target as object) }) as Record<string | number, unknown>
    copy[head] = write(copy[head], rest)
    return copy
  }
  return write(source, splitPath(path)) as T
}

export function validateContent(content: HomeContent): Errors {
  const errors: Errors = {}

  const visit = (value: unknown, path: string) => {
    if (typeof value === 'string') {
      const text = value.trim()
      if (!text) return
      if (text.length > limitFor(path)) errors[path] = `Keep this to ${limitFor(path)} characters or fewer.`
      else if (LINK_FIELD.test(path)) {
        if (!isSafeLink(text)) errors[path] = LINK_MESSAGE
      } else if (isUnsafeText(text)) errors[path] = UNSAFE_TEXT_MESSAGE
      else if ([...text.matchAll(INLINE_LINK)].some(([, target]) => !isSafeLink(target))) {
        errors[path] = `Every [text](link) needs a full http(s) link or a site path starting with /, e.g. [Shop honey](/shop?category=honey).`
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}.${index}`))
    } else if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) visit(item, path ? `${path}.${key}` : key)
    }
  }
  visit(content, '')

  const seconds = content.hero.autoplay_seconds
  if (!Number.isInteger(seconds) || seconds < 0 || seconds > 30) errors['hero.autoplay_seconds'] = 'Enter a whole number of seconds from 0 to 30.'

  const visible = content.info.visible_count
  if (!Number.isInteger(visible) || visible < 0 || visible > INFO_CARD_LIMIT) errors['info.visible_count'] = `Enter a whole number from 0 to ${INFO_CARD_LIMIT}.`

  return errors
}

/** `sections.0.title` (the API's key, by block position) -> `hero.title`. */
export function fromServerErrors(errors: Record<string, string[]>): Errors {
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => {
      const match = /^sections\.(\d+)(?:\.(.*))?$/.exec(key)
      const block = match ? HOME_BLOCKS[Number(match[1])] : undefined
      return [block ? [block, match![2]].filter(Boolean).join('.') : key, messages[0]]
    }),
  )
}

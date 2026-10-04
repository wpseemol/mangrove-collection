import { CATEGORY_LIMIT, HOME_BLOCKS, PRODUCT_LIMIT, PRODUCT_ROWS_LIMIT, type HomeContent } from '@/lib/home-content'
import { isSafeLink, isUnsafeText, LINK_MESSAGE, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'

/** Field errors keyed by dotted path, e.g. `hero.title` or `trust.items.0.text`. */
export type Errors = Record<string, string>

const LONG_FIELD = /(?:^|\.)(?:description|body|text)$/
const LINK_FIELD = /(?:^|\.)(?:image|\w+_url)$/
const INLINE_LINK = /\[[^\]\n]*\]\(([^)\s]*)\)/g

export const INFO_CARD_LIMIT = 24

export const limitFor = (path: string) =>
  LINK_FIELD.test(path) ? 2048 : path.endsWith('meta_description') ? 500 : LONG_FIELD.test(path) ? 1000 : 255

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

/** Length, safe-text and link checks for every string field, at any depth. */
export function validateStrings(content: object): Errors {
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
  return errors
}

export function validateContent(content: HomeContent): Errors {
  const errors = validateStrings(content)

  const seconds = content.hero.autoplay_seconds
  if (!Number.isInteger(seconds) || seconds < 0 || seconds > 30) errors['hero.autoplay_seconds'] = 'Enter a whole number of seconds from 0 to 30.'

  const visible = content.info.visible_count
  if (!Number.isInteger(visible) || visible < 0 || visible > INFO_CARD_LIMIT) errors['info.visible_count'] = `Enter a whole number from 0 to ${INFO_CARD_LIMIT}.`

  const between = (path: string, value: number, min: number, max: number) => {
    if (!Number.isInteger(value) || value < min || value > max) errors[path] = `Enter a whole number from ${min} to ${max}.`
  }
  between('categories.limit', content.categories.limit, 1, CATEGORY_LIMIT)
  for (const block of ['popular', 'latest'] as const) {
    between(`${block}.limit`, content[block].limit, 1, PRODUCT_LIMIT)
    between(`${block}.rows`, content[block].rows, 1, PRODUCT_ROWS_LIMIT)
    between(`${block}.autoplay_seconds`, content[block].autoplay_seconds, 0, 30)
  }

  return errors
}

/** `sections.0.title` (the API's key, by block position) -> `hero.title`. Other keys go through `rename`. */
export function fromServerErrors(
  errors: Record<string, string[]>,
  blocks: readonly string[] = HOME_BLOCKS,
  rename: (key: string) => string = (key) => key,
): Errors {
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => {
      const match = /^sections\.(\d+)(?:\.(.*))?$/.exec(key)
      const block = match ? blocks[Number(match[1])] : undefined
      return [block ? [block, match![2]].filter(Boolean).join('.') : rename(key), messages[0]]
    }),
  )
}

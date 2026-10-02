import { z } from 'zod'
import { ValidationError, type FieldErrors } from '../lib/http.js'
import {
  EMAIL_PATTERN,
  PHONE_MESSAGE,
  PHONE_PATTERN,
  SAFE_HTML_MESSAGE,
  SAFE_TEXT_MESSAGE,
  TRANSACTION_ID_MESSAGE,
  TRANSACTION_ID_PATTERN,
  isSafeHtml,
  isSafeUrl,
  isUnsafeText,
  normalizeTransactionId,
} from './rules.js'

/** Laravel style messages; ":attribute" is replaced with the field path when errors are formatted. */
z.config({
  customError: (issue) => {
    const input = (issue as { input?: unknown }).input

    switch (issue.code) {
      case 'invalid_type':
        if (input === undefined || input === null) return 'The :attribute field is required.'
        switch (issue.expected) {
          case 'string':
            return 'The :attribute field must be a string.'
          case 'number':
            return 'The :attribute field must be a number.'
          case 'int':
            return 'The :attribute field must be an integer.'
          case 'boolean':
            return 'The :attribute field must be true or false.'
          case 'array':
          case 'object':
            return 'The :attribute field must be an array.'
          default:
            return 'The :attribute field is invalid.'
        }
      case 'too_big': {
        const max = Number(issue.maximum)
        if (issue.origin === 'string') return `The :attribute field must not be greater than ${max} characters.`
        if (issue.origin === 'array') return `The :attribute field must not have more than ${max} items.`
        return `The :attribute field must not be greater than ${max}.`
      }
      case 'too_small': {
        const min = Number(issue.minimum)
        if (issue.origin === 'string') return min <= 1 ? 'The :attribute field is required.' : `The :attribute field must be at least ${min} characters.`
        if (issue.origin === 'array') return min <= 1 ? 'The :attribute field is required.' : `The :attribute field must have at least ${min} items.`
        return `The :attribute field must be at least ${min}.`
      }
      case 'invalid_format':
        if (issue.format === 'email') return 'The :attribute field must be a valid email address.'
        if (issue.format === 'lowercase') return 'The :attribute field must be lowercase.'
        return 'The :attribute field format is invalid.'
      case 'invalid_value':
        return 'The selected :attribute is invalid.'
      default:
        return 'The :attribute field is invalid.'
    }
  },
})

/** Custom attribute names, e.g. `{ shipping_method_id: 'delivery method', 'items.*.quantity': 'quantity' }`. */
export type Attributes = Record<string, string>

/** A key expanded from a Laravel wildcard rule (`items.0.quantity`) has a numeric segment. */
const isIndexed = (key: string) => /(^|\.)\d+(\.|$)/.test(key)

export function attributeName(path: PropertyKey[], attributes: Attributes = {}): string {
  const key = path.map(String).join('.')
  if (attributes[key]) return attributes[key]

  for (const [pattern, name] of Object.entries(attributes)) {
    if (!pattern.includes('*')) continue
    const regex = new RegExp(`^${pattern.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^.]+')}$`)
    if (regex.test(key)) return name
  }

  // Laravel shows wildcard-expanded keys verbatim and only humanises plain ones.
  return isIndexed(key) ? key : key.replace(/_/g, ' ')
}

export function toFieldErrors(error: z.ZodError, attributes: Attributes = {}): FieldErrors {
  const errors: FieldErrors = {}

  for (const issue of error.issues) {
    const key = issue.path.map(String).join('.')
    const message = issue.message.replace(/:attribute/g, attributeName(issue.path, attributes))
    ;(errors[key] ??= []).includes(message) || errors[key].push(message)
  }

  return errors
}

/** Field paths in declaration order, with `*` for array items: `items`, `items.*.variant_id`, `items.*.quantity`, ... */
function rulePatterns(schema: z.ZodType, prefix = ''): string[] {
  const def = (schema as unknown as { _zod?: { def?: Record<string, unknown> } })._zod?.def
  if (!def) return []

  switch (def.type) {
    case 'optional':
    case 'nullable':
    case 'default':
    case 'readonly':
      return rulePatterns(def.innerType as z.ZodType, prefix)
    case 'pipe':
      return [...new Set([...rulePatterns(def.in as z.ZodType, prefix), ...rulePatterns(def.out as z.ZodType, prefix)])]
    case 'array':
      return rulePatterns(def.element as z.ZodType, prefix ? `${prefix}.*` : '*')
    case 'object':
      return Object.entries(def.shape as Record<string, z.ZodType>).flatMap(([key, child]) => {
        const path = prefix ? `${prefix}.${key}` : key
        return [path, ...rulePatterns(child, path)]
      })
    default:
      return []
  }
}

export type RawCheck = ((input: Record<string, unknown>) => FieldErrors | undefined | Promise<FieldErrors | undefined>) & {
  /**
   * A field rule (e.g. `confirmed`, `distinct`): its messages go before the schema's own messages for the
   * field and are sorted with them. Without it the check is an after-hook and its errors are appended last.
   */
  prepend?: boolean
}

/**
 * Validates input and throws a 422 with Laravel's `{message, errors}` body on failure.
 * Extras are raw checks (run on the unparsed input) or `{ attributes }` name overrides.
 * Error keys follow Laravel's order: plain rules, then wildcard-expanded ones, then after-hooks.
 */
export async function validate<T extends z.ZodType>(schema: T, data: unknown, ...extras: (RawCheck | { attributes: Attributes })[]): Promise<z.output<T>> {
  const input = (data ?? {}) as Record<string, unknown>
  const attributes = Object.assign({}, ...extras.filter((extra) => typeof extra === 'object').map((extra) => (extra as { attributes: Attributes }).attributes))
  const checks = extras.filter((extra): extra is RawCheck => typeof extra === 'function')
  const result = await schema.safeParseAsync(input)
  const parsed = result.success ? {} : toFieldErrors(result.error, attributes)

  for (const check of checks.filter((check) => check.prepend)) {
    for (const [key, messages] of Object.entries((await check(input)) ?? {})) parsed[key] = [...messages, ...(parsed[key] ?? [])]
  }

  // Async refinements finish out of order, so sort like Laravel: by rule (schema field) order, then by array index.
  const patterns = rulePatterns(schema)
  const rank = (key: string) => {
    const pattern = key.replace(/(^|\.)\d+(?=\.|$)/g, '$1*')
    let index = patterns.indexOf(pattern)
    for (let parts = key.split('.'); index === -1 && parts.length > 1; ) {
      parts = parts.slice(0, -1)
      index = patterns.indexOf(parts.join('.').replace(/(^|\.)\d+(?=\.|$)/g, '$1*'))
    }
    return index === -1 ? patterns.length : index
  }
  const indices = (key: string) => key.split('.').filter((part) => /^\d+$/.test(part)).map(Number)
  const keys = Object.keys(parsed).sort((a, b) => {
    const byRule = rank(a) - rank(b)
    if (byRule !== 0) return byRule
    const [ia, ib] = [indices(a), indices(b)]
    for (let i = 0; i < Math.min(ia.length, ib.length); i++) if (ia[i] !== ib[i]) return ia[i] - ib[i]
    return 0
  })

  const errors: FieldErrors = {}
  for (const key of keys.filter((key) => !isIndexed(key))) errors[key] = parsed[key]
  for (const key of keys.filter(isIndexed)) errors[key] = parsed[key]

  for (const check of checks.filter((check) => !check.prepend)) {
    for (const [key, messages] of Object.entries((await check(input)) ?? {})) errors[key] = [...(errors[key] ?? []), ...messages]
  }

  if (Object.keys(errors).length > 0) throw new ValidationError(errors)
  return (result as { data: z.output<T> }).data
}

/** Laravel `confirmed`: `${field}_confirmation` must match `field`. */
export const confirmed = (field: string): RawCheck =>
  Object.assign(
    (input: Record<string, unknown>) =>
      typeof input[field] === 'string' && input[field] !== input[`${field}_confirmation`]
        ? { [field]: [`The ${attributeName([field])} field confirmation does not match.`] }
        : undefined,
    { prepend: true },
  )

const isBlank = (value: unknown) => value === undefined || value === null

/** Nullable + optional, like Laravel's `nullable` (and `sometimes` when the key is missing). */
export const opt = <T extends z.ZodType>(schema: T) => schema.nullable().optional()

export const str = (max = 255) => z.string().max(max)

/** Plain text with the SafeText check. */
export const text = (max = 255) => z.string().max(max).refine((value) => !isUnsafeText(value), SAFE_TEXT_MESSAGE)

export const html = (max: number) => z.string().max(max).refine((value) => isSafeHtml(value), SAFE_HTML_MESSAGE)

export const safeText = <T extends z.ZodType>(schema: T) => schema.refine((value) => !isUnsafeText(value), SAFE_TEXT_MESSAGE)

export const email = (max = 255) =>
  z
    .string()
    .max(max)
    .refine((value) => EMAIL_PATTERN.test(value), 'The :attribute field must be a valid email address.')

/** Laravel `lowercase|email|max` (in that order). */
export const lowercaseEmail = (max = 255) =>
  z
    .string()
    .refine((value) => value === value.toLowerCase(), 'The :attribute field must be lowercase.')
    .refine((value) => EMAIL_PATTERN.test(value), 'The :attribute field must be a valid email address.')
    .max(max)

export const phone = (max = 32) =>
  z
    .string()
    .max(max)
    .refine((value) => PHONE_PATTERN.test(value), PHONE_MESSAGE)

export const url = (max = 2048, allowRelative = false) =>
  z
    .string()
    .max(max)
    .refine(
      (value) => isSafeUrl(value, allowRelative),
      allowRelative ? 'The :attribute must be a valid http(s) link or a path starting with /.' : 'The :attribute must be a valid http(s) link.',
    )

export const transactionId = () =>
  z.preprocess(normalizeTransactionId, z.string().refine((value) => TRANSACTION_ID_PATTERN.test(value), TRANSACTION_ID_MESSAGE))

export const alphaDash = (max = 255) =>
  z
    .string()
    .max(max)
    .regex(/^[\p{L}\p{M}\p{N}_-]+$/u, 'The :attribute field must only contain letters, numbers, dashes, and underscores.')

export const oneOf = <const T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values, { error: (issue) => (isBlank(issue.input) ? 'The :attribute field is required.' : 'The selected :attribute is invalid.') })

/** Schema-level error maps also apply to min/max checks, so only the type error is customised here. */
const typeError = (message: string) => (issue: { code?: string; input?: unknown }) =>
  issue.code === 'invalid_type' ? (isBlank(issue.input) ? 'The :attribute field is required.' : message) : undefined

/** Integer that accepts numeric strings (query strings and multipart forms). */
export const int = (min?: number, max?: number) => {
  let schema = z.number({ error: typeError('The :attribute field must be an integer.') }).int('The :attribute field must be an integer.')
  if (min !== undefined) schema = schema.min(min)
  if (max !== undefined) schema = schema.max(max)

  return z.preprocess((value) => (typeof value === 'string' && /^-?\d+$/.test(value.trim()) ? Number(value) : value), schema)
}

/** Laravel `integer|between:min,max`. */
export const intBetween = (min: number, max: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' && /^-?\d+$/.test(value.trim()) ? Number(value) : value),
    z
      .number({ error: typeError('The :attribute field must be an integer.') })
      .int('The :attribute field must be an integer.')
      .refine((value) => value >= min && value <= max, `The :attribute field must be between ${min} and ${max}.`),
  )

/** Number that accepts numeric strings, optionally limited to `decimals` decimal places. */
export const num = (min?: number, max?: number, decimals?: number) => {
  let schema = z.number({ error: typeError('The :attribute field must be a number.') })
  if (min !== undefined) schema = schema.min(min)
  if (max !== undefined) schema = schema.max(max)

  const withDecimals =
    decimals === undefined
      ? schema
      : schema.refine((value) => {
          const [, fraction = ''] = String(value).split('.')
          return !String(value).includes('e') && fraction.length <= decimals
        }, `The :attribute field must have 0-${decimals} decimal places.`)

  return z.preprocess((value) => (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : value), withDecimals)
}

/** Laravel `boolean`: true, false, 1, 0, "1", "0" (plus "true"/"false" from forms). */
export const bool = () =>
  z.preprocess(
    (value) => {
      if (value === 1 || value === '1' || value === 'true' || value === 'on') return true
      if (value === 0 || value === '0' || value === 'false' || value === 'off') return false
      return value
    },
    z.boolean({ error: typeError('The :attribute field must be true or false.') }),
  )

export const id = () => int(1)

export { z }

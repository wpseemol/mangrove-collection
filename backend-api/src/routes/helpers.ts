import type { Request } from 'express'
import type { FieldErrors } from '../lib/http.js'
import type { RawCheck } from '../validation/index.js'

/** Laravel `distinct` for `${list}.*.${field}`: every entry that shares a value gets an error. */
export function distinct(list: string, field: string, attribute?: string): RawCheck {
  const check: RawCheck = (input) => {
    const rows = input[list]
    if (!Array.isArray(rows)) return undefined

    const values = rows.map((row) => (row && typeof row === 'object' ? (row as Record<string, unknown>)[field] : undefined))
    const errors: FieldErrors = {}

    values.forEach((value, index) => {
      if (value === undefined || value === null || value === '') return
      const duplicates = values.filter((other) => other !== undefined && other !== null && String(other) === String(value)).length
      if (duplicates > 1) errors[`${list}.${index}.${field}`] = [`The ${attribute ?? `${list}.${index}.${field}`} field has a duplicate value.`]
    })

    return errors
  }
  check.prepend = true
  return check
}

/** A JSON array body arrives as-is; a form body may send `items[0][variant_id]` objects keyed by index. */
export function listOf(value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every((key) => /^\d+$/.test(key))) {
    return Object.values(value)
  }
  return value
}

export const isFilled = (value: unknown) => value !== undefined && value !== null && value !== ''

export function bodyOf(req: Request): Record<string, unknown> {
  return req.body && typeof req.body === 'object' ? (req.body as Record<string, unknown>) : {}
}

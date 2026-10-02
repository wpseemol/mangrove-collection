import type { SettingMeta, SettingValue } from '@/lib/types'
import { isUnsafeText, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'

import { SOCIAL_NETWORKS, type FieldDef } from './sections'

export type DraftValue = string | boolean | string[] | Record<string, string>
export type Draft = Record<string, DraftValue>
export type Errors = Record<string, string>

const URL_PATTERN = /^https?:\/\/[^\s<>"'`\\]+$/i
const EMAIL_PATTERN = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/
const PHONE_PATTERN = /^\+?[0-9][0-9\s\-()]{5,19}$/
const WHATSAPP_PATTERN = /^\+?[1-9]\d{7,14}$/

const isUrl = (value: string) => {
  if (!URL_PATTERN.test(value)) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function toDraftValue(field: FieldDef, value: SettingValue | undefined): DraftValue {
  switch (field.kind) {
    case 'switch':
      return Boolean(value)
    case 'social': {
      const links = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
      return Object.fromEntries(SOCIAL_NETWORKS.map(({ key }) => [key, typeof links[key] === 'string' ? links[key] : '']))
    }
    default:
      return value === null || value === undefined ? '' : String(value)
  }
}

export function toDraft(fields: FieldDef[], settings: Record<string, SettingMeta>): Draft {
  return Object.fromEntries(fields.map((field) => [field.key, toDraftValue(field, settings[field.key]?.value)]))
}

/** The value the API expects for one field. */
export function toPayloadValue(field: FieldDef, value: DraftValue): SettingValue {
  switch (field.kind) {
    case 'switch':
      return Boolean(value)
    case 'social':
      return Object.fromEntries(
        Object.entries(value as Record<string, string>)
          .map(([key, url]) => [key, url.trim()])
          .filter(([, url]) => url),
      )
    case 'number': {
      const text = (value as string).trim()
      return text === '' ? null : Number(text)
    }
    case 'code':
    case 'secret':
      return (value as string) === '' ? null : (value as string)
    default: {
      const text = (value as string).trim()
      return text === '' ? null : text
    }
  }
}

/** Only fields that differ from what was loaded, so untouched secrets are never re-sent. */
export function changedPayload(fields: FieldDef[], draft: Draft, initial: Draft): Record<string, SettingValue> {
  const payload: Record<string, SettingValue> = {}
  for (const field of fields) {
    const next = toPayloadValue(field, draft[field.key])
    if (JSON.stringify(next) !== JSON.stringify(toPayloadValue(field, initial[field.key]))) payload[field.key] = next
  }
  return payload
}

function validateText(field: FieldDef, text: string): string | undefined {
  if (field.max && text.length > field.max) return `Use ${field.max} characters or fewer.`
  if (isUnsafeText(text)) return UNSAFE_TEXT_MESSAGE
}

export function validateField(field: FieldDef, value: DraftValue): Errors {
  const errors: Errors = {}
  const fail = (message: string, key = field.key) => {
    errors[key] = message
  }

  if (field.kind === 'switch') return errors

  if (field.kind === 'social') {
    for (const { key, label } of SOCIAL_NETWORKS) {
      const url = (value as Record<string, string>)[key]?.trim()
      if (url && !isUrl(url)) fail(`Enter the full ${label} link, starting with https://.`, `${field.key}.${key}`)
    }
    return errors
  }

  const text = (value as string).trim()

  if (!text) {
    if (field.required) fail(`${field.label} is required.`)
    return errors
  }

  switch (field.kind) {
    case 'url':
    case 'image':
      if (!isUrl(text)) fail('Enter a full link starting with https://.')
      break
    case 'email':
      if (!EMAIL_PATTERN.test(text) || text.length > 255) fail('Enter a valid email address.')
      break
    case 'phone':
      if (!PHONE_PATTERN.test(text)) fail('Enter a valid phone number, e.g. +880 1712-345678.')
      break
    case 'whatsapp':
      if (!WHATSAPP_PATTERN.test(text.replace(/[\s\-().]/g, ''))) {
        fail('Use international format with the country code, e.g. +8801712345678.')
      }
      break
    case 'number': {
      const number = Number(text)
      if (!Number.isFinite(number)) fail('Enter a number.')
      else if (field.integer && !Number.isInteger(number)) fail('Enter a whole number.')
      else if (field.min !== undefined && number < field.min) fail(`Must be ${field.min} or more.`)
      else if (field.max !== undefined && number > field.max) fail(`Must be ${field.max} or less.`)
      break
    }
    case 'select':
      if (!field.options?.some((option) => option.value === text)) fail('Choose one of the options.')
      break
    case 'code':
    case 'secret':
      break
    default: {
      const message = validateText(field, text)
      if (message) fail(message)
    }
  }

  return errors
}

export function validateDraft(fields: FieldDef[], draft: Draft): Errors {
  return fields.reduce<Errors>((errors, field) => ({ ...errors, ...validateField(field, draft[field.key]) }), {})
}

import { randomInt } from 'node:crypto'

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function random(length: number, alphabet = ALPHANUMERIC): string {
  let out = ''
  for (let i = 0; i < length; i++) out += alphabet[randomInt(alphabet.length)]
  return out
}

export const randomLower = (length: number) => random(length, 'abcdefghijklmnopqrstuvwxyz0123456789')
export const randomUpper = (length: number) => random(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')

/** Mirrors Laravel's Str::slug(): ASCII transliteration, lowercase, dashes. */
export function slug(value: string, separator = '-'): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/@/g, `${separator}at${separator}`)
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]+/g, '')
    .replace(/[\s_-]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '')
}

export function limit(value: string, length: number): string {
  return value.length > length ? value.slice(0, length) : value
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

/** Escapes LIKE wildcards so user search terms are matched literally. */
export function likeTerm(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`)
}

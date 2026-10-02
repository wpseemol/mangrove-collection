type DecimalLike = { toNumber(): number } | number | string | bigint

/** Laravel's JSON date format: 2026-10-02T10:04:37.000000Z */
export function iso(date: Date | null | undefined): string | null {
  if (!date) return null
  return date.toISOString().replace(/\.(\d{3})Z$/, '.$1000Z')
}

export function num(value: DecimalLike | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'bigint' || typeof value === 'string') return Number(value)
  return value.toNumber()
}

export function numOrNull(value: DecimalLike | null | undefined): number | null {
  return value === null || value === undefined ? null : num(value)
}

export function id(value: bigint | number): number
export function id(value: bigint | number | null | undefined): number | null
export function id(value: bigint | number | null | undefined): number | null {
  return value === null || value === undefined ? null : Number(value)
}

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

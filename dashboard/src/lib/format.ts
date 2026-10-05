const numberFormat = new Intl.NumberFormat('en-BD', { maximumFractionDigits: 2 })

export function formatPrice(amount: number | null | undefined, currency = 'BDT'): string {
  if (amount === null || amount === undefined) return '—'
  return currency === 'BDT' ? `৳${numberFormat.format(amount)}` : `${currency} ${numberFormat.format(amount)}`
}

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

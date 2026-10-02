export const MAX_VARIANTS = 50

export type VariantDraft = {
  key: string
  id?: number
  title: string
  sku: string
  price: string
  compare_price: string
  stock: string
  is_default: boolean
}

export const emptyVariant = (overrides: Partial<VariantDraft> = {}): VariantDraft => ({
  key: crypto.randomUUID(),
  title: '',
  sku: '',
  price: '',
  compare_price: '',
  stock: '',
  is_default: false,
  ...overrides,
})

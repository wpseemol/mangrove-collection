import { Plus, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { FormField, Optional } from '@/components/form-field'
import { emptyVariant, MAX_VARIANTS, type VariantDraft } from '@/components/products/variant-draft'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

const OPTION_PRESETS = ['Weight', 'Size', 'Volume', 'Pack', 'Color']

const FIELD_LABELS: Record<string, string> = {
  title: 'name',
  sku: 'SKU',
  price: 'price',
  compare_price: 'compare-at price',
  stock: 'stock',
}

const friendly = (message: string | undefined) =>
  message?.replace(/variants\.\d+\.(\w+)/g, (_, field: string) => FIELD_LABELS[field] ?? field)

type Props = {
  hasVariants: boolean
  onHasVariantsChange: (value: boolean) => void
  optionName: string
  onOptionNameChange: (value: string) => void
  variants: VariantDraft[]
  onChange: (variants: VariantDraft[]) => void
  error: ApiError | null
}

export function VariantsEditor({
  hasVariants,
  onHasVariantsChange,
  optionName,
  onOptionNameChange,
  variants,
  onChange,
  error,
}: Props) {
  const fieldError = (index: number, field: string) => friendly(error?.field(`variants.${index}.${field}`))

  const update = (key: string, changes: Partial<VariantDraft>) =>
    onChange(variants.map((variant) => (variant.key === key ? { ...variant, ...changes } : variant)))

  const setDefault = (key: string) =>
    onChange(variants.map((variant) => ({ ...variant, is_default: variant.key === key })))

  const remove = (key: string) => {
    const next = variants.filter((variant) => variant.key !== key)
    if (next.length && !next.some((variant) => variant.is_default)) next[0] = { ...next[0], is_default: true }
    onChange(next)
  }

  const canTurnOff = variants.length <= 1
  const single = variants[0]

  return (
    <div className="grid gap-5">
      <label className="flex items-start justify-between gap-4 rounded-lg border bg-muted/30 p-4">
        <span>
          <span className="block text-sm font-medium">This product has variants</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {hasVariants && !canTurnOff
              ? 'Remove the extra variants to switch back to a single price.'
              : 'Offer different sizes, weights or packs, each with its own price and stock.'}
          </span>
        </span>
        <Switch
          checked={hasVariants}
          disabled={hasVariants && !canTurnOff}
          onCheckedChange={onHasVariantsChange}
          aria-label="This product has variants"
        />
      </label>

      {error?.field('variants') && <p className="text-xs text-destructive">{error.field('variants')}</p>}

      {!hasVariants && single ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="price" label="Price (৳)" error={fieldError(0, 'price')}>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={single.price}
              onChange={(e) => update(single.key, { price: e.target.value })}
              placeholder="0.00"
              required
            />
          </FormField>
          <FormField
            id="compare_price"
            label="Compare-at price (৳)"
            hint={<Optional />}
            error={fieldError(0, 'compare_price')}
            description="The original price, shown crossed out when the product is on sale."
          >
            <Input
              id="compare_price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={single.compare_price}
              onChange={(e) => update(single.key, { compare_price: e.target.value })}
              placeholder="0.00"
            />
          </FormField>
          <FormField
            id="stock"
            label="Stock quantity"
            hint={<Optional />}
            error={fieldError(0, 'stock')}
            description="Leave empty if you don't track stock for this product."
          >
            <Input
              id="stock"
              type="number"
              inputMode="numeric"
              min={0}
              step="1"
              value={single.stock}
              onChange={(e) => update(single.key, { stock: e.target.value })}
              placeholder="Unlimited"
            />
          </FormField>
          <FormField id="sku" label="SKU" hint={<Optional />} error={fieldError(0, 'sku')}>
            <Input
              id="sku"
              value={single.sku}
              onChange={(e) => update(single.key, { sku: e.target.value })}
              placeholder="e.g. HNY-500"
            />
          </FormField>
        </div>
      ) : (
        <>
          <FormField
            id="option_name"
            label="Option name"
            hint={<Optional />}
            className="sm:max-w-xs"
            description="What the variants differ by, e.g. Weight or Size."
          >
            <Input
              id="option_name"
              list="option-presets"
              value={optionName}
              onChange={(e) => onOptionNameChange(e.target.value)}
              placeholder="e.g. Weight"
            />
            <datalist id="option-presets">
              {OPTION_PRESETS.map((preset) => (
                <option key={preset} value={preset} />
              ))}
            </datalist>
          </FormField>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                <tr>
                  <th className="w-16 px-3 py-2.5 text-center font-medium">Default</th>
                  <th className="px-2 py-2.5 font-medium">{optionName.trim() || 'Variant'} *</th>
                  <th className="w-28 px-2 py-2.5 font-medium">Price (৳) *</th>
                  <th className="w-28 px-2 py-2.5 font-medium">Compare-at</th>
                  <th className="w-24 px-2 py-2.5 font-medium">Stock</th>
                  <th className="w-32 px-2 py-2.5 font-medium">SKU</th>
                  <th className="w-12 px-2 py-2.5">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {variants.map((variant, index) => (
                  <tr key={variant.key} className={cn('align-top', variant.is_default && 'bg-secondary/40')}>
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="radio"
                        name="default-variant"
                        checked={variant.is_default}
                        onChange={() => setDefault(variant.key)}
                        className="mt-2 size-4 accent-primary"
                        aria-label={`Make ${variant.title || `variant ${index + 1}`} the default`}
                      />
                    </td>
                    <Cell error={fieldError(index, 'title')}>
                      <Input
                        value={variant.title}
                        onChange={(e) => update(variant.key, { title: e.target.value })}
                        placeholder={index === 0 ? 'e.g. 500 g' : 'e.g. 1 kg'}
                        aria-label={`Variant ${index + 1} name`}
                        required
                      />
                    </Cell>
                    <Cell error={fieldError(index, 'price')}>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => update(variant.key, { price: e.target.value })}
                        placeholder="0.00"
                        aria-label={`Variant ${index + 1} price`}
                        required
                      />
                    </Cell>
                    <Cell error={fieldError(index, 'compare_price')}>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={variant.compare_price}
                        onChange={(e) => update(variant.key, { compare_price: e.target.value })}
                        placeholder="—"
                        aria-label={`Variant ${index + 1} compare-at price`}
                      />
                    </Cell>
                    <Cell error={fieldError(index, 'stock')}>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step="1"
                        value={variant.stock}
                        onChange={(e) => update(variant.key, { stock: e.target.value })}
                        placeholder="∞"
                        aria-label={`Variant ${index + 1} stock`}
                      />
                    </Cell>
                    <Cell error={fieldError(index, 'sku')}>
                      <Input
                        value={variant.sku}
                        onChange={(e) => update(variant.key, { sku: e.target.value })}
                        placeholder="—"
                        aria-label={`Variant ${index + 1} SKU`}
                      />
                    </Cell>
                    <td className="px-2 py-2.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={variants.length <= 1}
                        onClick={() => remove(variant.key)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove variant ${index + 1}`}
                      >
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={variants.length >= MAX_VARIANTS}
              onClick={() => onChange([...variants, emptyVariant()])}
            >
              <Plus /> Add variant
            </Button>
            <p className="text-xs text-muted-foreground">
              The default variant's price is shown on product cards. Leave stock empty to sell without limits.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function Cell({ error, children }: { error?: string; children: ReactNode }) {
  return (
    <td className="px-2 py-2.5">
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </td>
  )
}

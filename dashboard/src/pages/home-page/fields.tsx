import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { FormField, Optional } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { HOME_ICONS } from '@/lib/home-content'
import { cn } from '@/lib/utils'

import { limitFor } from './content-form'

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function FormattingHint() {
  return (
    <>
      Each line becomes its own paragraph. <code className="rounded bg-muted px-1">**word**</code> makes text bold and{' '}
      <code className="rounded bg-muted px-1">[Shop honey](/shop?category=honey)</code> adds a link.
    </>
  )
}

export function TextField({
  path,
  label,
  value,
  error,
  onChange,
  description,
  placeholder,
  multiline,
  rows = 3,
  optional,
  className,
}: {
  path: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
  description?: ReactNode
  placeholder?: string
  multiline?: boolean
  rows?: number
  optional?: boolean
  className?: string
}) {
  const id = `home-${path.replace(/\./g, '-')}`
  const max = limitFor(path)
  const isLink = /(?:^|\.)(?:image|\w+_url)$/.test(path)
  const counter = !isLink && value.length > max * 0.8 && (
    <span className={cn('text-xs tabular-nums', value.length > max ? 'text-destructive' : 'text-muted-foreground')}>
      {value.length}/{max}
    </span>
  )

  return (
    <FormField id={id} label={label} error={error} description={description} hint={counter || (optional ? <Optional /> : undefined)} className={className}>
      {multiline ? (
        <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} aria-invalid={Boolean(error)} />
      ) : (
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          {...(isLink ? { autoCapitalize: 'none', spellCheck: false } : {})}
        />
      )}
    </FormField>
  )
}

export function NumberField({
  path,
  label,
  value,
  error,
  onChange,
  min,
  max,
  suffix,
  description,
  className,
}: {
  path: string
  label: string
  value: number
  error?: string
  onChange: (value: number) => void
  min: number
  max: number
  suffix?: string
  description?: ReactNode
  className?: string
}) {
  const id = `home-${path.replace(/\./g, '-')}`

  return (
    <FormField id={id} label={label} error={error} description={description} className={className}>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={String(value)}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          aria-invalid={Boolean(error)}
          className="w-24"
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </FormField>
  )
}

export function IconSelect({ value, onChange, label = 'Icon' }: { value: string; onChange: (value: string) => void; label?: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full" aria-label={label}>
          <SelectValue placeholder="Choose an icon" />
        </SelectTrigger>
        <SelectContent>
          {HOME_ICONS.map(({ name, label: iconLabel, icon: Icon }) => (
            <SelectItem key={name} value={name}>
              <Icon /> {iconLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <span>
        <span className="block text-sm font-medium">{title}</span>
        {description && <span className="block text-xs text-muted-foreground">{description}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  )
}

/** A repeatable group of fields with add / remove controls. */
export function ItemList<T>({
  items,
  onChange,
  max,
  min = 0,
  noun,
  blank,
  sortable,
  children,
}: {
  items: T[]
  onChange: (items: T[]) => void
  max: number
  min?: number
  noun: string
  blank: T
  /** Shows move up / down buttons. */
  sortable?: boolean
  children: (item: T, index: number) => ReactNode
}) {
  const move = (from: number, to: number) => {
    const next = [...items]
    next.splice(to, 0, ...next.splice(from, 1))
    onChange(next)
  }

  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border bg-muted/20 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {noun} {index + 1}
            </p>
            <div className="flex items-center gap-0.5">
              {sortable && (
                <>
                  <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move ${noun.toLowerCase()} ${index + 1} up`}>
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label={`Move ${noun.toLowerCase()} ${index + 1} down`}
                  >
                    <ArrowDown />
                  </Button>
                </>
              )}
              {items.length > min && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  aria-label={`Remove ${noun.toLowerCase()} ${index + 1}`}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          </div>
          {children(item, index)}
        </div>
      ))}
      {items.length < max && (
        <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => onChange([...items, blank])}>
          <Plus /> Add {noun.toLowerCase()}
        </Button>
      )}
    </div>
  )
}

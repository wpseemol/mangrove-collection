import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { FormField, Optional } from '@/components/form-field'
import { SingleImageUpload } from '@/components/image-upload'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import type { DraftValue, Errors } from './draft'
import { PAYMENT_METHODS, SOCIAL_NETWORKS, type FieldDef } from './sections'

const SECRET_MASK = '********'

const INPUT_TYPES: Partial<Record<FieldDef['kind'], { type: string; inputMode?: 'tel' | 'email' | 'url' | 'decimal' | 'numeric' }>> = {
  url: { type: 'url', inputMode: 'url' },
  email: { type: 'email', inputMode: 'email' },
  phone: { type: 'tel', inputMode: 'tel' },
  whatsapp: { type: 'tel', inputMode: 'tel' },
  number: { type: 'number', inputMode: 'decimal' },
}

export function SettingField({
  field,
  value,
  errors,
  onChange,
}: {
  field: FieldDef
  value: DraftValue
  errors: Errors
  onChange: (value: DraftValue) => void
}) {
  const id = `setting-${field.key}`
  const error = errors[field.key]
  const optional = field.required || field.kind === 'select' ? null : <Optional />
  const className = cn(field.wide && 'sm:col-span-2')

  switch (field.kind) {
    case 'switch':
      return (
        <label htmlFor={id} className={cn('flex items-center justify-between gap-3 rounded-lg border p-3', className)}>
          <span>
            <span className="block text-sm font-medium">{field.label}</span>
            {field.description && <span className="block text-xs text-muted-foreground">{field.description}</span>}
          </span>
          <Switch id={id} checked={value as boolean} onCheckedChange={onChange} />
        </label>
      )

    case 'select':
      return (
        <FormField id={id} label={field.label} error={error} description={field.description} className={className}>
          <Select value={value as string} onValueChange={onChange}>
            <SelectTrigger id={id} className="w-full" aria-invalid={Boolean(error)}>
              <SelectValue placeholder="Choose…" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )

    case 'textarea':
    case 'code': {
      const text = value as string
      return (
        <FormField
          id={id}
          label={field.label}
          error={error}
          description={field.description ?? (field.kind === 'textarea' ? 'Plain text only.' : undefined)}
          className={className}
          hint={
            field.max ? (
              <span className="text-xs text-muted-foreground tabular-nums">
                {text.trim().length}/{field.max}
              </span>
            ) : (
              optional
            )
          }
        >
          <Textarea
            id={id}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.max}
            rows={field.kind === 'code' ? 6 : 3}
            spellCheck={field.kind !== 'code'}
            aria-invalid={Boolean(error)}
            className={cn(field.kind === 'code' && 'font-mono text-xs')}
          />
        </FormField>
      )
    }

    case 'image':
      return (
        <FormField id={id} label={field.label} hint={optional} error={error} description={field.description} className={className}>
          <div className="flex items-start gap-3">
            <SingleImageUpload value={value as string} onChange={onChange} className="w-28 shrink-0" />
            <Input
              id={id}
              type="url"
              inputMode="url"
              value={value as string}
              onChange={(e) => onChange(e.target.value)}
              placeholder="…or paste an image link"
              aria-invalid={Boolean(error)}
            />
          </div>
        </FormField>
      )

    case 'secret':
      return <SecretField id={id} field={field} value={value as string} error={error} onChange={onChange} className={className} />

    case 'social': {
      const links = value as Record<string, string>
      return (
        <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
          {SOCIAL_NETWORKS.map((network) => {
            const key = `${field.key}.${network.key}`
            return (
              <FormField key={network.key} id={`setting-${key}`} label={network.label} hint={<Optional />} error={errors[key]}>
                <Input
                  id={`setting-${key}`}
                  type="url"
                  inputMode="url"
                  value={links[network.key] ?? ''}
                  onChange={(e) => onChange({ ...links, [network.key]: e.target.value })}
                  placeholder={network.placeholder}
                  maxLength={2048}
                  aria-invalid={Boolean(errors[key])}
                />
              </FormField>
            )
          })}
        </div>
      )
    }

    case 'payments': {
      const selected = value as string[]
      return (
        <fieldset className={cn('space-y-2', className)}>
          <legend className="mb-2 text-sm font-medium">{field.label}</legend>
          <div className="grid gap-2 sm:grid-cols-4">
            {PAYMENT_METHODS.map((method) => (
              <label key={method.value} className="flex items-center gap-2 rounded-lg border p-2.5 text-sm has-data-[state=checked]:border-primary">
                <Checkbox
                  checked={selected.includes(method.value)}
                  onCheckedChange={(checked) =>
                    onChange(checked ? [...selected, method.value] : selected.filter((v) => v !== method.value))
                  }
                />
                {method.label}
              </label>
            ))}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </fieldset>
      )
    }

    default: {
      const input = INPUT_TYPES[field.kind]
      return (
        <FormField id={id} label={field.label} hint={optional} error={error} description={field.description} className={className}>
          <Input
            id={id}
            type={input?.type ?? 'text'}
            inputMode={field.kind === 'number' && field.integer ? 'numeric' : input?.inputMode}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.kind === 'number' ? undefined : (field.max ?? 2048)}
            min={field.kind === 'number' ? field.min : undefined}
            max={field.kind === 'number' ? field.max : undefined}
            step={field.kind === 'number' ? (field.integer ? 1 : 'any') : undefined}
            aria-invalid={Boolean(error)}
          />
        </FormField>
      )
    }
  }
}

function SecretField({
  id,
  field,
  value,
  error,
  className,
  onChange,
}: {
  id: string
  field: FieldDef
  value: string
  error?: string
  className?: string
  onChange: (value: string) => void
}) {
  const [visible, setVisible] = useState(false)
  const stored = value === SECRET_MASK

  return (
    <FormField
      id={id}
      label={field.label}
      hint={<Optional />}
      error={error}
      className={className}
      description={stored ? 'Saved and encrypted. Type a new value to replace it, or clear the field to remove it.' : 'Stored encrypted. Never shown again after saving.'}
    >
      <div className="relative">
        <Input
          id={id}
          type={visible && !stored ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => stored && e.target.select()}
          autoComplete="new-password"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          className="pr-10"
        />
        {!stored && value && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={visible ? 'Hide value' : 'Show value'}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </FormField>
  )
}

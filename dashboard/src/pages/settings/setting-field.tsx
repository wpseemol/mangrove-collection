import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'

import { FormField, Optional } from '@/components/form-field'
import { SingleImageUpload } from '@/components/image-upload'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import type { DraftValue, Errors } from './draft'
import { RevealSecretDialog } from './reveal-secret-dialog'
import { SOCIAL_NETWORKS, type FieldDef } from './sections'

const SECRET_MASK = '********'
const REVEAL_SECONDS = 60

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
  const [asking, setAsking] = useState(false)
  // The decrypted saved value; shown in place of the mask but never put in the draft, so it is not re-sent.
  const [revealed, setRevealed] = useState<string | null>(null)
  const stored = value === SECRET_MASK
  const showingSaved = stored && revealed !== null

  useEffect(() => {
    if (!showingSaved) return
    const timer = window.setTimeout(() => setRevealed(null), REVEAL_SECONDS * 1000)
    return () => window.clearTimeout(timer)
  }, [showingSaved])

  const toggle = () => {
    if (!stored) setVisible((v) => !v)
    else if (showingSaved) setRevealed(null)
    else setAsking(true)
  }

  const shown = showingSaved || (visible && !stored)

  return (
    <FormField
      id={id}
      label={field.label}
      hint={<Optional />}
      error={error}
      className={className}
      description={
        showingSaved
          ? `Showing the saved value. It hides again in ${REVEAL_SECONDS} seconds.`
          : stored
            ? 'Saved and encrypted. Use the eye to view it, type a new value to replace it, or clear the field to remove it.'
            : 'Stored encrypted. Viewing it later needs your password.'
      }
    >
      <div className="relative">
        <Input
          id={id}
          type={shown ? 'text' : 'password'}
          value={showingSaved ? revealed : value}
          onChange={(e) => {
            setRevealed(null)
            onChange(e.target.value)
          }}
          onFocus={(e) => stored && e.target.select()}
          autoComplete="new-password"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          className={cn('pr-10', showingSaved && 'font-mono text-xs')}
        />
        {(stored || value) && (
          <button
            type="button"
            onClick={toggle}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={shown ? 'Hide value' : stored ? 'Show saved value' : 'Show value'}
            title={shown ? 'Hide' : stored ? 'Show saved value (needs your password)' : 'Show'}
          >
            {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {stored && (
        <RevealSecretDialog settingKey={field.key} label={field.label} open={asking} onOpenChange={setAsking} onRevealed={(v) => setRevealed(v ?? '')} />
      )}
    </FormField>
  )
}

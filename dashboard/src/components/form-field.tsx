import type { ReactNode } from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function FormField({
  id,
  label,
  error,
  hint,
  description,
  className,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  description?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm text-gray-800">
          {label}
        </Label>
        {hint}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        description && <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export function Optional() {
  return <span className="text-xs text-muted-foreground">Optional</span>
}

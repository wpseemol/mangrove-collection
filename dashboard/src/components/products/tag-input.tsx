import { X } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'

const MAX_TAGS = 30

export function TagInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [text, setText] = useState('')

  const commit = (raw: string) => {
    const additions = raw
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag && !value.some((existing) => existing.toLowerCase() === tag.toLowerCase()))
    if (additions.length) onChange([...value, ...additions].slice(0, MAX_TAGS))
    setText('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit(text)
    } else if (event.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 shadow-xs transition-[color,box-shadow]',
        'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="rounded-sm text-secondary-foreground/60 hover:text-secondary-foreground"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => text && commit(text)}
        placeholder={value.length ? '' : placeholder}
        disabled={value.length >= MAX_TAGS}
        className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

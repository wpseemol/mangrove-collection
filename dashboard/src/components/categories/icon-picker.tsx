import { Loader2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { IconGlyph } from '@/components/categories/icon-glyph'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategoryIcons } from '@/lib/queries'
import type { CategoryIcon } from '@/lib/types'
import { cn } from '@/lib/utils'

const ALL = 'all'

/** Icons whose keywords match words in the category name, e.g. "Sundarban Honey" → hexagon, flower, droplet. */
function suggestIcons(icons: CategoryIcon[], categoryName: string): CategoryIcon[] {
  const words = categoryName.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= 3)
  if (!words.length) return []

  return icons
    .map((icon) => ({
      icon,
      score: icon.keywords.reduce(
        (score, keyword) => score + (words.some((word) => keyword === word) ? 3 : words.some((word) => keyword.startsWith(word) || (keyword.length >= 4 && word.startsWith(keyword))) ? 1 : 0),
        0,
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ icon }) => icon)
}

function IconButton({ icon, selected, onSelect }: { icon: CategoryIcon; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      title={icon.label}
      aria-label={icon.label}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex aspect-square items-center justify-center rounded-md text-foreground/80 transition-colors outline-none hover:bg-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
      )}
    >
      <IconGlyph nodes={icon.nodes} className="size-5" />
    </button>
  )
}

export function IconPicker({
  value,
  onChange,
  categoryName,
}: {
  value: string
  onChange: (name: string) => void
  categoryName: string
}) {
  const { data: icons, isPending, isError, refetch } = useCategoryIcons()
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState(ALL)

  const groups = useMemo(() => [...new Set(icons?.map((icon) => icon.group))], [icons])
  const suggestions = useMemo(() => (icons ? suggestIcons(icons, categoryName) : []), [icons, categoryName])

  const term = search.trim().toLowerCase()
  const visible = useMemo(
    () =>
      icons?.filter(
        (icon) =>
          (group === ALL || icon.group === group) &&
          (!term || icon.label.toLowerCase().includes(term) || icon.keywords.some((keyword) => keyword.includes(term))),
      ) ?? [],
    [icons, group, term],
  )

  if (isPending) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border text-sm text-muted-foreground">
        The icon library could not be loaded.
        <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex gap-2 border-b bg-muted/30 p-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${icons.length} icons…`}
            maxLength={50}
            className="h-8 pl-8"
            aria-label="Search icons"
          />
        </div>
        <Select value={group} onValueChange={setGroup}>
          <SelectTrigger size="sm" className="w-44" aria-label="Icon group">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All groups</SelectItem>
            {groups.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {suggestions.length > 0 && !term && group === ALL && (
        <div className="border-b p-2">
          <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">Suggested for “{categoryName.trim()}”</p>
          <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
            {suggestions.map((icon) => (
              <IconButton key={icon.name} icon={icon} selected={icon.name === value} onSelect={() => onChange(icon.name)} />
            ))}
          </div>
        </div>
      )}

      <div className="max-h-56 overflow-y-auto p-2">
        {visible.length ? (
          <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
            {visible.map((icon) => (
              <IconButton key={icon.name} icon={icon} selected={icon.name === value} onSelect={() => onChange(icon.name)} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">No icons match “{search.trim()}”.</p>
        )}
      </div>
    </div>
  )
}

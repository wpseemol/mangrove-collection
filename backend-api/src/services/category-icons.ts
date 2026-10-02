import { readFileSync } from 'node:fs'
import { paths } from '../lib/paths.js'

export type IconNode = [string, Record<string, string>]
export type CategoryIcon = { name: string; label: string; group: string; keywords: string[]; nodes: IconNode[] }

let byName: Map<string, CategoryIcon> | null = null

function load(): Map<string, CategoryIcon> {
  if (!byName) {
    const icons = JSON.parse(readFileSync(paths.categoryIcons, 'utf8')) as CategoryIcon[]
    byName = new Map(icons.map((icon) => [icon.name, icon]))
  }
  return byName
}

/** The curated category icon library (Lucide outlines) in data/category-icons.json. */
export const categoryIcons = {
  all: (): CategoryIcon[] => [...load().values()],
  names: (): string[] => [...load().keys()],
  find: (name: string | null | undefined): CategoryIcon | null => (name ? (load().get(name) ?? null) : null),
}

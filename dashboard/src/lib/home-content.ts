import {
  Award,
  Clock,
  Fish,
  Heart,
  Leaf,
  PackageCheck,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

/**
 * Home page copy is stored as typed blocks in the `sections` of the `home` page.
 * Keep the block shapes and defaults in sync with `frontend/src/lib/home-content.ts`.
 */

export const HOME_ICONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: 'leaf', label: 'Leaf', icon: Leaf },
  { name: 'shield-check', label: 'Shield', icon: ShieldCheck },
  { name: 'truck', label: 'Truck', icon: Truck },
  { name: 'wallet', label: 'Wallet', icon: Wallet },
  { name: 'fish', label: 'Fish', icon: Fish },
  { name: 'package-check', label: 'Package', icon: PackageCheck },
  { name: 'heart', label: 'Heart', icon: Heart },
  { name: 'star', label: 'Star', icon: Star },
  { name: 'clock', label: 'Clock', icon: Clock },
  { name: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { name: 'award', label: 'Award', icon: Award },
  { name: 'phone', label: 'Phone', icon: Phone },
]

export type IconItem = { icon: string; title: string; text: string }
export type HeroPromo = { eyebrow: string; title: string; link_label: string; link_url: string }

export type HeroBlock = {
  type: 'hero'
  mode: 'static' | 'slider'
  eyebrow: string
  title: string
  highlight: string
  description: string
  primary_label: string
  primary_url: string
  secondary_label: string
  secondary_url: string
  image: string
  autoplay_seconds: number
  show_side_cards: boolean
  promos: HeroPromo[]
}

export type TrustBlock = { type: 'trust'; enabled: boolean; items: IconItem[] }

export type HeadingBlock = {
  type: 'categories' | 'popular' | 'latest'
  enabled: boolean
  eyebrow: string
  title: string
  subtitle: string
  link_label: string
}

export type PromiseBlock = {
  type: 'promise'
  enabled: boolean
  eyebrow: string
  title: string
  description: string
  primary_label: string
  primary_url: string
  secondary_label: string
  secondary_url: string
  steps: IconItem[]
}

export type StoryBlock = {
  type: 'story'
  enabled: boolean
  eyebrow: string
  title: string
  body: string
  image: string
  button_label: string
  button_url: string
  stats: { value: string; label: string }[]
}

export type HomeContent = {
  hero: HeroBlock
  trust: TrustBlock
  categories: HeadingBlock
  popular: HeadingBlock
  latest: HeadingBlock
  promise: PromiseBlock
  story: StoryBlock
}

export const DEFAULT_HOME: HomeContent = {
  hero: {
    type: 'hero',
    mode: 'slider',
    eyebrow: 'From the heart of the Sundarbans',
    title: 'Fresh from the mangrove,',
    highlight: 'delivered to your door.',
    description:
      'Fish, crab, prawn and pure honey collected directly from the Sundarbans — carefully packed and delivered all over Bangladesh.',
    primary_label: 'Shop now',
    primary_url: '/shop',
    secondary_label: 'Browse categories',
    secondary_url: '/categories',
    image: '',
    autoplay_seconds: 5,
    show_side_cards: true,
    promos: [
      { eyebrow: 'Just landed', title: 'New arrivals', link_label: 'Shop now', link_url: '/shop?sort=latest' },
      { eyebrow: 'Limited time', title: "Today's offers", link_label: 'Shop now', link_url: '/offers' },
    ],
  },
  trust: {
    type: 'trust',
    enabled: true,
    items: [
      { icon: 'leaf', title: 'Directly sourced', text: 'Collected from the Sundarbans' },
      { icon: 'shield-check', title: 'Carefully checked', text: 'Fresh, natural & hygienic packing' },
      { icon: 'truck', title: 'Nationwide delivery', text: 'Home delivery all over Bangladesh' },
      { icon: 'wallet', title: 'Easy payment', text: 'Cash on delivery & mobile banking' },
    ],
  },
  categories: {
    type: 'categories',
    enabled: true,
    eyebrow: 'Shop by category',
    title: 'Explore our collection',
    subtitle: 'Hand-picked produce from the Sundarbans, sorted for you.',
    link_label: 'All categories',
  },
  popular: {
    type: 'popular',
    enabled: true,
    eyebrow: 'Best sellers',
    title: 'Popular right now',
    subtitle: "Our customers' favourites from the Sundarbans.",
    link_label: 'View all',
  },
  latest: {
    type: 'latest',
    enabled: true,
    eyebrow: 'Fresh in',
    title: 'New arrivals',
    subtitle: 'The latest catch and harvest, just added to the store.',
    link_label: 'View all',
  },
  promise: {
    type: 'promise',
    enabled: true,
    eyebrow: 'Our promise',
    title: 'From the heart of the Sundarbans to your kitchen.',
    description:
      'Mangrove Collection sources directly from the Sundarbans, so you get honest, fresh and natural products without the middlemen.',
    primary_label: 'Read our story',
    primary_url: '/about',
    secondary_label: 'Contact us',
    secondary_url: '/contact',
    steps: [
      { icon: 'fish', title: 'Collected at the source', text: 'Local collectors gather fish, crab, prawn and honey straight from the Sundarbans.' },
      { icon: 'leaf', title: 'Kept natural', text: 'No shortcuts — products are cleaned, sorted and kept as close to nature as possible.' },
      { icon: 'package-check', title: 'Packed & delivered', text: 'Carefully packed and sent to your door anywhere in Bangladesh.' },
    ],
  },
  story: {
    type: 'story',
    enabled: true,
    eyebrow: 'Our story',
    title: 'Born on the edge of the Sundarbans',
    body:
      'Mangrove Collection began with a simple idea: the honest, natural food of the Sundarbans should reach every kitchen in Bangladesh without losing its freshness on the way.\nWe work side by side with local fishermen and honey collectors, paying them fairly and bringing their harvest straight to you.',
    image: '',
    button_label: 'Read our full story',
    button_url: '/about',
    stats: [
      { value: '100%', label: 'Natural products' },
      { value: '64', label: 'Districts delivered' },
      { value: 'Direct', label: 'From local collectors' },
    ],
  },
}

export const HOME_BLOCKS = Object.keys(DEFAULT_HOME) as (keyof HomeContent)[]

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)

function merge<T extends object>(defaults: T, stored: unknown): T {
  if (!isRecord(stored)) return defaults

  const result = { ...defaults }
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const fallback = defaults[key]
    const value = stored[key as string]

    if (Array.isArray(fallback)) {
      if (!Array.isArray(value)) continue
      const template = fallback[0]
      result[key] = (isRecord(template) ? value.filter(isRecord).map((item) => merge(template, item)) : value) as T[keyof T]
    } else if (typeof value === typeof fallback) {
      result[key] = value as T[keyof T]
    }
  }
  return result
}

export function parseHomeContent(sections: unknown[] | undefined): HomeContent {
  const find = (type: string) => sections?.find((section) => isRecord(section) && section.type === type)
  const content = Object.fromEntries(HOME_BLOCKS.map((key) => [key, merge(DEFAULT_HOME[key], find(key))])) as HomeContent

  // The hero always has exactly two side cards (top and bottom).
  const promos = DEFAULT_HOME.hero.promos.map((fallback, index) => content.hero.promos[index] ?? fallback)
  return { ...content, hero: { ...content.hero, promos } }
}

/** Saved sections that aren't home blocks (e.g. older free-form cards), kept untouched on save. */
export const otherSections = (sections: unknown[] | undefined) =>
  (sections ?? []).filter((section) => !(isRecord(section) && HOME_BLOCKS.includes(section.type as keyof HomeContent)))

/** Blocks in page order, with surrounding whitespace trimmed from every string. */
export function toSections(content: HomeContent): unknown[] {
  const tidy = (value: unknown): unknown => {
    if (typeof value === 'string') return value.trim()
    if (Array.isArray(value)) return value.map(tidy)
    if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, tidy(item)]))
    return value
  }

  return HOME_BLOCKS.map((key) => tidy(content[key]))
}

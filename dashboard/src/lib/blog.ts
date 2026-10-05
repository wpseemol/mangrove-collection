import { STOREFRONT_URL } from '@/lib/config'
import type { BlogMediaType, BlogStatus, VideoProvider } from '@/lib/types'

export const storefrontPostUrl = (slug: string) => `${STOREFRONT_URL}/blog/${encodeURIComponent(slug)}/`

export type MediaDraft = { key: string; type: BlogMediaType; provider: VideoProvider; url: string; caption: string }

export const MAX_MEDIA = 30

let nextKey = 0
export const mediaKey = () => `m${++nextKey}`

export const BLOG_LIMITS = { title: 255, slug: 255, excerpt: 500, tags: 20, tag: 50, metaTitle: 255, metaDescription: 500 } as const

export const BLOG_STATUS_LABELS: Record<BlogStatus, string> = { draft: 'Draft', published: 'Published' }

/** Keeps typed slugs URL-safe as you go; a trailing dash is kept so typing can continue. */
export const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-/, '')

export const tidySlug = (value: string) => normalizeSlug(value).replace(/-+$/, '')

export type BlogView = 'list' | 'grid'
const VIEW_KEY = 'mangrove.blog.view'

export const readBlogView = (): BlogView => (localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid')
export const saveBlogView = (view: BlogView) => localStorage.setItem(VIEW_KEY, view)

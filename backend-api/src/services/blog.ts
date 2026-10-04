import { open, rm, copyFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { storage } from '../lib/storage.js'
import { random } from '../lib/str.js'
import { isHttpUrl } from '../validation/rules.js'

export const BLOG_STATUSES = ['draft', 'published'] as const
export const VIDEO_PROVIDERS = ['upload', 'youtube', 'vimeo'] as const
export type VideoProvider = (typeof VIDEO_PROVIDERS)[number]

export const MAX_BLOG_MEDIA = 30

/** The 11-character video id from youtube.com/watch, youtu.be, /embed, /shorts and /live links. */
export function youtubeId(url: string): string | null {
  if (!isHttpUrl(url)) return null
  const { hostname, pathname, searchParams } = new URL(url)
  const host = hostname.replace(/^(?:www\.|m\.)/, '')
  let candidate: string | null = null

  if (host === 'youtu.be') candidate = pathname.slice(1).split('/')[0]
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    candidate = pathname === '/watch' ? searchParams.get('v') : (/^\/(?:embed|shorts|live)\/([^/]+)/.exec(pathname)?.[1] ?? null)
  }

  return candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null
}

/** The numeric id from vimeo.com/123 or player.vimeo.com/video/123 links. */
export function vimeoId(url: string): string | null {
  if (!isHttpUrl(url)) return null
  const { hostname, pathname } = new URL(url)
  const host = hostname.replace(/^www\./, '')
  const match = host === 'vimeo.com' ? /^\/(?:.*\/)?(\d{6,12})$/.exec(pathname) : host === 'player.vimeo.com' ? /^\/video\/(\d{6,12})$/.exec(pathname) : null
  return match?.[1] ?? null
}

/** A video uploaded through `POST /admin/media/videos`: it lives on our own public disk. */
export function isUploadedVideo(url: string): boolean {
  const base = storage.url('public', 'uploads/')
  return url.startsWith(base) && /^[\w/-]+\.(?:mp4|webm)$/.test(url.slice(base.length)) && !url.includes('..')
}

export function isVideoUrl(provider: string, url: string): boolean {
  if (provider === 'youtube') return youtubeId(url) !== null
  if (provider === 'vimeo') return vimeoId(url) !== null
  if (provider === 'upload') return isUploadedVideo(url)
  return false
}

/** Works out the provider of a pasted link, or null when it is not a supported video link. */
export function detectProvider(url: string): VideoProvider | null {
  if (youtubeId(url)) return 'youtube'
  if (vimeoId(url)) return 'vimeo'
  if (isUploadedVideo(url)) return 'upload'
  return null
}

export function embedUrl(provider: string, url: string): string | null {
  if (provider === 'youtube') {
    const id = youtubeId(url)
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }
  if (provider === 'vimeo') {
    const id = vimeoId(url)
    return id ? `https://player.vimeo.com/video/${id}` : null
  }
  return null
}

export function videoThumbnail(provider: string, url: string): string | null {
  const id = provider === 'youtube' ? youtubeId(url) : null
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}

export type VideoFormat = { extension: 'mp4' | 'webm'; mime: string }

/** Sniffs the container from the first bytes instead of trusting the file name or the browser's MIME type. */
export async function sniffVideo(path: string): Promise<VideoFormat | null> {
  const handle = await open(path, 'r')
  try {
    const { buffer, bytesRead } = await handle.read(Buffer.alloc(16), 0, 16, 0)
    if (bytesRead < 12) return null
    if (buffer.toString('latin1', 4, 8) === 'ftyp') {
      const brand = buffer.toString('latin1', 8, 12)
      return brand.startsWith('qt') ? null : { extension: 'mp4', mime: 'video/mp4' }
    }
    if (buffer.readUInt32BE(0) === 0x1a45dfa3) return { extension: 'webm', mime: 'video/webm' }
    return null
  } finally {
    await handle.close()
  }
}

/** Moves a temp upload onto the public disk and returns its relative path. */
export async function storeVideo(tempPath: string, format: VideoFormat): Promise<string> {
  const now = new Date()
  const path = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${random(40)}.${format.extension}`
  const target = storage.path('public', path)
  await mkdir(dirname(target), { recursive: true })
  await copyFile(tempPath, target)
  await rm(tempPath, { force: true })
  return path
}

export async function discardTemp(path: string | undefined): Promise<void> {
  if (path) await rm(path, { force: true }).catch(() => undefined)
}

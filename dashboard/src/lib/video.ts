import type { VideoProvider } from '@/lib/types'

/** Mirrors `services/blog.ts` in the API, which has the final say. */
export function youtubeId(url: string): string | null {
  try {
    const { hostname, pathname, searchParams, protocol } = new URL(url)
    if (!/^https?:$/.test(protocol)) return null
    const host = hostname.replace(/^(?:www\.|m\.)/, '')
    let candidate: string | null = null
    if (host === 'youtu.be') candidate = pathname.slice(1).split('/')[0]
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      candidate = pathname === '/watch' ? searchParams.get('v') : (/^\/(?:embed|shorts|live)\/([^/]+)/.exec(pathname)?.[1] ?? null)
    }
    return candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null
  } catch {
    return null
  }
}

export function vimeoId(url: string): string | null {
  try {
    const { hostname, pathname, protocol } = new URL(url)
    if (!/^https?:$/.test(protocol)) return null
    const host = hostname.replace(/^www\./, '')
    const match = host === 'vimeo.com' ? /^\/(?:.*\/)?(\d{6,12})$/.exec(pathname) : host === 'player.vimeo.com' ? /^\/video\/(\d{6,12})$/.exec(pathname) : null
    return match?.[1] ?? null
  } catch {
    return null
  }
}

/** Uploaded videos come back from the API as `<api origin>/storage/uploads/….mp4`. */
export const isUploadedVideo = (url: string) => /\/storage\/uploads\/[\w/-]+\.(?:mp4|webm)$/i.test(url)

export function detectProvider(url: string): VideoProvider | null {
  if (youtubeId(url)) return 'youtube'
  if (vimeoId(url)) return 'vimeo'
  if (isUploadedVideo(url)) return 'upload'
  return null
}

export function embedUrl(url: string): string | null {
  const youtube = youtubeId(url)
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube}`
  const vimeo = vimeoId(url)
  return vimeo ? `https://player.vimeo.com/video/${vimeo}` : null
}

export function videoThumbnail(url: string): string | null {
  const id = youtubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}

export const PROVIDER_LABELS: Record<VideoProvider, string> = { upload: 'Uploaded video', youtube: 'YouTube', vimeo: 'Vimeo' }

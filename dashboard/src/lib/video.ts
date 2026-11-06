import type { VideoProvider } from '@/lib/types'

/** Mirrors `App\Support\BlogVideo` in the API, which has the final say. */
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

/** Facebook Watch, Reels, share links and fb.watch short links. */
export function isFacebookUrl(url: string): boolean {
  try {
    const { hostname, pathname, searchParams, protocol } = new URL(url)
    if (!/^https?:$/.test(protocol)) return false
    const host = hostname.replace(/^(?:www\.|m\.|web\.)/, '')
    if (host === 'fb.watch') return /^\/[A-Za-z0-9_-]{4,}\/?$/.test(pathname)
    if (host !== 'facebook.com') return false
    if (pathname === '/watch' || pathname.startsWith('/watch/')) return /^\d{5,20}$/.test(searchParams.get('v') ?? '')
    return /^\/(?:reel|share\/(?:v|r))\/[A-Za-z0-9_-]+\/?$/.test(pathname) || /^\/[A-Za-z0-9.]+\/videos\/\d{5,20}\/?$/.test(pathname)
  } catch {
    return false
  }
}

/** Uploaded videos come back from the API as `<api origin>/storage/uploads/….mp4`. */
export const isUploadedVideo = (url: string) => /\/storage\/uploads\/[\w/-]+\.(?:mp4|webm)$/i.test(url)

export function detectProvider(url: string): VideoProvider | null {
  if (youtubeId(url)) return 'youtube'
  if (vimeoId(url)) return 'vimeo'
  if (isFacebookUrl(url)) return 'facebook'
  if (isUploadedVideo(url)) return 'upload'
  return null
}

export function embedUrl(url: string): string | null {
  const youtube = youtubeId(url)
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube}`
  const vimeo = vimeoId(url)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}`
  if (isFacebookUrl(url)) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`
  return null
}

export function videoThumbnail(url: string): string | null {
  const id = youtubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}

export const PROVIDER_LABELS: Record<VideoProvider, string> = {
  upload: 'Uploaded video',
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  facebook: 'Facebook',
}

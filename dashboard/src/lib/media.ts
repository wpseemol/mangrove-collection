import { ApiError, api } from '@/lib/api'
import { API_URL } from '@/lib/config'
import type { Media } from '@/lib/types'

export const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp,image/gif'
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export const ACCEPTED_VIDEOS = 'video/mp4,video/webm'
export const MAX_VIDEO_MB = 100

export async function uploadImages(files: File[]): Promise<Media[]> {
  const tooLarge = files.find((file) => file.size > MAX_IMAGE_BYTES)
  if (tooLarge) {
    throw new Error(`${tooLarge.name} is larger than 5 MB.`)
  }

  const form = new FormData()
  for (const file of files) form.append('files[]', file)

  const { data } = await api<{ data: Media[] }>('/admin/media', { method: 'POST', body: form })
  return data
}

function readCookie(name: string): string | null {
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

/** XHR instead of fetch so big videos can report upload progress (0–1). */
export async function uploadVideo(file: File, onProgress: (fraction: number) => void, signal?: AbortSignal): Promise<Media> {
  if (!ACCEPTED_VIDEOS.split(',').includes(file.type)) throw new Error(`${file.name} is not an MP4 or WebM video.`)
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) throw new Error(`${file.name} is larger than ${MAX_VIDEO_MB} MB.`)

  if (!readCookie('XSRF-TOKEN')) await fetch(`${new URL(API_URL).origin}/sanctum/csrf-cookie`, { credentials: 'include' })

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_URL}/admin/media/videos`)
    xhr.withCredentials = true
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    const xsrf = readCookie('XSRF-TOKEN')
    if (xsrf) xhr.setRequestHeader('X-XSRF-TOKEN', xsrf)

    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(event.loaded / event.total)
    xhr.onerror = () => reject(new Error('The upload failed. Check your connection and try again.'))
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'))
    xhr.onload = () => {
      let payload: { data?: Media; message?: string; errors?: Record<string, string[]> } = {}
      try {
        payload = JSON.parse(xhr.responseText)
      } catch {
        // Non-JSON error pages fall through to the generic message.
      }
      if (xhr.status === 201 && payload.data) resolve(payload.data)
      else reject(new ApiError(payload.errors?.file?.[0] ?? payload.message ?? 'The video could not be uploaded.', xhr.status, payload.errors))
    }

    signal?.addEventListener('abort', () => xhr.abort())
    const form = new FormData()
    form.append('file', file)
    xhr.send(form)
  })
}

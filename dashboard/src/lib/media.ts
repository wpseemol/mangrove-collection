import { api } from '@/lib/api'
import type { Media } from '@/lib/types'

export const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp,image/gif'
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

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

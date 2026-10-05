/** Must match CategoryRequest / CategoryImageService on the API. */
export const CATEGORY_IMAGE = {
  width: 800,
  height: 600,
  maxWidth: 3200,
  maxHeight: 2400,
  maxBytes: 2 * 1024 * 1024,
  types: ['image/jpeg', 'image/png', 'image/webp'],
} as const

export const CATEGORY_IMAGE_SIZE = `${CATEGORY_IMAGE.width} × ${CATEGORY_IMAGE.height} px`

/** Returns an error message, or null when the file meets the category image rules. */
export async function checkCategoryImage(file: File): Promise<string | null> {
  if (!(CATEGORY_IMAGE.types as readonly string[]).includes(file.type)) return 'Please choose a JPG, PNG or WEBP image.'
  if (file.size > CATEGORY_IMAGE.maxBytes) return 'The image must be 2 MB or smaller.'

  let width: number
  let height: number
  try {
    const bitmap = await createImageBitmap(file)
    ;({ width, height } = bitmap)
    bitmap.close()
  } catch {
    return 'This file could not be read as an image.'
  }

  const actual = `This image is ${width} × ${height} px.`
  if (width < CATEGORY_IMAGE.width || height < CATEGORY_IMAGE.height) {
    return `${actual} It must be at least ${CATEGORY_IMAGE_SIZE}.`
  }
  if (width > CATEGORY_IMAGE.maxWidth || height > CATEGORY_IMAGE.maxHeight) {
    return `${actual} It must be at most ${CATEGORY_IMAGE.maxWidth} × ${CATEGORY_IMAGE.maxHeight} px.`
  }
  // Same tolerance as Laravel's `dimensions:ratio` rule.
  if (Math.abs(4 / 3 - width / height) > 1 / (Math.max((width + height) / 2, height) + 1)) {
    return `${actual} It must be 4:3 landscape, e.g. 800 × 600, 1200 × 900 or 1600 × 1200 px.`
  }
  return null
}

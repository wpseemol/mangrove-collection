import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** backend-api/ — works from both src/lib (tsx) and dist/lib (node). */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

export const paths = {
  root,
  /** Disk "uploads": category and review images, served at /uploads. */
  get uploads() {
    return process.env.UPLOADS_PATH ?? resolve(root, 'public', 'uploads')
  },
  /** Disk "public": media library and avatars, served at /storage. */
  get publicStorage() {
    return process.env.PUBLIC_STORAGE_PATH ?? resolve(root, 'storage', 'app', 'public')
  },
  get logFile() {
    return process.env.LOG_FILE ?? resolve(root, 'storage', 'logs', 'app.log')
  },
  categoryIcons: resolve(root, 'data', 'category-icons.json'),
  seedImages: resolve(root, 'prisma', 'seed-images'),
}

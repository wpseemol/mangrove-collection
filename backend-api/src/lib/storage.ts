import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import { env } from '../config/env.js'
import { paths } from './paths.js'

/** "uploads" → public/uploads (served at /uploads); "public" → storage/app/public (served at /storage). */
export type Disk = 'uploads' | 'public'

function root(disk: Disk): string {
  return disk === 'uploads' ? paths.uploads : paths.publicStorage
}

/** Resolves a relative path inside a disk, refusing anything that escapes it. */
function absolute(disk: Disk, path: string): string {
  const base = resolve(root(disk))
  const target = resolve(base, path)
  if (target !== base && !target.startsWith(base + sep)) throw new Error('Path escapes the storage disk.')
  return target
}

export const storage = {
  async put(disk: Disk, path: string, contents: Buffer): Promise<void> {
    const target = absolute(disk, path)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, contents)
  },

  async delete(disk: Disk, path: string): Promise<void> {
    try {
      await rm(absolute(disk, path), { force: true })
    } catch {
      // Missing files or unsafe paths are simply ignored.
    }
  },

  url(disk: Disk, path: string): string {
    const prefix = disk === 'uploads' ? 'uploads' : 'storage'
    return `${env().APP_URL}/${prefix}/${path.replace(/^\/+/, '')}`
  },

  path: absolute,
}

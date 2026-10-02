import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import request, { type Response, type Test } from 'supertest'
import { expect, vi } from 'vitest'
import { createApp } from '../src/app.js'
import { paths } from '../src/lib/paths.js'
import type { User } from '../src/generated/prisma/client.js'
import { signed } from '../src/lib/crypt.js'
import { prisma } from '../src/lib/prisma.js'
import { random } from '../src/lib/str.js'

export const app = createApp()

export const STOREFRONT = 'http://localhost:3000'
export const DASHBOARD = 'http://localhost:5173'

export type FakeFile = { buffer: Buffer; filename: string; contentType?: string }
type Files = Record<string, FakeFile | FakeFile[]>

/** A browser-like client: keeps cookies and sends the XSRF header for stateful (storefront/dashboard) requests. */
export class Client {
  cookies = new Map<string, string>()
  headers: Record<string, string> = { Accept: 'application/json' }
  csrf = true

  fromStorefront(): this {
    this.headers.Origin = STOREFRONT
    return this
  }

  fromDashboard(): this {
    this.headers.Origin = DASHBOARD
    return this
  }

  withHeaders(headers: Record<string, string>): this {
    Object.assign(this.headers, headers)
    return this
  }

  withoutCsrf(): this {
    this.csrf = false
    return this
  }

  /** Logs the user in with a real session row, like Sanctum::actingAs(). */
  async actingAs(user: User): Promise<this> {
    this.headers.Origin ??= STOREFRONT
    const id = random(40)
    const csrf = random(40)
    await prisma.session.create({
      data: {
        id,
        user_id: user.id,
        payload: Buffer.from(JSON.stringify({ csrf, userId: String(user.id) })).toString('base64'),
        last_activity: Math.floor(Date.now() / 1000),
      },
    })
    this.cookies.set(process.env.SESSION_COOKIE ?? 'mangrove_session', encodeURIComponent(signed(id)))
    this.cookies.set('XSRF-TOKEN', csrf)
    return this
  }

  get(url: string) {
    return this.send('get', url)
  }

  post(url: string, body?: unknown, files?: Files) {
    return this.send('post', url, body, files)
  }

  put(url: string, body?: unknown, files?: Files) {
    return this.send('put', url, body, files)
  }

  patch(url: string, body?: unknown, files?: Files) {
    return this.send('patch', url, body, files)
  }

  delete(url: string, body?: unknown) {
    return this.send('delete', url, body)
  }

  async send(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, body?: unknown, files?: Files): Promise<Response> {
    if (method !== 'get' && this.csrf && this.headers.Origin && !this.cookies.has('XSRF-TOKEN')) {
      await this.send('get', '/sanctum/csrf-cookie')
    }

    let test: Test = request(app)[method](url)
    for (const [name, value] of Object.entries(this.headers)) test = test.set(name, value)
    if (this.cookies.size) test = test.set('Cookie', [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; '))
    if (method !== 'get' && this.csrf && this.cookies.has('XSRF-TOKEN')) {
      test = test.set('X-XSRF-TOKEN', decodeURIComponent(this.cookies.get('XSRF-TOKEN')!))
    }

    if (files) {
      for (const [key, value] of flatten(body ?? {})) test = test.field(key, value)
      for (const [key, value] of Object.entries(files)) {
        const list = Array.isArray(value) ? value : [value]
        for (const file of list) test = test.attach(key, file.buffer, { filename: file.filename, contentType: file.contentType })
      }
    } else if (body !== undefined) {
      test = test.send(body as object)
    }

    const res = await test
    this.capture(res)
    return res
  }

  private capture(res: Response): void {
    const header = res.headers['set-cookie'] as unknown as string[] | undefined
    for (const cookie of header ?? []) {
      const [pair, ...attributes] = cookie.split(';')
      const index = pair.indexOf('=')
      const name = pair.slice(0, index).trim()
      const value = pair.slice(index + 1).trim()
      const expired = attributes.some((attribute) => {
        const [key, val] = attribute.trim().split('=')
        return key.toLowerCase() === 'expires' && new Date(val).getTime() <= Date.now()
      })
      if (expired || value === '') this.cookies.delete(name)
      else this.cookies.set(name, value)
    }
  }
}

/** `{ a: { b: [1] } }` → `[['a[b][0]', '1']]`, the way browsers encode nested form fields. */
export function flatten(value: unknown, prefix = ''): [string, string][] {
  if (value === null || value === undefined) return prefix ? [[prefix, '']] : []
  if (typeof value === 'boolean') return [[prefix, value ? '1' : '0']]
  if (typeof value !== 'object') return [[prefix, String(value)]]
  return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => flatten(item, prefix ? `${prefix}[${key}]` : key))
}

export const client = () => new Client()
export const storefront = () => new Client().fromStorefront()
export const dashboard = () => new Client().fromDashboard()
export const actingAs = (user: User, origin = STOREFRONT) => new Client().withHeaders({ Origin: origin }).actingAs(user)

/** UploadedFile::fake()->image(): a real, decodable image. */
export async function fakeImage(filename: string, width = 10, height = 10): Promise<FakeFile> {
  const extension = filename.split('.').pop()!.toLowerCase()
  const base = sharp({ create: { width, height, channels: 3, background: { r: 30, g: 120, b: 60 } } })
  const format = extension === 'png' ? 'png' : extension === 'webp' ? 'webp' : extension === 'gif' ? 'gif' : 'jpeg'
  const buffer = await base.toFormat(format).toBuffer()
  return { buffer, filename, contentType: `image/${format}` }
}

/** UploadedFile::fake()->create(): arbitrary bytes. */
export function fakeFile(filename: string, kilobytes = 1, contentType = 'application/octet-stream', content?: string | Buffer): FakeFile {
  const buffer = content === undefined ? Buffer.alloc(kilobytes * 1024, 'a') : Buffer.from(content)
  return { buffer, filename, contentType }
}

/** assertJsonValidationErrors(): 422 and every key present. */
export function expectErrors(res: Response, keys: string | string[]): void {
  expect(res.status, JSON.stringify(res.body)).toBe(422)
  for (const key of [keys].flat()) expect(res.body.errors ?? {}, `missing error for ${key}: ${JSON.stringify(res.body)}`).toHaveProperty([key])
}

/** assertJsonMissingValidationErrors(). */
export function expectNoErrors(res: Response, keys: string | string[]): void {
  for (const key of [keys].flat()) expect(res.body.errors ?? {}).not.toHaveProperty([key])
}

export function expectStatus(res: Response, status: number): void {
  expect(res.status, JSON.stringify(res.body).slice(0, 2000)).toBe(status)
}

/** Http::fake(): records outgoing fetch() calls (e.g. the SMS gateway) and answers with `status`. */
export function fakeHttp(status = 200) {
  const sent: { url: string; body: URLSearchParams }[] = []
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    sent.push({ url: String(input), body: new URLSearchParams(typeof init?.body === 'string' || init?.body instanceof URLSearchParams ? init.body : '') })
    return new Response(status < 400 ? 'ok' : 'down', { status })
  })
  return sent
}
/** Storage::disk(...)->allFiles(): forward-slash paths relative to the disk root. */
export function diskFiles(disk: 'uploads' | 'public'): string[] {
  const root = disk === 'uploads' ? paths.uploads : paths.publicStorage
  if (!existsSync(root)) return []
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(root.length + 1).replace(/\\/g, '/'))
}

export const diskHas = (disk: 'uploads' | 'public', path: string) => diskFiles(disk).includes(path)
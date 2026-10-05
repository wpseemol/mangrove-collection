import { API_URL } from '@/lib/config'
import { findUnsafeFields } from '@/lib/validation'
import { useAuthStore } from '@/stores/auth'

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]>

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }

  /** First validation message for a field, e.g. `error.field("login")`. */
  field(name: string): string | undefined {
    return this.errors[name]?.[0]
  }
}

type Query = Record<string, string | number | boolean | null | undefined>

type RequestOptions = Omit<RequestInit, 'body'> & {
  query?: Query
  body?: unknown
  /** Body fields that hold blog-post HTML (images, videos and alignment allowed) instead of basic formatting. */
  blogHtmlFields?: string[]
}

/** Laravel's CSRF cookie. Readable by JS (unlike the session cookie) so it can be echoed in a header. */
const XSRF_COOKIE = 'XSRF-TOKEN'
const CSRF_URL = `${new URL(API_URL).origin}/sanctum/csrf-cookie`
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function readCookie(name: string): string | null {
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

let csrfRequest: Promise<void> | null = null

/** Makes sure the XSRF-TOKEN cookie exists before a state-changing request. */
function ensureCsrfCookie(force = false): Promise<void> {
  if (!force && readCookie(XSRF_COOKIE)) return Promise.resolve()

  csrfRequest ??= fetch(CSRF_URL, { credentials: 'include', headers: { Accept: 'application/json' } })
    .then(() => undefined)
    .finally(() => {
      csrfRequest = null
    })

  return csrfRequest
}

export async function api<T>(path: string, { query, body, headers, blogHtmlFields, ...init }: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`)

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  const unsafe = body === undefined ? {} : findUnsafeFields(body, undefined, new Set(blogHtmlFields))
  if (Object.keys(unsafe).length) {
    throw new ApiError('Please remove HTML, script or code from the highlighted fields.', 422, unsafe)
  }

  const isFormData = body instanceof FormData
  const mutating = !SAFE_METHODS.has((init.method ?? 'GET').toUpperCase())

  const send = async () => {
    if (mutating) await ensureCsrfCookie()
    const xsrf = mutating ? readCookie(XSRF_COOKIE) : null

    return fetch(url, {
      ...init,
      // Sends the HttpOnly session cookie; CORS on the API only allows our own origins.
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    })
  }

  let response = await send()

  // 419 = CSRF token expired (e.g. the session timed out): refresh it and retry once.
  if (response.status === 419 && mutating) {
    await ensureCsrfCookie(true)
    response = await send()
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().clear()
    }

    throw new ApiError(payload.message ?? 'Something went wrong. Please try again.', response.status, payload.errors)
  }

  return payload as T
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

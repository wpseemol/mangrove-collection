import { settings } from './settings.js'

export type GoogleUser = { id: string; name: string | null; email: string | null; avatar: string | null; emailVerified: boolean }

type GoogleClient = {
  userFromToken(accessToken: string): Promise<GoogleUser>
  userFromCode(code: string): Promise<GoogleUser>
}

async function credentials() {
  const [clientId, clientSecret, redirectUri] = await Promise.all([
    settings.get<string | null>('google_client_id'),
    settings.get<string | null>('google_client_secret'),
    settings.get<string | null>('google_redirect_uri'),
  ])
  return { clientId: clientId ?? '', clientSecret: clientSecret ?? '', redirectUri: redirectUri ?? '' }
}

/**
 * An access token minted for any other Google app would also unlock /userinfo, so a site the
 * user signed in to could replay it here and log in as them. Only tokens issued to our client are accepted.
 */
async function assertIssuedToUs(accessToken: string): Promise<void> {
  const { clientId } = await credentials()
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?${new URLSearchParams({ access_token: accessToken })}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`Google tokeninfo responded with HTTP ${response.status}`)

  const data = (await response.json()) as Record<string, unknown>
  if (!clientId || (data.aud !== clientId && data.azp !== clientId)) throw new Error('Google access token was issued to a different client')
}

const httpClient: GoogleClient = {
  async userFromToken(accessToken) {
    await assertIssuedToUs(accessToken)

    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) throw new Error(`Google userinfo responded with HTTP ${response.status}`)

    const data = (await response.json()) as Record<string, unknown>
    if (typeof data.sub !== 'string') throw new Error('Google userinfo did not return an id')

    return {
      id: data.sub,
      name: typeof data.name === 'string' ? data.name : null,
      email: typeof data.email === 'string' ? data.email : null,
      avatar: typeof data.picture === 'string' ? data.picture : null,
      emailVerified: data.email_verified === true || data.email_verified === 'true',
    }
  },

  async userFromCode(code) {
    const { clientId, clientSecret, redirectUri } = await credentials()
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri }),
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) throw new Error(`Google token endpoint responded with HTTP ${response.status}`)

    const data = (await response.json()) as { access_token?: string }
    if (!data.access_token) throw new Error('Google did not return an access token')
    return this.userFromToken(data.access_token)
  },
}

let client: GoogleClient = httpClient

export const google = {
  /** Replaces the HTTP client (tests). Pass nothing to restore the real one. */
  fake(fake?: Partial<GoogleClient>): void {
    client = fake ? { ...httpClient, ...fake } : httpClient
  },

  userFromToken: (token: string) => client.userFromToken(token),
  userFromCode: (code: string) => client.userFromCode(code),

  async redirectUrl(): Promise<string> {
    const { clientId, redirectUri } = await credentials()
    const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, scope: 'openid profile email', response_type: 'code' })
    return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`
  },

  async configured(requireRedirect = false): Promise<boolean> {
    return (
      Boolean(await settings.get('google_login_enabled')) &&
      (await settings.filled('google_client_id')) &&
      (await settings.filled('google_client_secret')) &&
      (!requireRedirect || (await settings.filled('google_redirect_uri')))
    )
  },
}

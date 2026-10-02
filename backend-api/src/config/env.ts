import { z } from 'zod'

const list = (fallback: string) =>
  z
    .string()
    .default(fallback)
    .transform((value) =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    )

const flag = (fallback: boolean) =>
  z
    .string()
    .optional()
    .transform((value) => (value === undefined || value === '' || value === 'null' ? fallback : ['1', 'true', 'on', 'yes'].includes(value.toLowerCase())))

const schema = z.object({
  APP_NAME: z.string().default('Mangrove Collection API'),
  APP_ENV: z.string().default('production'),
  APP_DEBUG: flag(false),
  APP_KEY: z.string().min(1, 'APP_KEY is required (base64:...)'),
  APP_URL: z
    .string()
    .default('http://localhost:8080')
    .transform((value) => value.replace(/\/+$/, '')),
  PORT: z.coerce.number().int().default(8080),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(31).default(12),
  LOG_LEVEL: z.string().default('info'),

  SESSION_COOKIE: z.string().default('mangrove_session'),
  SESSION_LIFETIME: z.coerce.number().int().positive().default(120),
  AUTH_REMEMBER_MINUTES: z.coerce.number().int().positive().default(60 * 24 * 30),
  SESSION_SECURE_COOKIE: flag(false),
  SESSION_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  SESSION_DOMAIN: z
    .string()
    .optional()
    .transform((value) => (value && value !== 'null' ? value : undefined)),
  STATEFUL_DOMAINS: z.string().optional(),
  SANCTUM_STATEFUL_DOMAINS: z.string().optional(),
  CORS_ALLOWED_ORIGINS: list('http://localhost:3000,http://localhost:5173'),

  MAIL_MAILER: z.string().default('log'),
  MAIL_HOST: z.string().default('127.0.0.1'),
  MAIL_PORT: z.coerce.number().int().default(2525),
  MAIL_USERNAME: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM_ADDRESS: z.string().default('hello@example.com'),
  MAIL_FROM_NAME: z.string().default('Mangrove Collection'),

  ADMIN_EMAIL: z.string().default('admin@mangrove-collection.com'),
  ADMIN_PASSWORD: z.string().optional(),
})

export type Env = z.infer<typeof schema> & {
  statefulDomains: string[]
  appKey: Buffer
  isProduction: boolean
  isTesting: boolean
}

function nullish(value: string | undefined): string | undefined {
  return value === undefined || value === '' || value === 'null' ? undefined : value
}

let cached: Env | undefined

export function env(): Env {
  if (cached) return cached

  // Node's --env-file does not expand `${OTHER}` references the way Laravel's dotenv did.
  const expand = (value: string | undefined) => value?.replace(/\$\{(\w+)\}/g, (_, name: string) => process.env[name] ?? '')
  const raw = Object.fromEntries(Object.entries(process.env).map(([key, value]) => [key, nullish(expand(value))]))
  const parsed = schema.parse(raw)
  const key = parsed.APP_KEY.startsWith('base64:') ? Buffer.from(parsed.APP_KEY.slice(7), 'base64') : Buffer.from(parsed.APP_KEY, 'utf8')

  if (key.length !== 32) throw new Error('APP_KEY must be a 32-byte key (base64:...)')

  const stateful = parsed.STATEFUL_DOMAINS ?? parsed.SANCTUM_STATEFUL_DOMAINS ?? 'localhost:3000,localhost:5173,127.0.0.1:3000,127.0.0.1:5173'

  cached = {
    ...parsed,
    statefulDomains: stateful
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
    appKey: key,
    isProduction: parsed.APP_ENV === 'production',
    isTesting: parsed.APP_ENV === 'testing',
  }

  return cached
}

export function resetEnvCache(): void {
  cached = undefined
}

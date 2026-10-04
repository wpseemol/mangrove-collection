import { decryptString, encryptString } from '../lib/crypt.js'
import { prisma } from '../lib/prisma.js'
import { isWhatsAppNumber, WHATSAPP_MESSAGE } from '../validation/rules.js'
import { bool, email, int, num, opt, phone, safeText, url, z } from '../validation/index.js'

export type SettingType = 'string' | 'text' | 'boolean' | 'integer' | 'float' | 'json' | 'email' | 'url' | 'phone'

type Definition = {
  type: SettingType
  public?: boolean
  encrypted?: boolean
  /** Intentionally holds markup/scripts (admin-only), so SafeText is skipped. */
  raw?: boolean
  default?: unknown
  options?: string[]
  min?: number
  max?: number
  /** Allowed keys of a json object. */
  keys?: string[]
  whatsapp?: boolean
}

export type SettingDefinition = Required<Pick<Definition, 'type'>> & {
  group: string
  public: boolean
  encrypted: boolean
  raw: boolean
  default: unknown
  options: string[] | null
  min?: number
  max?: number
  keys?: string[]
  whatsapp?: boolean
}

export const SOCIAL_NETWORKS = ['facebook', 'instagram', 'youtube', 'linkedin', 'twitter']

/** The single source of truth for every runtime-configurable setting. Keys not declared here are rejected on update. */
const GROUPS: Record<string, Record<string, Definition>> = {
  general: {
    site_name: { type: 'string', public: true, default: 'Mangrove Collection', max: 100 },
    site_tagline: { type: 'string', public: true, max: 160 },
    site_logo: { type: 'url', public: true },
    site_favicon: { type: 'url', public: true },
    contact_email: { type: 'email', public: true },
    contact_phone: { type: 'phone', public: true },
    contact_address: { type: 'text', public: true, max: 500 },
    social_links: { type: 'json', public: true, default: [], keys: SOCIAL_NETWORKS },
    storefront_url: { type: 'url', public: true, default: 'https://mangrove-collection.com' },
    dashboard_url: { type: 'url', public: false, default: 'https://dashboard.mangrove-collection.com' },
  },
  // Floating chat button shown on every storefront page, plus the contact page and footer links.
  whatsapp: {
    whatsapp_number: { type: 'phone', public: true, whatsapp: true },
    whatsapp_message: { type: 'text', public: true, default: 'Hello Mangrove Collection! I would like to know more about your products.', max: 500 },
    whatsapp_button_enabled: { type: 'boolean', public: true, default: true },
    whatsapp_button_position: { type: 'string', public: true, default: 'right', options: ['right', 'left'] },
  },
  commerce: {
    currency: { type: 'string', public: true, default: 'BDT', max: 10 },
    currency_symbol: { type: 'string', public: true, default: '৳', max: 5 },
    // bKash / Nagad / Rocket accounts live in the payment_accounts table.
    cod_enabled: { type: 'boolean', public: true, default: true },
    free_shipping_threshold: { type: 'float', public: true, min: 0, max: 10_000_000 },
    low_stock_threshold: { type: 'integer', public: false, default: 5, min: 0, max: 100_000 },
    order_notification_email: { type: 'email', public: false },
  },
  // Customer sign-in methods. Staff can always use email and password, so the dashboard never locks itself out.
  login: {
    password_login_enabled: { type: 'boolean', public: true, default: true },
  },
  google: {
    google_login_enabled: { type: 'boolean', public: true, default: false },
    google_client_id: { type: 'string', public: true },
    google_client_secret: { type: 'string', encrypted: true },
    google_redirect_uri: { type: 'url', public: false },
  },
  mail: {
    mail_mailer: { type: 'string', default: 'log', options: ['smtp', 'log'] },
    mail_host: { type: 'string' },
    mail_port: { type: 'integer', default: 587, min: 1, max: 65535 },
    mail_username: { type: 'string' },
    mail_password: { type: 'string', encrypted: true },
    mail_encryption: { type: 'string', default: 'tls', options: ['tls', 'ssl', 'none'] },
    mail_from_address: { type: 'email' },
    mail_from_name: { type: 'string', default: 'Mangrove Collection' },
  },
  sms: {
    sms_enabled: { type: 'boolean', default: false },
    sms_driver: { type: 'string', default: 'log', options: ['http', 'log'] },
    sms_api_url: { type: 'url' },
    sms_api_key: { type: 'string', encrypted: true },
    sms_sender_id: { type: 'string' },
    sms_order_placed_template: {
      type: 'text',
      default: 'Dear {name}, your order {order_number} of {currency} {total} has been placed. Thank you for shopping with Mangrove Collection.',
    },
    sms_order_status_template: { type: 'text', default: 'Dear {name}, your order {order_number} is now {status}. - Mangrove Collection' },
    sms_payment_verified_template: {
      type: 'text',
      default: 'Dear {name}, we received your {method} payment of {currency} {amount} for order {order_number}. Thank you! - Mangrove Collection',
    },
    sms_payment_rejected_template: {
      type: 'text',
      default: 'Dear {name}, we could not verify your {method} payment for order {order_number}: {reason}. Please submit the correct transaction ID. - Mangrove Collection',
    },
  },
  seo: {
    meta_title: { type: 'string', public: true, default: 'Mangrove Collection', max: 255 },
    meta_description: { type: 'text', public: true, max: 500 },
    meta_keywords: { type: 'text', public: true, max: 500 },
    og_image: { type: 'url', public: true },
    google_site_verification: { type: 'string', public: true },
    google_analytics_id: { type: 'string', public: true },
    google_tag_manager_id: { type: 'string', public: true },
    facebook_pixel_id: { type: 'string', public: true },
    custom_head_script: { type: 'text', public: true, raw: true },
    custom_body_script: { type: 'text', public: true, raw: true },
  },
}

const REGISTRY: Record<string, SettingDefinition> = Object.fromEntries(
  Object.entries(GROUPS).flatMap(([group, definitions]) =>
    Object.entries(definitions).map(([key, d]) => [
      key,
      {
        ...d,
        group,
        public: d.public ?? false,
        encrypted: d.encrypted ?? false,
        raw: d.raw ?? false,
        default: d.default ?? null,
        options: d.options ?? null,
      } satisfies SettingDefinition,
    ]),
  ),
)

export const settingRegistry = {
  all: () => REGISTRY,
  has: (key: string) => Object.hasOwn(REGISTRY, key),
  secretKeys: () => Object.keys(REGISTRY).filter((key) => REGISTRY[key].encrypted),
  get: (key: string): SettingDefinition | null => REGISTRY[key] ?? null,
}

/** Validation schema for one setting value (always nullable). */
export function settingSchema(key: string): z.ZodType {
  const d = REGISTRY[key]
  const cap = (fallback: number) => Math.min(d.max ?? fallback, fallback)
  let schema: z.ZodType

  switch (d.type) {
    case 'boolean':
      schema = bool()
      break
    case 'integer':
      schema = int(d.min, d.max)
      break
    case 'float':
      schema = num(d.min, d.max)
      break
    case 'json': {
      const item = opt(url(2048))
      schema = z
        .union([z.array(z.unknown()).max(50), z.record(z.string(), z.unknown())], { error: 'The :attribute field must be an array.' })
        .refine((value) => Array.isArray(value) || Object.keys(value).length <= 50, 'The :attribute field must not have more than 50 items.')
        .refine(
          (value) => !d.keys || (!Array.isArray(value) && Object.keys(value).every((k) => d.keys!.includes(k))) || (Array.isArray(value) && value.length === 0),
          'The :attribute field must be an array.',
        )
        .superRefine((value, ctx) => {
          if (!d.keys || Array.isArray(value)) return
          for (const [k, v] of Object.entries(value)) {
            const result = item.safeParse(v)
            if (!result.success) for (const issue of result.error.issues) ctx.addIssue({ code: 'custom', path: [k], message: issue.message })
          }
        })
      break
    }
    case 'email':
      schema = email(255)
      break
    case 'url':
      schema = url(2048)
      break
    case 'phone':
      schema = d.whatsapp ? phone(32).refine((value) => isWhatsAppNumber(value), WHATSAPP_MESSAGE) : phone(32)
      break
    case 'text':
      schema = z.string().max(cap(65000))
      break
    default:
      schema = z.string().max(cap(2048))
  }

  if (['string', 'text', 'json'].includes(d.type) && !d.encrypted && !d.raw) schema = safeText(schema)
  if (d.options) {
    const options = d.options
    schema = schema.refine((value) => options.includes(String(value)), 'The selected :attribute is invalid.')
  }

  return opt(schema)
}

export const SECRET_MASK = '********'
const CACHE_TTL_MS = 30_000

let rows: Map<string, string | null> | null = null
let loadedAt = 0

async function loadRows(): Promise<Map<string, string | null>> {
  if (rows && Date.now() - loadedAt < CACHE_TTL_MS) return rows
  const records = await prisma.setting.findMany({ select: { key: true, value: true } })
  rows = new Map(records.map((record) => [record.key, record.value]))
  loadedAt = Date.now()
  return rows
}

function cast(raw: string, type: SettingType): unknown {
  switch (type) {
    case 'boolean':
      return ['1', 'true', 'on', 'yes'].includes(raw.trim().toLowerCase())
    case 'integer':
      return Number.parseInt(raw, 10) || 0
    case 'float':
      return Number.parseFloat(raw) || 0
    case 'json':
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    default:
      return raw
  }
}

function serialize(value: unknown, d: SettingDefinition): string | null {
  if (value === null || value === undefined || value === '') return null

  const string = d.type === 'boolean' ? (value ? '1' : '0') : d.type === 'json' ? JSON.stringify(value) : String(value)

  return d.encrypted ? encryptString(string) : string
}

const filledValue = (value: unknown) =>
  !(value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0))

export const settings = {
  async get<T = unknown>(key: string, fallback: T | null = null): Promise<T> {
    const d = REGISTRY[key]
    if (!d) return fallback as T

    const all = await loadRows()
    const raw = all.get(key)
    if (raw === undefined || raw === null) return (d.default ?? fallback) as T

    let value = raw
    if (d.encrypted) {
      try {
        value = decryptString(raw)
      } catch {
        return fallback as T
      }
    }

    return cast(value, d.type) as T
  },

  /** Decrypted value of a secret for an admin who re-entered their password; null when nothing is saved. */
  async reveal(key: string): Promise<string | null> {
    const value = await this.get<unknown>(key)
    return filledValue(value) ? String(value) : null
  },

  async filled(key: string): Promise<boolean> {
    return filledValue(await this.get(key))
  },

  async many(keys: string[]): Promise<Record<string, unknown>> {
    const entries = await Promise.all(keys.map(async (key) => [key, await this.get(key)] as const))
    return Object.fromEntries(entries)
  },

  async public(): Promise<Record<string, unknown>> {
    return this.many(Object.keys(REGISTRY).filter((key) => REGISTRY[key].public))
  },

  /** Grouped settings for the admin dashboard; secrets are masked. */
  async forAdmin(): Promise<Record<string, Record<string, unknown>>> {
    const grouped: Record<string, Record<string, unknown>> = {}

    for (const [key, d] of Object.entries(REGISTRY)) {
      let value = await this.get(key)
      if (d.encrypted) value = filledValue(value) ? SECRET_MASK : null
      ;(grouped[d.group] ??= {})[key] = { value, type: d.type, public: d.public, secret: d.encrypted, options: d.options }
    }

    return grouped
  },

  async update(values: Record<string, unknown>): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(values)) {
        const d = REGISTRY[key]
        if (!d) continue
        // The dashboard echoes the mask back for untouched secrets.
        if (d.encrypted && value === SECRET_MASK) continue

        const data = { group: d.group, type: d.type, is_public: d.public, is_encrypted: d.encrypted, value: serialize(value, d) }
        await tx.setting.upsert({ where: { key }, create: { key, ...data }, update: data })
      }
    })

    this.flush()
  },

  /** Inserts any registry keys missing from the table without touching existing values. */
  async syncDefaults(): Promise<void> {
    const existing = new Set((await prisma.setting.findMany({ select: { key: true } })).map((row) => row.key))

    for (const [key, d] of Object.entries(REGISTRY)) {
      if (existing.has(key)) continue
      await prisma.setting.create({
        data: { key, group: d.group, type: d.type, is_public: d.public, is_encrypted: d.encrypted, value: serialize(d.default, d) },
      })
    }

    this.flush()
  },

  flush(): void {
    rows = null
    loadedAt = 0
  },
}

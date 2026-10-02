import { env } from '../config/env.js'
import { log } from '../lib/log.js'
import { settings } from './settings.js'

/** Every SMS "sent" while testing. */
export const smsOutbox: { to: string; message: string }[] = []

export const sms = {
  async enabled(): Promise<boolean> {
    return Boolean(await settings.get('sms_enabled'))
  },

  /**
   * Sends through the configured gateway. The `http` driver posts form fields
   * `api_key`, `senderid`, `number` and `message` (BulkSMSBD-compatible).
   */
  async send(phone: string, message: string): Promise<void> {
    if ((await settings.get('sms_driver')) !== 'http') {
      if (env().isTesting) smsOutbox.push({ to: phone, message })
      else log.info('SMS (log driver)', { to: phone, message })
      return
    }

    const [url, apiKey, senderId] = await Promise.all([settings.get<string | null>('sms_api_url'), settings.get<string | null>('sms_api_key'), settings.get<string | null>('sms_sender_id')])

    if (!url || !apiKey) throw new Error('SMS gateway URL or API key is not configured.')

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({ api_key: apiKey, senderid: senderId ?? '', number: phone, message }),
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) throw new Error(`SMS gateway responded with HTTP ${response.status}.`)
  },

  async render(templateKey: string, replacements: Record<string, string | number | null | undefined>): Promise<string> {
    const template = String((await settings.get(templateKey, '')) ?? '')
    return template.replace(/\{(\w+)\}/g, (match, key: string) => (Object.hasOwn(replacements, key) ? String(replacements[key] ?? '') : match))
  },
}

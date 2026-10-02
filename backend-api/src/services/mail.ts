import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js'
import { env } from '../config/env.js'
import { log } from '../lib/log.js'
import { settings } from './settings.js'

/** A simple notification mail, laid out like Laravel's MailMessage. */
export type MailMessage = {
  subject: string
  greeting?: string
  introLines: string[]
  action?: { text: string; url: string }
  outroLines?: string[]
  salutation?: string
}

export type SentMail = MailMessage & { to: string }

/** Every sent message, kept in memory while testing so tests can assert on them. */
export const outbox: SentMail[] = []

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
const bold = (value: string) => escapeHtml(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

function renderText(message: MailMessage, appName: string): string {
  return [
    message.greeting ?? 'Hello!',
    '',
    ...message.introLines,
    ...(message.action ? ['', `${message.action.text}: ${message.action.url}`, ''] : []),
    ...(message.outroLines ?? []),
    '',
    message.salutation ?? `Regards,\n${appName}`,
  ].join('\n')
}

function renderHtml(message: MailMessage, appName: string): string {
  const paragraphs = (lines: string[]) => lines.map((line) => `<p style="margin:0 0 12px;line-height:1.5">${bold(line)}</p>`).join('')
  const action = message.action
    ? `<p style="margin:24px 0;text-align:center"><a href="${escapeHtml(message.action.url)}" style="background:#166534;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">${escapeHtml(message.action.text)}</a></p>`
    : ''

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
<h1 style="font-size:18px;margin:0 0 16px">${escapeHtml(message.greeting ?? 'Hello!')}</h1>
${paragraphs(message.introLines)}${action}${paragraphs(message.outroLines ?? [])}
<p style="margin:24px 0 0;white-space:pre-line">${escapeHtml(message.salutation ?? `Regards,\n${appName}`)}</p>
</div></body></html>`
}

/** SMTP settings from the dashboard win; otherwise the MAIL_* environment, otherwise the log mailer. */
export async function mailTransport(): Promise<{ kind: 'smtp'; options: SMTPTransport.Options } | { kind: 'log' }> {
  const [mailer, host] = await Promise.all([settings.get<string>('mail_mailer'), settings.get<string | null>('mail_host')])

  if (mailer === 'smtp' && host) {
    const encryption = await settings.get<string>('mail_encryption')
    const [port, username, password] = await Promise.all([settings.get<number>('mail_port'), settings.get<string | null>('mail_username'), settings.get<string | null>('mail_password')])

    return {
      kind: 'smtp',
      options: {
        host,
        port,
        secure: encryption === 'ssl',
        requireTLS: encryption === 'tls',
        auth: username ? { user: username, pass: password ?? '' } : undefined,
        connectionTimeout: 15_000,
      },
    }
  }

  const config = env()
  if (mailer !== 'log' && config.MAIL_MAILER === 'smtp') {
    return {
      kind: 'smtp',
      options: {
        host: config.MAIL_HOST,
        port: config.MAIL_PORT,
        auth: config.MAIL_USERNAME ? { user: config.MAIL_USERNAME, pass: config.MAIL_PASSWORD ?? '' } : undefined,
      },
    }
  }

  return { kind: 'log' }
}

export async function mailFrom(): Promise<{ name: string; address: string }> {
  const address = await settings.get<string | null>('mail_from_address')
  if (address) return { address, name: (await settings.get<string | null>('mail_from_name')) ?? env().MAIL_FROM_NAME }
  return { address: env().MAIL_FROM_ADDRESS, name: env().MAIL_FROM_NAME }
}

export async function sendMail(to: string, message: MailMessage): Promise<void> {
  const appName = ((await settings.get<string>('site_name')) || 'Mangrove Collection').trim()

  if (env().isTesting) {
    outbox.push({ ...message, to })
    return
  }

  const target = await mailTransport()
  const text = renderText(message, appName)

  if (target.kind === 'log') {
    log.info('Mail (log mailer)', { to, subject: message.subject, text })
    return
  }

  const sender = await mailFrom()
  await nodemailer.createTransport(target.options).sendMail({
    from: { name: sender.name, address: sender.address },
    to,
    subject: message.subject,
    text,
    html: renderHtml(message, appName),
  })
}

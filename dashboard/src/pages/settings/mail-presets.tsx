import { Sparkles } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { DraftValue } from './draft'

type Preset = { id: string; label: string; host: string; port: string; encryption: 'tls' | 'ssl'; note: string }

const PRESETS: Preset[] = [
  { id: 'gmail', label: 'Gmail / Google Workspace', host: 'smtp.gmail.com', port: '587', encryption: 'tls', note: 'Use your full Gmail address as the username and an App Password (Google Account → Security → App passwords) as the password.' },
  { id: 'outlook', label: 'Outlook / Microsoft 365', host: 'smtp.office365.com', port: '587', encryption: 'tls', note: 'Use your full Microsoft 365 email and password. SMTP AUTH must be enabled for the mailbox.' },
  { id: 'zoho', label: 'Zoho Mail', host: 'smtp.zoho.com', port: '465', encryption: 'ssl', note: 'Use your Zoho email and an app-specific password. Accounts in India use smtp.zoho.in.' },
  { id: 'brevo', label: 'Brevo (Sendinblue)', host: 'smtp-relay.brevo.com', port: '587', encryption: 'tls', note: 'Username is your Brevo login email; the password is the SMTP key from SMTP & API settings.' },
  { id: 'sendgrid', label: 'SendGrid', host: 'smtp.sendgrid.net', port: '587', encryption: 'tls', note: 'Username is literally "apikey"; the password is your SendGrid API key.' },
  { id: 'mailgun', label: 'Mailgun', host: 'smtp.mailgun.org', port: '587', encryption: 'tls', note: 'Use the SMTP credentials of your sending domain from the Mailgun dashboard.' },
  { id: 'ses', label: 'Amazon SES (Singapore)', host: 'email-smtp.ap-southeast-1.amazonaws.com', port: '587', encryption: 'tls', note: 'Create SMTP credentials in the SES console. Change the region in the host if yours differs.' },
  { id: 'hosting', label: 'cPanel / hosting email', host: 'mail.your-domain.com', port: '465', encryption: 'ssl', note: 'Replace the host with your domain. Use the full mailbox address and its password.' },
]

/** Fills host, port and encryption for well-known providers; credentials are still typed by the admin. */
export function MailPresets({ onApply }: { onApply: (values: Record<string, DraftValue>) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4" /> Quick setup
        </CardTitle>
        <CardDescription>Choose your email provider to fill in the server details, then add the username, password and from address.</CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          onValueChange={(id) => {
            const preset = PRESETS.find((p) => p.id === id)
            if (!preset) return
            onApply({ mail_mailer: 'smtp', mail_host: preset.host, mail_port: preset.port, mail_encryption: preset.encryption })
          }}
        >
          <SelectTrigger className="w-full sm:w-80" aria-label="Email provider">
            <SelectValue placeholder="Choose a provider…" />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {PRESETS.slice(0, 2).map((preset) => (
            <li key={preset.id}>
              <span className="font-medium text-foreground">{preset.label}:</span> {preset.note}
            </li>
          ))}
          <li>Other providers show their SMTP details in the account's email or developer settings.</li>
        </ul>
      </CardContent>
    </Card>
  )
}

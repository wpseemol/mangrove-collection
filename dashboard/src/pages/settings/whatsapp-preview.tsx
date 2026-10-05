import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { Draft } from './draft'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.23-9.43 9.43-9.43a9.4 9.4 0 0 1 9.42 9.44c0 5.2-4.23 9.42-9.43 9.42m8.02-17.45A11.3 11.3 0 0 0 12.05.72C5.8.72.7 5.8.7 12.06c0 2 .52 3.95 1.52 5.67L.6 23.65l6.05-1.59a11.3 11.3 0 0 0 5.4 1.38h.01c6.25 0 11.34-5.09 11.35-11.34a11.3 11.3 0 0 0-3.33-8.05" />
    </svg>
  )
}

function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78a.8.8 0 0 0 1.12.71l1.99-.88c.17-.07.36-.09.53-.04.91.25 1.89.39 2.9.39 5.64 0 10-4.13 10-9.7S17.64 2 12 2m6 7.46-2.94 4.66a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.66a1.5 1.5 0 0 1 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63" />
    </svg>
  )
}

function whatsappLink(number: string, message: string): string {
  const text = message.trim()
  return `https://wa.me/${number.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

/** Mock storefront page showing where the button sits and what tapping it opens. Updates as the form changes. */
export function WhatsAppPreview({ draft, valid }: { draft: Draft; valid: boolean }) {
  const number = (draft.whatsapp_number as string).trim()
  const message = draft.whatsapp_message as string
  const enabled = draft.whatsapp_button_enabled as boolean
  const left = draft.whatsapp_button_position === 'left'
  const visible = enabled && Boolean(number)
  const messengerPage = String(draft.messenger_page ?? '').trim()
  const messengerVisible = Boolean(draft.messenger_button_enabled) && Boolean(messengerPage)

  return (
    <Card className="h-fit xl:sticky xl:top-20">
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>
          {visible || messengerVisible ? 'How the buttons look on the storefront.' : !enabled ? 'The WhatsApp button is turned off.' : 'Add a number to show the button.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-56 overflow-hidden rounded-lg border bg-muted/40">
          <div className="space-y-2 p-3">
            <div className="h-3 w-24 rounded bg-muted-foreground/20" />
            <div className="h-16 rounded bg-muted-foreground/10" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-14 rounded bg-muted-foreground/10" />
              ))}
            </div>
          </div>
          <span
            className={cn(
              'absolute bottom-3 flex size-11 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-all duration-300',
              left ? 'left-3' : 'right-3',
              !visible && 'scale-75 opacity-0',
            )}
          >
            <WhatsAppIcon className="size-6" />
          </span>
          <span
            className={cn(
              'absolute flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#00b2ff] to-[#a033ff] text-white shadow-lg transition-all duration-300',
              left ? 'left-3' : 'right-3',
              visible ? 'bottom-16' : 'bottom-3',
              !messengerVisible && 'scale-75 opacity-0',
            )}
          >
            <MessengerIcon className="size-6" />
          </span>
        </div>

        {messengerVisible && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <a href={`https://m.me/${encodeURIComponent(messengerPage)}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Test the Messenger link
            </a>
          </Button>
        )}

        {message.trim() && (
          <div className="rounded-lg bg-[#e7fcd9] p-3 text-sm text-[#111b21] shadow-sm dark:bg-[#005c4b] dark:text-white">
            <p className="text-[11px] font-medium text-[#008069] dark:text-[#7ae3c3]">Customer's first message</p>
            <p className="mt-1 break-words whitespace-pre-wrap">{message.trim()}</p>
          </div>
        )}

        <Button asChild variant="outline" size="sm" className="w-full" disabled={!number || !valid}>
          <a
            href={number && valid ? whatsappLink(number, message) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!number || !valid}
            className={cn((!number || !valid) && 'pointer-events-none opacity-50')}
          >
            <ExternalLink /> Test the chat link
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, RotateCcw, Save } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError, api, errorMessage } from '@/lib/api'
import { settingsQueryKey } from '@/lib/queries'
import type { AdminSettings, SettingMeta } from '@/lib/types'
import { cn } from '@/lib/utils'

import { changedPayload, toDraft, validateDraft, validateField, type Draft, type DraftValue, type Errors } from './draft'
import type { SectionDef } from './sections'
import { MailPresets } from './mail-presets'
import { SettingField } from './setting-field'
import { SignInStatus } from './sign-in-status'
import { TestDelivery } from './test-delivery'
import { WhatsAppPreview } from './whatsapp-preview'

/** `settings.social_links.facebook` -> `social_links.facebook` */
const serverErrors = (error: ApiError): Errors =>
  Object.fromEntries(Object.entries(error.errors).map(([key, messages]) => [key.replace(/^settings\./, ''), messages[0]]))

export function SectionForm({
  section,
  settings,
  onDirtyChange,
}: {
  section: SectionDef
  settings: Record<string, SettingMeta>
  onDirtyChange: (dirty: boolean) => void
}) {
  const queryClient = useQueryClient()
  const fields = useMemo(() => section.cards.flatMap((card) => card.fields), [section])
  const [initial, setInitial] = useState<Draft>(() => toDraft(fields, settings))
  const [draft, setDraft] = useState<Draft>(initial)
  const [errors, setErrors] = useState<Errors>({})

  const changes = useMemo(() => changedPayload(fields, draft, initial), [fields, draft, initial])
  const dirty = Object.keys(changes).length > 0

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange])

  const set = (key: string, value: DraftValue) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([k]) => k !== key && !k.startsWith(`${key}.`))))
  }

  const save = useMutation({
    mutationFn: () => api<{ message: string; data: AdminSettings }>('/admin/settings', { method: 'PUT', body: { settings: changes } }),
    onSuccess: ({ message, data }) => {
      queryClient.setQueryData(settingsQueryKey, data)
      const fresh = toDraft(fields, Object.assign({}, ...Object.values(data)))
      setInitial(fresh)
      setDraft(fresh)
      toast.success(message)
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 422 && Object.keys(e.errors).length) {
        setErrors(serverErrors(e))
        toast.error('Please fix the highlighted fields.')
      } else {
        toast.error(errorMessage(e))
      }
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateDraft(fields, draft)
    setErrors(found)
    if (Object.keys(found).length) {
      toast.error('Please fix the highlighted fields.')
      return
    }
    if (dirty) save.mutate()
  }

  const discard = () => {
    setDraft(initial)
    setErrors({})
  }

  const whatsappValid = section.extra === 'whatsapp-preview' && !Object.keys(validateField(fields.find((f) => f.key === 'whatsapp_number')!, draft.whatsapp_number)).length

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className={cn('grid gap-4', section.extra && 'xl:grid-cols-[minmax(0,1fr)_18rem]')}>
        <div className="grid min-w-0 content-start gap-4">
          {section.id === 'mail' && <MailPresets onApply={(values) => Object.entries(values).forEach(([key, value]) => set(key, value))} />}
          {section.cards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                {card.description && <CardDescription>{card.description}</CardDescription>}
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {card.fields.map((field) => (
                  <SettingField key={field.key} field={field} value={draft[field.key]} errors={errors} onChange={(value) => set(field.key, value)} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {section.extra === 'whatsapp-preview' && <WhatsAppPreview draft={draft} valid={whatsappValid} />}
        {section.extra === 'test-mail' && <TestDelivery channel="mail" />}
        {section.extra === 'test-sms' && <TestDelivery channel="sms" />}
        {section.extra === 'sign-in-status' && <SignInStatus draft={draft} />}
      </div>

      <div
        className={cn(
          'sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur transition-all supports-backdrop-filter:bg-background/80',
          !dirty && 'pointer-events-none translate-y-2 opacity-0',
        )}
        aria-hidden={!dirty}
      >
        <p className="text-sm text-muted-foreground">
          {Object.keys(changes).length === 1 ? '1 unsaved change' : `${Object.keys(changes).length} unsaved changes`}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={discard} disabled={save.isPending} tabIndex={dirty ? 0 : -1}>
            <RotateCcw /> Discard
          </Button>
          <Button type="submit" size="sm" disabled={save.isPending} tabIndex={dirty ? 0 : -1}>
            {save.isPending ? <Loader2 className="animate-spin" /> : <Save />} Save changes
          </Button>
        </div>
      </div>
    </form>
  )
}

import { RefreshCw, ServerCrash } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { errorMessage } from '@/lib/api'
import { useAdminSettings } from '@/lib/queries'
import type { SettingMeta } from '@/lib/types'

import { SECTIONS } from './sections'
import { SectionForm } from './section-form'

export function SettingsPage() {
  const { data, isPending, isError, error, refetch, isRefetching } = useAdminSettings()
  const [params, setParams] = useSearchParams()
  const [dirtyTabs, setDirtyTabs] = useState<Record<string, boolean>>({})

  const tab = SECTIONS.some((s) => s.id === params.get('tab')) ? params.get('tab')! : SECTIONS[0].id
  const active = SECTIONS.find((s) => s.id === tab)!
  const settings = useMemo<Record<string, SettingMeta>>(() => Object.assign({}, ...Object.values(data ?? {})), [data])
  const anyDirty = Object.values(dirtyTabs).some(Boolean)

  const markDirty = useCallback((id: string, dirty: boolean) => setDirtyTabs((d) => (d[id] === dirty ? d : { ...d, [id]: dirty })), [])

  useEffect(() => {
    if (!anyDirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [anyDirty])

  return (
    <>
      <PageHeader title="Settings" description="Everything customers see on the storefront that isn't a product, plus email, SMS and sign-in." />

      {isPending ? (
        <div className="grid gap-4 lg:grid-cols-[13rem_1fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-96" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border py-16 text-center">
          <ServerCrash className="size-8 text-muted-foreground" />
          <p className="font-medium">Couldn't load settings</p>
          <p className="text-sm text-muted-foreground">{errorMessage(error)}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={isRefetching ? 'animate-spin' : undefined} /> Try again
          </Button>
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={(value) => setParams(value === SECTIONS[0].id ? {} : { tab: value }, { replace: true })}
          orientation="vertical"
          className="gap-6 lg:flex-row"
        >
          <TabsList
            variant="line"
            className="w-full flex-row justify-start overflow-x-auto lg:sticky lg:top-20 lg:w-52 lg:shrink-0 lg:flex-col lg:items-stretch lg:self-start"
          >
            {SECTIONS.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="h-9 flex-none justify-start px-3 lg:w-full">
                <section.icon />
                {section.title}
                {dirtyTabs[section.id] && <span className="ml-auto size-1.5 rounded-full bg-primary" aria-label="Unsaved changes" />}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{active.title}</h2>
              <p className="text-sm text-muted-foreground">{active.description}</p>
            </div>
            {/* Every tab stays mounted, so switching tabs never throws away unsaved edits. */}
            {SECTIONS.map((section) => (
              <TabsContent key={section.id} value={section.id} forceMount className="data-[state=inactive]:hidden">
                <SectionForm section={section} settings={settings} onDirtyChange={(dirty) => markDirty(section.id, dirty)} />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      )}
    </>
  )
}

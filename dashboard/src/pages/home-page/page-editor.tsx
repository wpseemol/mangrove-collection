import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Loader2, RefreshCw, RotateCcw, Save, ServerCrash, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { SingleImageUpload } from '@/components/image-upload'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiError, api, errorMessage } from '@/lib/api'
import { pageQueryKey, useCmsPage } from '@/lib/queries'
import type { CmsPage } from '@/lib/types'
import { cn } from '@/lib/utils'

import { fromServerErrors, getIn, setIn, validateStrings, type Errors, type Seo } from './content-form'
import { TextField } from './fields'

export type EditorTab<Block> = { id: string; title: string; description: string; icon: LucideIcon; blocks: Block[] }

export type EditorTools<Draft> = {
  content: Draft
  errors: Errors
  update: (path: string, value: unknown) => void
  text: (path: string, label: string, props?: Partial<Parameters<typeof TextField>[0]>) => ReactNode
  image: (path: string, label: string, hint: string, aspect: string, className?: string) => ReactNode
}

type Config<Draft extends { seo: Seo }> = {
  slug: string
  /** e.g. "About page", used in the header, messages and the view button. */
  name: string
  defaultTitle: string
  description: string
  viewUrl: string
  tabs: EditorTab<keyof Draft & string>[]
  /** Block keys in the order they are saved, so `sections.N` server errors map back to fields. */
  blocks: readonly string[]
  toDraft: (page: CmsPage | null | undefined) => Draft
  toSections: (draft: Draft, page: CmsPage | null) => unknown[]
  validate?: (draft: Draft) => Errors
  children: (tools: EditorTools<Draft>) => ReactNode
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** A tabbed editor for a CMS page whose `sections` hold typed blocks. */
export function PageEditor<Draft extends { seo: Seo }>(config: Config<Draft>) {
  const page = useCmsPage(pageQueryKey(config.slug))

  return (
    <>
      <PageHeader
        title={config.name}
        description={config.description}
        actions={
          <Button variant="outline" asChild>
            <a href={config.viewUrl} target="_blank" rel="noreferrer">
              <ExternalLink /> View {config.name}
            </a>
          </Button>
        }
      />

      {page.isPending ? (
        <div className="grid gap-4 lg:grid-cols-[13rem_1fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-96" />
        </div>
      ) : page.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border py-16 text-center">
          <ServerCrash className="size-8 text-muted-foreground" />
          <p className="font-medium">Couldn't load the {config.name}</p>
          <p className="text-sm text-muted-foreground">{errorMessage(page.error)}</p>
          <Button variant="outline" size="sm" onClick={() => page.refetch()} disabled={page.isRefetching}>
            <RefreshCw className={page.isRefetching ? 'animate-spin' : undefined} /> Try again
          </Button>
        </div>
      ) : (
        <Editor config={config} page={page.data} />
      )}
    </>
  )
}

function Editor<Draft extends { seo: Seo }>({ config, page }: { config: Config<Draft>; page: CmsPage | null }) {
  const { tabs } = config
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [initial, setInitial] = useState<Draft>(() => config.toDraft(page))
  const [content, setContent] = useState<Draft>(initial)
  const [errors, setErrors] = useState<Errors>({})

  const tab = tabs.some((t) => t.id === params.get('tab')) ? params.get('tab')! : tabs[0].id
  const setTab = (id: string) => setParams(id === tabs[0].id ? {} : { tab: id }, { replace: true })
  const active = tabs.find((t) => t.id === tab)!
  const dirty = !same(content, initial)
  const blockOf = (key: string) => key.split('.')[0] as keyof Draft & string
  const tabDirty = (t: EditorTab<keyof Draft & string>) => t.blocks.some((block) => !same(content[block], initial[block]))
  const tabHasErrors = (t: EditorTab<keyof Draft & string>) => Object.keys(errors).some((key) => t.blocks.includes(blockOf(key)))

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const update = (path: string, value: unknown) => {
    setContent((current) => setIn(current, path, value))
    setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== path && !key.startsWith(`${path}.`))))
  }

  const tools: EditorTools<Draft> = {
    content,
    errors,
    update,
    text: (path, label, props = {}) => (
      <TextField path={path} label={label} value={String(getIn(content, path) ?? '')} error={errors[path]} onChange={(value) => update(path, value)} {...props} />
    ),
    image: (path, label, hint, aspect, className = 'max-w-sm') => (
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">
          {label} <span className="font-normal text-muted-foreground">· {hint}</span>
        </p>
        <SingleImageUpload
          value={String(getIn(content, path) ?? '')}
          onChange={(url) => update(path, url)}
          aspect={aspect}
          label={`Upload ${label.toLowerCase()}`}
          className={className}
        />
        {errors[path] && <p className="text-xs text-destructive">{errors[path]}</p>}
      </div>
    ),
  }

  const showErrors = (found: Errors) => {
    setErrors(found)
    const first = tabs.find((t) => t.blocks.includes(blockOf(Object.keys(found)[0] ?? '')))
    if (first && first.id !== tab) setTab(first.id)
    toast.error('Please fix the highlighted fields.')
  }

  const save = useMutation({
    mutationFn: () =>
      api<{ data: CmsPage }>(`/admin/pages/${config.slug}`, {
        method: 'PUT',
        body: {
          title: page?.title ?? config.defaultTitle,
          sections: config.toSections(content, page),
          meta_title: content.seo.meta_title.trim() || null,
          meta_description: content.seo.meta_description.trim() || null,
        },
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(pageQueryKey(config.slug), data)
      const fresh = config.toDraft(data)
      setInitial(fresh)
      setContent(fresh)
      toast.success(`${config.name} saved. Refresh the store to see it.`)
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 422 && Object.keys(e.errors).length) {
        showErrors(fromServerErrors(e.errors, config.blocks, (key) => (key.startsWith('meta_') ? `seo.${key}` : key)))
      } else {
        toast.error(errorMessage(e))
      }
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found = (config.validate ?? validateStrings)(content)
    if (Object.keys(found).length) return showErrors(found)
    setErrors({})
    if (dirty) save.mutate()
  }

  const discard = () => {
    setContent(initial)
    setErrors({})
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Tabs value={tab} onValueChange={setTab} orientation="vertical" className="gap-6 lg:flex-row">
        <TabsList
          variant="line"
          className="w-full flex-row justify-start overflow-x-auto lg:sticky lg:top-20 lg:w-52 lg:shrink-0 lg:flex-col lg:items-stretch lg:self-start"
        >
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="h-9 flex-none justify-start px-3 lg:w-full">
              <t.icon />
              {t.title}
              {tabHasErrors(t) ? (
                <span className="ml-auto size-1.5 rounded-full bg-destructive" aria-label="Has errors" />
              ) : (
                tabDirty(t) && <span className="ml-auto size-1.5 rounded-full bg-primary" aria-label="Unsaved changes" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{active.title}</h2>
            <p className="text-sm text-muted-foreground">{active.description}</p>
          </div>
          {config.children(tools)}
        </div>
      </Tabs>

      <div
        className={cn(
          'sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur transition-all supports-backdrop-filter:bg-background/80',
          !dirty && 'pointer-events-none translate-y-2 opacity-0',
        )}
        aria-hidden={!dirty}
      >
        <p className="text-sm text-muted-foreground">You have unsaved changes</p>
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

/** One tab's content. Kept mounted while hidden so unsaved edits in other tabs survive. */
export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  return (
    <TabsContent value={value} forceMount className="grid gap-4 data-[state=inactive]:hidden">
      {children}
    </TabsContent>
  )
}

/** The page title and description shown in Google, with a live preview. */
export function SeoFields<Draft extends { seo: Seo }>({ tools, url, fallbackTitle, fallbackDescription }: { tools: EditorTools<Draft>; url: string; fallbackTitle: string; fallbackDescription: string }) {
  const { seo } = tools.content
  return (
    <div className="grid gap-4">
      {tools.text('seo.meta_title', 'Page title', { optional: true, placeholder: fallbackTitle, description: 'About 50–60 characters reads best in Google.' })}
      {tools.text('seo.meta_description', 'Description', {
        multiline: true,
        rows: 3,
        optional: true,
        description: 'About 150–160 characters: what visitors will find on this page.',
      })}
      <div className="rounded-lg border bg-muted/20 p-4">
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Preview</p>
        <p className="truncate text-xs text-muted-foreground">{url.replace(/^https?:\/\//, '')}</p>
        <p className="truncate text-lg leading-snug text-blue-700 dark:text-blue-400">{`${seo.meta_title.trim() || fallbackTitle} | Mangrove Collection`}</p>
        <p className="line-clamp-2 text-sm text-muted-foreground">{seo.meta_description.trim() || fallbackDescription}</p>
      </div>
    </div>
  )
}

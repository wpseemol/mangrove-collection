import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BarChart3,
  BookOpen,
  ExternalLink,
  Flag,
  GalleryHorizontal,
  HandHeart,
  Images,
  Loader2,
  Megaphone,
  RefreshCw,
  RotateCcw,
  Route,
  Save,
  Search,
  ServerCrash,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { SingleImageUpload } from '@/components/image-upload'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ABOUT_BLOCKS,
  aboutToSections,
  BLANK_IMAGE,
  BLANK_MEMBER,
  GALLERY_LIMIT,
  MILESTONE_LIMIT,
  otherAboutSections,
  parseAboutContent,
  STAT_LIMIT,
  STEP_LIMIT,
  TEAM_LIMIT,
  VALUE_LIMIT,
  type AboutContent,
  type GalleryImage,
  type Milestone,
  type TeamMember,
} from '@/lib/about-content'
import { ApiError, api, errorMessage } from '@/lib/api'
import { STOREFRONT_URL } from '@/lib/config'
import type { IconItem } from '@/lib/home-content'
import { aboutPageQueryKey, useAboutPage } from '@/lib/queries'
import type { CmsPage } from '@/lib/types'
import { cn } from '@/lib/utils'

import { fromServerErrors, getIn, setIn, validateStrings, type Errors } from '../home-page/content-form'
import { IconSelect, ItemList, Section, TextField, ToggleRow } from '../home-page/fields'

type Seo = { meta_title: string; meta_description: string }
type Draft = AboutContent & { seo: Seo }
type Block = keyof Draft
type HeadingBlock = 'values' | 'process' | 'milestones' | 'team' | 'gallery'

type TabDef = { id: string; title: string; description: string; icon: LucideIcon; blocks: Block[] }

const TABS: TabDef[] = [
  { id: 'hero', title: 'Hero', description: 'The large banner at the top of the About page.', icon: GalleryHorizontal, blocks: ['hero'] },
  { id: 'numbers', title: 'Numbers', description: 'A row of short facts that overlaps the bottom of the hero.', icon: BarChart3, blocks: ['stats'] },
  { id: 'story', title: 'Our story', description: 'How the business began, with a photo and a short quote.', icon: BookOpen, blocks: ['story'] },
  { id: 'values', title: 'Values', description: 'The promises you make to every customer, shown as icon cards.', icon: HandHeart, blocks: ['values'] },
  { id: 'process', title: 'How it works', description: 'Numbered steps from the forest to the customer\u2019s door.', icon: Route, blocks: ['process'] },
  { id: 'milestones', title: 'Milestones', description: 'A timeline of important moments, oldest first.', icon: Flag, blocks: ['milestones'] },
  { id: 'team', title: 'Team', description: 'The people behind the store. Hidden until you turn it on.', icon: Users, blocks: ['team'] },
  { id: 'gallery', title: 'Gallery', description: 'Photos from the Sundarbans, your collectors and your packing. Hidden until you turn it on.', icon: Images, blocks: ['gallery'] },
  { id: 'cta', title: 'Call to action', description: 'The green band at the bottom of the page that sends visitors to the shop.', icon: Megaphone, blocks: ['cta'] },
  { id: 'seo', title: 'Search engines', description: 'How the About page appears in Google and when shared.', icon: Search, blocks: ['seo'] },
]

const PAGE_URL = `${STOREFRONT_URL}/about`
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

const toDraft = (page: CmsPage | null | undefined): Draft => ({
  ...parseAboutContent(page?.sections),
  seo: { meta_title: page?.meta_title ?? '', meta_description: page?.meta_description ?? '' },
})

export function AboutPageEditorPage() {
  const page = useAboutPage()

  return (
    <>
      <PageHeader
        title="About page"
        description="Tell customers who you are. Every section of the store's About page can be edited here and goes live when you save."
        actions={
          <Button variant="outline" asChild>
            <a href={PAGE_URL} target="_blank" rel="noreferrer">
              <ExternalLink /> View About page
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
          <p className="font-medium">Couldn't load the About page</p>
          <p className="text-sm text-muted-foreground">{errorMessage(page.error)}</p>
          <Button variant="outline" size="sm" onClick={() => page.refetch()} disabled={page.isRefetching}>
            <RefreshCw className={page.isRefetching ? 'animate-spin' : undefined} /> Try again
          </Button>
        </div>
      ) : (
        <AboutEditor page={page.data} />
      )}
    </>
  )
}

function AboutEditor({ page }: { page: CmsPage | null }) {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [initial, setInitial] = useState<Draft>(() => toDraft(page))
  const [content, setContent] = useState<Draft>(initial)
  const [errors, setErrors] = useState<Errors>({})

  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab')! : TABS[0].id
  const setTab = (id: string) => setParams(id === TABS[0].id ? {} : { tab: id }, { replace: true })
  const active = TABS.find((t) => t.id === tab)!
  const dirty = !same(content, initial)
  const tabDirty = (t: TabDef) => t.blocks.some((block) => !same(content[block], initial[block]))
  const tabHasErrors = (t: TabDef) => Object.keys(errors).some((key) => t.blocks.includes(key.split('.')[0] as Block))

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

  const text = (path: string, label: string, props: Partial<Parameters<typeof TextField>[0]> = {}) => (
    <TextField path={path} label={label} value={String(getIn(content, path) ?? '')} error={errors[path]} onChange={(value) => update(path, value)} {...props} />
  )

  const image = (path: string, label: string, hint: string, aspect: string, className = 'max-w-sm') => (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">
        {label} <span className="font-normal text-muted-foreground">· {hint}</span>
      </p>
      <SingleImageUpload value={String(getIn(content, path) ?? '')} onChange={(url) => update(path, url)} aspect={aspect} label={`Upload ${label.toLowerCase()}`} className={className} />
      {errors[path] && <p className="text-xs text-destructive">{errors[path]}</p>}
    </div>
  )

  const save = useMutation({
    mutationFn: () =>
      api<{ data: CmsPage }>('/admin/pages/about', {
        method: 'PUT',
        body: {
          title: page?.title ?? 'About Us',
          sections: [...aboutToSections(content), ...otherAboutSections(page?.sections)],
          meta_title: content.seo.meta_title.trim() || null,
          meta_description: content.seo.meta_description.trim() || null,
        },
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(aboutPageQueryKey, data)
      const fresh = toDraft(data)
      setInitial(fresh)
      setContent(fresh)
      toast.success('About page saved. Refresh the store to see it.')
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 422 && Object.keys(e.errors).length) {
        showErrors(fromServerErrors(e.errors, ABOUT_BLOCKS, (key) => (key.startsWith('meta_') ? `seo.${key}` : key)))
      } else {
        toast.error(errorMessage(e))
      }
    },
  })

  const showErrors = (found: Errors) => {
    setErrors(found)
    const first = TABS.find((t) => t.blocks.includes(Object.keys(found)[0]?.split('.')[0] as Block))
    if (first && first.id !== tab) setTab(first.id)
    toast.error('Please fix the highlighted fields.')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateStrings(content)
    if (Object.keys(found).length) return showErrors(found)
    setErrors({})
    if (dirty) save.mutate()
  }

  const discard = () => {
    setContent(initial)
    setErrors({})
  }

  const heading = (block: HeadingBlock, title = 'Show on the About page') => (
    <Section title="Heading">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ToggleRow title={title} checked={content[block].enabled} onCheckedChange={(value) => update(`${block}.enabled`, value)} />
        </div>
        {text(`${block}.eyebrow`, 'Small label', { optional: true })}
        {text(`${block}.title`, 'Title')}
        {text(`${block}.subtitle`, 'Subtitle', { multiline: true, rows: 2, optional: true, className: 'sm:col-span-2' })}
      </div>
    </Section>
  )

  const iconItems = (path: 'values.items' | 'process.steps', noun: string, max: number) => (
    <ItemList<IconItem>
      items={getIn(content, path) as IconItem[]}
      onChange={(items) => update(path, items)}
      max={max}
      noun={noun}
      blank={{ icon: 'leaf', title: '', text: '' }}
      sortable
    >
      {(item, index) => (
        <div className="grid gap-3 sm:grid-cols-[11rem_1fr]">
          <IconSelect value={item.icon} onChange={(icon) => update(`${path}.${index}.icon`, icon)} />
          {text(`${path}.${index}.title`, 'Title')}
          {text(`${path}.${index}.text`, 'Text', { multiline: true, rows: 2, className: 'sm:col-span-2' })}
        </div>
      )}
    </ItemList>
  )

  const buttons = (block: 'hero' | 'cta') => (
    <>
      {text(`${block}.primary_label`, 'Main button text', { optional: true, description: 'Leave empty to hide the button.' })}
      {text(`${block}.primary_url`, 'Main button link', { placeholder: '/shop' })}
      {text(`${block}.secondary_label`, 'Second button text', { optional: true })}
      {text(`${block}.secondary_url`, 'Second button link', { placeholder: '/contact' })}
    </>
  )

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Tabs value={tab} onValueChange={setTab} orientation="vertical" className="gap-6 lg:flex-row">
        <TabsList
          variant="line"
          className="w-full flex-row justify-start overflow-x-auto lg:sticky lg:top-20 lg:w-52 lg:shrink-0 lg:flex-col lg:items-stretch lg:self-start"
        >
          {TABS.map((t) => (
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

          <TabsContent value="hero" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            <Section title="Headline" description="The highlighted words appear in gold after the title.">
              <div className="grid gap-4 sm:grid-cols-2">
                {text('hero.eyebrow', 'Small label', { optional: true, className: 'sm:col-span-2' })}
                {text('hero.title', 'Title')}
                {text('hero.highlight', 'Highlighted words', { optional: true })}
                {text('hero.description', 'Description', { multiline: true, optional: true, className: 'sm:col-span-2' })}
                {buttons('hero')}
              </div>
            </Section>
            <Section title="Background photo" description="Optional. Without a photo the brand-green background is used. Text stays readable over a dark overlay.">
              {image('hero.image', 'Photo', '1600 × 900 px or larger', 'aspect-[21/9]', 'max-w-xl')}
            </Section>
          </TabsContent>

          <TabsContent value="numbers" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            <Section title="Numbers" description={`Up to ${STAT_LIMIT} short facts, e.g. “64” · “Districts delivered”.`}>
              <div className="grid gap-4">
                <ToggleRow title="Show on the About page" checked={content.stats.enabled} onCheckedChange={(value) => update('stats.enabled', value)} />
                <ItemList items={content.stats.items} onChange={(items) => update('stats.items', items)} max={STAT_LIMIT} noun="Number" blank={{ value: '', label: '' }} sortable>
                  {(_, index) => (
                    <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                      {text(`stats.items.${index}.value`, 'Value', { placeholder: '100%' })}
                      {text(`stats.items.${index}.label`, 'Label', { placeholder: 'Natural products' })}
                    </div>
                  )}
                </ItemList>
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="story" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            <Section title="Story">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <ToggleRow title="Show on the About page" checked={content.story.enabled} onCheckedChange={(value) => update('story.enabled', value)} />
                </div>
                {text('story.eyebrow', 'Small label', { optional: true })}
                {text('story.title', 'Title')}
                {text('story.body', 'Story', {
                  multiline: true,
                  rows: 8,
                  className: 'sm:col-span-2',
                  description: (
                    <>
                      Each line becomes its own paragraph. <code className="rounded bg-muted px-1">**word**</code> makes text bold and{' '}
                      <code className="rounded bg-muted px-1">[Shop honey](/shop?category=honey)</code> adds a link.
                    </>
                  ),
                })}
              </div>
            </Section>
            <Section title="Quote" description="Shown on a card over the photo. Leave empty to hide it.">
              <div className="grid gap-4 sm:grid-cols-2">
                {text('story.quote', 'Quote', { multiline: true, rows: 2, optional: true, className: 'sm:col-span-2' })}
                {text('story.quote_author', 'Who said it', { optional: true })}
              </div>
            </Section>
            <Section title="Photo" description="Optional. Without one, a brand-green panel with your logo is shown.">
              {image('story.image', 'Photo', 'portrait, 900 × 1100 px works best', 'aspect-[4/5]', 'max-w-xs')}
            </Section>
          </TabsContent>

          <TabsContent value="values" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            {heading('values')}
            <Section title="Cards" description={`Up to ${VALUE_LIMIT}. Four fit on one row on large screens.`}>
              {iconItems('values.items', 'Value', VALUE_LIMIT)}
            </Section>
          </TabsContent>

          <TabsContent value="process" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            {heading('process')}
            <Section title="Steps" description={`Up to ${STEP_LIMIT}, numbered in this order.`}>
              {iconItems('process.steps', 'Step', STEP_LIMIT)}
            </Section>
          </TabsContent>

          <TabsContent value="milestones" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            {heading('milestones')}
            <Section title="Timeline" description={`Up to ${MILESTONE_LIMIT} moments, oldest first.`}>
              <ItemList<Milestone>
                items={content.milestones.items}
                onChange={(items) => update('milestones.items', items)}
                max={MILESTONE_LIMIT}
                noun="Milestone"
                blank={{ year: '', title: '', text: '' }}
                sortable
              >
                {(_, index) => (
                  <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                    {text(`milestones.items.${index}.year`, 'Year', { placeholder: '2024' })}
                    {text(`milestones.items.${index}.title`, 'Title')}
                    {text(`milestones.items.${index}.text`, 'Text', { multiline: true, rows: 2, optional: true, className: 'sm:col-span-2' })}
                  </div>
                )}
              </ItemList>
            </Section>
          </TabsContent>

          <TabsContent value="team" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            {heading('team')}
            <Section title="Members" description={`Up to ${TEAM_LIMIT}. Without a photo, the person's initials are shown.`}>
              <ItemList<TeamMember>
                items={content.team.members}
                onChange={(members) => update('team.members', members)}
                max={TEAM_LIMIT}
                noun="Member"
                blank={BLANK_MEMBER}
                sortable
              >
                {(_, index) => (
                  <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
                    <div className="row-span-3">{image(`team.members.${index}.image`, 'Photo', 'square', 'aspect-square', 'max-w-36')}</div>
                    {text(`team.members.${index}.name`, 'Name')}
                    {text(`team.members.${index}.role`, 'Role', { optional: true, placeholder: 'Founder' })}
                    {text(`team.members.${index}.bio`, 'Short bio', { multiline: true, rows: 2, optional: true })}
                  </div>
                )}
              </ItemList>
              {content.team.enabled && !content.team.members.length && (
                <p className="mt-3 text-xs text-muted-foreground">The team section stays hidden on the store until you add at least one member.</p>
              )}
            </Section>
          </TabsContent>

          <TabsContent value="gallery" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            {heading('gallery')}
            <Section title="Photos" description={`Up to ${GALLERY_LIMIT}. Landscape photos of 1200 × 900 px work best. Every fifth photo is shown larger.`}>
              <ItemList<GalleryImage>
                items={content.gallery.images}
                onChange={(images) => update('gallery.images', images)}
                max={GALLERY_LIMIT}
                noun="Photo"
                blank={BLANK_IMAGE}
                sortable
              >
                {(_, index) => (
                  <div className="grid items-start gap-3 sm:grid-cols-[14rem_1fr]">
                    {image(`gallery.images.${index}.image`, 'Photo', 'required', 'aspect-[4/3]', 'max-w-56')}
                    {text(`gallery.images.${index}.caption`, 'Caption', { optional: true, description: 'Also used as the image description for screen readers.' })}
                  </div>
                )}
              </ItemList>
              {content.gallery.enabled && !content.gallery.images.some((item) => item.image) && (
                <p className="mt-3 text-xs text-muted-foreground">The gallery stays hidden on the store until at least one photo is uploaded.</p>
              )}
            </Section>
          </TabsContent>

          <TabsContent value="cta" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            <Section title="Text and buttons">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <ToggleRow title="Show on the About page" checked={content.cta.enabled} onCheckedChange={(value) => update('cta.enabled', value)} />
                </div>
                {text('cta.title', 'Title', { className: 'sm:col-span-2' })}
                {text('cta.description', 'Description', { multiline: true, rows: 2, optional: true, className: 'sm:col-span-2' })}
                {buttons('cta')}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="seo" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            <Section title="Search result" description="Leave empty to use the store's default title and description for this page.">
              <div className="grid gap-4">
                {text('seo.meta_title', 'Page title', { optional: true, placeholder: 'About Us — Our Sundarbans Story', description: 'About 50–60 characters reads best in Google.' })}
                {text('seo.meta_description', 'Description', {
                  multiline: true,
                  rows: 3,
                  optional: true,
                  description: 'About 150–160 characters: who you are and what you sell.',
                })}
              </div>
              <SearchPreview
                title={`${content.seo.meta_title.trim() || 'About Us — Our Sundarbans Story'} | Mangrove Collection`}
                description={content.seo.meta_description.trim() || content.hero.description}
              />
            </Section>
          </TabsContent>
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

function SearchPreview({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-4 rounded-lg border bg-muted/20 p-4">
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Preview</p>
      <p className="truncate text-xs text-muted-foreground">{PAGE_URL.replace(/^https?:\/\//, '')}</p>
      <p className="truncate text-lg leading-snug text-blue-700 dark:text-blue-400">{title}</p>
      <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

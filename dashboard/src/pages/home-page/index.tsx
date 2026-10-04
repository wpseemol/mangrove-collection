import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  ExternalLink,
  GalleryHorizontal,
  HandHeart,
  Images,
  LayoutGrid,
  Loader2,
  Mail,
  Newspaper,
  RefreshCw,
  RotateCcw,
  Save,
  ServerCrash,
  ShieldCheck,
  Type,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { SingleImageUpload } from '@/components/image-upload'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiError, api, errorMessage } from '@/lib/api'
import { STOREFRONT_URL } from '@/lib/config'
import { otherSections, parseHomeContent, toSections, type HomeContent, type IconItem, type InfoCard } from '@/lib/home-content'
import { homePageQueryKey, useBanners, useHomePage } from '@/lib/queries'
import type { Banner, CmsPage } from '@/lib/types'
import { cn } from '@/lib/utils'

import { fromServerErrors, getIn, INFO_CARD_LIMIT, setIn, validateContent, type Errors } from './content-form'
import { IconSelect, ItemList, TextField, ToggleRow } from './fields'
import { SideImageSlot, SlidesManager } from './hero-media'

type TabDef = { id: string; title: string; description: string; icon: LucideIcon; blocks: (keyof HomeContent)[] }

const TABS: TabDef[] = [
  {
    id: 'hero',
    title: 'Hero',
    description: 'The big banner at the top of the home page: an image slider or a headline, plus the two side cards.',
    icon: GalleryHorizontal,
    blocks: ['hero'],
  },
  { id: 'highlights', title: 'Highlights', description: 'The row of short selling points under the hero.', icon: ShieldCheck, blocks: ['trust'] },
  {
    id: 'products',
    title: 'Product rows',
    description: 'Headings for the category grid and the product rows. Products and categories themselves come from the catalog.',
    icon: LayoutGrid,
    blocks: ['categories', 'popular', 'latest'],
  },
  { id: 'promise', title: 'Our promise', description: 'The green band explaining how products reach customers.', icon: HandHeart, blocks: ['promise'] },
  { id: 'story', title: 'Our story', description: 'A short story at the bottom of the home page that links to the About page.', icon: BookOpen, blocks: ['story'] },
  {
    id: 'info',
    title: 'Info cards',
    description: 'Text cards at the bottom of the home page about sourcing, delivery and quality. Well-written cards with links help search engines understand the store.',
    icon: Newspaper,
    blocks: ['info'],
  },
  { id: 'newsletter', title: 'Newsletter', description: 'The email sign-up card shown above the footer on every page.', icon: Mail, blocks: ['newsletter'] },
]

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export function HomePageEditorPage() {
  const page = useHomePage()
  const banners = useBanners()

  return (
    <>
      <PageHeader
        title="Home page"
        description="Edit everything on the store's home page. Text changes go live when you save."
        actions={
          <Button variant="outline" asChild>
            <a href={STOREFRONT_URL} target="_blank" rel="noreferrer">
              <ExternalLink /> View home page
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
          <p className="font-medium">Couldn't load the home page</p>
          <p className="text-sm text-muted-foreground">{errorMessage(page.error)}</p>
          <Button variant="outline" size="sm" onClick={() => page.refetch()} disabled={page.isRefetching}>
            <RefreshCw className={page.isRefetching ? 'animate-spin' : undefined} /> Try again
          </Button>
        </div>
      ) : (
        <ContentEditor page={page.data} banners={banners.data ?? []} bannersLoading={banners.isPending} />
      )}
    </>
  )
}

function ContentEditor({ page, banners, bannersLoading }: { page: CmsPage | null; banners: Banner[]; bannersLoading: boolean }) {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [initial, setInitial] = useState<HomeContent>(() => parseHomeContent(page?.sections))
  const [content, setContent] = useState<HomeContent>(initial)
  const [errors, setErrors] = useState<Errors>({})

  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab')! : TABS[0].id
  const setTab = (id: string) => setParams(id === TABS[0].id ? {} : { tab: id }, { replace: true })
  const active = TABS.find((t) => t.id === tab)!
  const dirty = !same(content, initial)
  const tabDirty = (t: TabDef) => t.blocks.some((block) => !same(content[block], initial[block]))
  const tabHasErrors = (t: TabDef) => Object.keys(errors).some((key) => t.blocks.includes(key.split('.')[0] as keyof HomeContent))

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

  const save = useMutation({
    mutationFn: () =>
      api<{ data: CmsPage }>('/admin/pages/home', {
        method: 'PUT',
        body: { title: page?.title ?? 'Home', sections: [...toSections(content), ...otherSections(page?.sections)] },
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(homePageQueryKey, data)
      const fresh = parseHomeContent(data.sections)
      setInitial(fresh)
      setContent(fresh)
      toast.success('Home page saved. Refresh the store to see it.')
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 422 && Object.keys(e.errors).length) {
        showErrors(fromServerErrors(e.errors))
      } else {
        toast.error(errorMessage(e))
      }
    },
  })

  const showErrors = (found: Errors) => {
    setErrors(found)
    const first = TABS.find((t) => t.blocks.includes(Object.keys(found)[0]?.split('.')[0] as keyof HomeContent))
    if (first && first.id !== tab) setTab(first.id)
    toast.error('Please fix the highlighted fields.')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateContent(content)
    if (Object.keys(found).length) return showErrors(found)
    setErrors({})
    if (dirty) save.mutate()
  }

  const discard = () => {
    setContent(initial)
    setErrors({})
  }

  const iconItems = (path: 'trust.items' | 'promise.steps', noun: string, max: number, min: number) => (
    <ItemList<IconItem>
      items={getIn(content, path) as IconItem[]}
      onChange={(items) => update(path, items)}
      max={max}
      min={min}
      noun={noun}
      blank={{ icon: 'leaf', title: '', text: '' }}
    >
      {(item, index) => (
        <div className="grid gap-3 sm:grid-cols-[11rem_1fr]">
          <IconSelect value={item.icon} onChange={(icon) => update(`${path}.${index}.icon`, icon)} />
          {text(`${path}.${index}.title`, 'Title')}
          {text(`${path}.${index}.text`, 'Text', { className: 'sm:col-span-2' })}
        </div>
      )}
    </ItemList>
  )

  const hero = content.hero

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
            <Section title="Hero type" description="Choose what fills the large area at the top of the home page.">
              <RadioGroup value={hero.mode} onValueChange={(mode) => update('hero.mode', mode)} className="grid gap-3 sm:grid-cols-2">
                <ModeOption value="slider" current={hero.mode} icon={Images} title="Image slider">
                  Rotating images you upload. Each slide can have a caption and a link.
                </ModeOption>
                <ModeOption value="static" current={hero.mode} icon={Type} title="Headline">
                  A headline with buttons on a brand-green or photo background.
                </ModeOption>
              </RadioGroup>
            </Section>

            {hero.mode === 'slider' && (
              <Section title="Slides" description="Slides are saved as soon as you add, edit, reorder or hide them. Hidden slides stay here for later.">
                <SlidesManager banners={banners} loading={bannersLoading} />
                <div className="mt-4 max-w-xs space-y-1.5">
                  <Label htmlFor="home-autoplay">Change slide every</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="home-autoplay"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={30}
                      step={1}
                      value={String(hero.autoplay_seconds)}
                      onChange={(e) => update('hero.autoplay_seconds', e.target.value === '' ? 0 : Number(e.target.value))}
                      aria-invalid={Boolean(errors['hero.autoplay_seconds'])}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">seconds</span>
                  </div>
                  {errors['hero.autoplay_seconds'] ? (
                    <p className="text-xs text-destructive">{errors['hero.autoplay_seconds']}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Use 0 to only change slides with the arrows.</p>
                  )}
                </div>
              </Section>
            )}

            <Section
              title={hero.mode === 'slider' ? 'Fallback headline' : 'Headline'}
              description={
                hero.mode === 'slider'
                  ? 'Shown instead of the slider while there are no visible slides.'
                  : 'The highlighted words appear in gold after the title.'
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {text('hero.eyebrow', 'Small label', { optional: true, className: 'sm:col-span-2' })}
                {text('hero.title', 'Title')}
                {text('hero.highlight', 'Highlighted words', { optional: true })}
                {text('hero.description', 'Description', { multiline: true, optional: true, className: 'sm:col-span-2' })}
                {text('hero.primary_label', 'Main button text', { optional: true })}
                {text('hero.primary_url', 'Main button link', { placeholder: '/shop' })}
                {text('hero.secondary_label', 'Second button text', { optional: true })}
                {text('hero.secondary_url', 'Second button link', { placeholder: '/categories' })}
                <div className="space-y-1.5 sm:col-span-2">
                  <p className="text-sm font-medium text-foreground">
                    Background photo <span className="font-normal text-muted-foreground">· optional, 1600 × 900 px or larger</span>
                  </p>
                  <SingleImageUpload
                    value={hero.image}
                    onChange={(url) => update('hero.image', url)}
                    aspect="aspect-[21/9]"
                    label="Upload background photo"
                    className="max-w-xl"
                  />
                  {errors['hero.image'] ? (
                    <p className="text-xs text-destructive">{errors['hero.image']}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Without a photo the brand-green background with your logo is used.</p>
                  )}
                </div>
              </div>
            </Section>

            <Section title="Side cards" description="Two cards beside the hero. Give a card an image, or let it show the text card. Images save straight away.">
              <ToggleRow
                title="Show side cards"
                description="Turn off to let the hero use the full width."
                checked={hero.show_side_cards}
                onCheckedChange={(value) => update('hero.show_side_cards', value)}
              />
              {hero.show_side_cards && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {(['right_top', 'right_bottom'] as const).map((type, index) => (
                    <div key={type} className="grid content-start gap-3 rounded-lg border p-3">
                      <p className="text-sm font-semibold">{index === 0 ? 'Top card' : 'Bottom card'}</p>
                      <SideImageSlot type={type} banner={banners.find((banner) => banner.type === type)} loading={bannersLoading} />
                      <p className="pt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Text card</p>
                      {text(`hero.promos.${index}.eyebrow`, 'Small label', { optional: true })}
                      {text(`hero.promos.${index}.title`, 'Title')}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {text(`hero.promos.${index}.link_label`, 'Link text', { optional: true })}
                        {text(`hero.promos.${index}.link_url`, 'Link', { placeholder: '/offers' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </TabsContent>

          <TabsContent value="highlights" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            <Section title="Highlights" description="Up to four short points, e.g. delivery, payment or quality.">
              <div className="grid gap-4">
                <ToggleRow title="Show on the home page" checked={content.trust.enabled} onCheckedChange={(value) => update('trust.enabled', value)} />
                {iconItems('trust.items', 'Highlight', 4, 1)}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="products" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            {(
              [
                ['categories', 'Category grid', 'Shows up to 12 visible categories.'],
                ['popular', 'Popular products', 'Your best-selling published products.'],
                ['latest', 'New arrivals', 'Your newest published products.'],
              ] as const
            ).map(([block, title, description]) => (
              <Section key={block} title={title} description={description}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <ToggleRow
                      title="Show on the home page"
                      checked={content[block].enabled}
                      onCheckedChange={(value) => update(`${block}.enabled`, value)}
                    />
                  </div>
                  {text(`${block}.eyebrow`, 'Small label', { optional: true })}
                  {text(`${block}.title`, 'Title')}
                  {text(`${block}.subtitle`, 'Subtitle', { optional: true })}
                  {text(`${block}.link_label`, '"View all" link text', { optional: true, description: 'Leave empty to hide the link.' })}
                </div>
              </Section>
            ))}
          </TabsContent>

          <TabsContent value="promise" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            <Section title="Text and buttons">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <ToggleRow title="Show on the home page" checked={content.promise.enabled} onCheckedChange={(value) => update('promise.enabled', value)} />
                </div>
                {text('promise.eyebrow', 'Small label', { optional: true })}
                {text('promise.title', 'Title')}
                {text('promise.description', 'Description', { multiline: true, optional: true, className: 'sm:col-span-2' })}
                {text('promise.primary_label', 'Main button text', { optional: true })}
                {text('promise.primary_url', 'Main button link', { placeholder: '/about' })}
                {text('promise.secondary_label', 'Second button text', { optional: true })}
                {text('promise.secondary_url', 'Second button link', { placeholder: '/contact' })}
              </div>
            </Section>
            <Section title="Steps" description="Numbered steps shown beside the text. Up to four.">
              {iconItems('promise.steps', 'Step', 4, 0)}
            </Section>
          </TabsContent>

          <TabsContent value="story" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            <Section title="Story" description="Keep it short: two or three sentences. The full story lives on the About page.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <ToggleRow title="Show on the home page" checked={content.story.enabled} onCheckedChange={(value) => update('story.enabled', value)} />
                </div>
                {text('story.eyebrow', 'Small label', { optional: true })}
                {text('story.title', 'Title')}
                {text('story.body', 'Story', { multiline: true, rows: 6, className: 'sm:col-span-2', description: 'Plain text. Each line becomes its own paragraph.' })}
                {text('story.button_label', 'Button text', { optional: true })}
                {text('story.button_url', 'Button link', { placeholder: '/about' })}
              </div>
            </Section>
            <Section title="Photo" description="Optional. A landscape photo of 1200 × 900 px works best. Without one, a brand-green panel with your logo is shown.">
              <SingleImageUpload value={content.story.image} onChange={(url) => update('story.image', url)} aspect="aspect-[4/3]" label="Upload photo" className="max-w-sm" />
              {errors['story.image'] && <p className="mt-1.5 text-xs text-destructive">{errors['story.image']}</p>}
            </Section>
            <Section title="Numbers" description="Up to three short facts shown under the story, e.g. “100%” · “Natural products”.">
              <ItemList
                items={content.story.stats}
                onChange={(stats) => update('story.stats', stats)}
                max={3}
                noun="Number"
                blank={{ value: '', label: '' }}
              >
                {(_, index) => (
                  <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                    {text(`story.stats.${index}.value`, 'Value', { placeholder: '100%' })}
                    {text(`story.stats.${index}.label`, 'Label', { placeholder: 'Natural products' })}
                  </div>
                )}
              </ItemList>
            </Section>
          </TabsContent>

          <TabsContent value="info" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            <Section title="Heading">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <ToggleRow title="Show on the home page" checked={content.info.enabled} onCheckedChange={(value) => update('info.enabled', value)} />
                </div>
                {text('info.eyebrow', 'Small label', { optional: true })}
                {text('info.title', 'Title', { optional: true })}
                {text('info.subtitle', 'Subtitle', { multiline: true, rows: 2, optional: true, className: 'sm:col-span-2' })}
              </div>
            </Section>
            <Section title='"Read more" button' description="Show the first few cards and hide the rest behind a button. Hidden cards are still readable by search engines.">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="home-info-visible">Cards shown at first</Label>
                  <Input
                    id="home-info-visible"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={INFO_CARD_LIMIT}
                    step={1}
                    value={String(content.info.visible_count)}
                    onChange={(e) => update('info.visible_count', e.target.value === '' ? 0 : Number(e.target.value))}
                    aria-invalid={Boolean(errors['info.visible_count'])}
                    className="w-24"
                  />
                  {errors['info.visible_count'] ? (
                    <p className="text-xs text-destructive">{errors['info.visible_count']}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">0 shows every card.</p>
                  )}
                </div>
                {text('info.read_more_label', 'Button text', { placeholder: 'Read more' })}
                {text('info.read_less_label', 'Button text when open', { placeholder: 'Show less' })}
              </div>
            </Section>
            <Section
              title="Cards"
              description={`Up to ${INFO_CARD_LIMIT} cards. Write for customers first: what you sell, where it comes from and how delivery works.`}
            >
              <div className="mb-4 rounded-lg border border-dashed bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Formatting</p>
                <p>
                  <code className="rounded bg-muted px-1 py-0.5">**fresh honey**</code> makes text <strong className="text-foreground">bold</strong>.{' '}
                  <code className="rounded bg-muted px-1 py-0.5">[Shop honey](/shop?category=honey)</code> adds a link — use a site path starting with / or a full
                  https:// address. Each line becomes its own paragraph.
                </p>
              </div>
              <ItemList<InfoCard>
                items={content.info.items}
                onChange={(items) => update('info.items', items)}
                max={INFO_CARD_LIMIT}
                noun="Card"
                blank={{ title: '', body: '' }}
                sortable
              >
                {(_, index) => (
                  <div className="grid gap-3">
                    {text(`info.items.${index}.title`, 'Heading')}
                    {text(`info.items.${index}.body`, 'Text', { multiline: true, rows: 5 })}
                  </div>
                )}
              </ItemList>
            </Section>
          </TabsContent>

          <TabsContent value="newsletter" forceMount className="grid gap-4 data-[state=inactive]:hidden">
            <Section title="Sign-up card">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <ToggleRow
                    title="Show the newsletter card"
                    description="Appears above the footer on every store page."
                    checked={content.newsletter.enabled}
                    onCheckedChange={(value) => update('newsletter.enabled', value)}
                  />
                </div>
                {text('newsletter.title', 'Title', { className: 'sm:col-span-2' })}
                {text('newsletter.subtitle', 'Subtitle', { multiline: true, rows: 2, optional: true, className: 'sm:col-span-2' })}
                {text('newsletter.placeholder', 'Email box placeholder', { placeholder: 'Enter your email address' })}
                {text('newsletter.button_label', 'Button text', { placeholder: 'Subscribe' })}
                {text('newsletter.success_message', 'Thank-you message', { className: 'sm:col-span-2', description: 'Shown after someone subscribes.' })}
                {text('newsletter.note', 'Small print', { optional: true, className: 'sm:col-span-2', placeholder: 'No spam, ever. Unsubscribe at any time.' })}
              </div>
            </Section>
            <Section title="Subscribers" description="Everyone who signs up is listed on the Subscribers page, where you can search, unsubscribe or export them as CSV.">
              <Button type="button" variant="outline" asChild>
                <Link to="/subscribers">
                  <Users /> Open subscribers
                </Link>
              </Button>
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

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function ModeOption({
  value,
  current,
  icon: Icon,
  title,
  children,
}: {
  value: string
  current: string
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <Label
      htmlFor={`hero-mode-${value}`}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal transition-colors hover:bg-muted/40',
        current === value && 'border-primary bg-secondary/60 ring-1 ring-primary',
      )}
    >
      <RadioGroupItem id={`hero-mode-${value}`} value={value} className="mt-0.5" />
      <span className="grid gap-1">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="size-4 text-primary" /> {title}
        </span>
        <span className="text-xs leading-relaxed text-muted-foreground">{children}</span>
      </span>
    </Label>
  )
}

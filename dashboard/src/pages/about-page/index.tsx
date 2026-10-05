import { BarChart3, BookOpen, Flag, GalleryHorizontal, HandHeart, Images, Megaphone, Route, Search, Users } from 'lucide-react'

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
import { STOREFRONT_URL } from '@/lib/config'
import type { IconItem } from '@/lib/home-content'

import { seoFromPage, type Seo } from '../home-page/content-form'
import { FormattingHint, IconSelect, ItemList, Section, ToggleRow } from '../home-page/fields'
import { PageEditor, SeoFields, TabPanel, type EditorTab, type EditorTools } from '../home-page/page-editor'

type Draft = AboutContent & { seo: Seo }
type HeadingBlock = 'values' | 'process' | 'milestones' | 'team' | 'gallery'

const TABS: EditorTab<keyof Draft>[] = [
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

export function AboutPageEditorPage() {
  return (
    <PageEditor<Draft>
      slug="about"
      name="About page"
      defaultTitle="About Us"
      description="Tell customers who you are. Every section of the store's About page can be edited here and goes live when you save."
      viewUrl={PAGE_URL}
      tabs={TABS}
      blocks={ABOUT_BLOCKS}
      toDraft={(page) => ({ ...parseAboutContent(page?.sections), seo: seoFromPage(page) })}
      toSections={(draft, page) => [...aboutToSections(draft), ...otherAboutSections(page?.sections)]}
    >
      {(tools) => <AboutFields tools={tools} />}
    </PageEditor>
  )
}

function AboutFields({ tools }: { tools: EditorTools<Draft> }) {
  const { content, update, text, image } = tools

  const heading = (block: HeadingBlock) => (
    <Section title="Heading">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ToggleRow title="Show on the About page" checked={content[block].enabled} onCheckedChange={(value) => update(`${block}.enabled`, value)} />
        </div>
        {text(`${block}.eyebrow`, 'Small label', { optional: true })}
        {text(`${block}.title`, 'Title')}
        {text(`${block}.subtitle`, 'Subtitle', { multiline: true, rows: 2, optional: true, className: 'sm:col-span-2' })}
      </div>
    </Section>
  )

  const iconItems = (path: 'values.items' | 'process.steps', items: IconItem[], noun: string, max: number) => (
    <ItemList<IconItem> items={items} onChange={(next) => update(path, next)} max={max} noun={noun} blank={{ icon: 'leaf', title: '', text: '' }} sortable>
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
    <>
      <TabPanel value="hero">
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
      </TabPanel>

      <TabPanel value="numbers">
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
      </TabPanel>

      <TabPanel value="story">
        <Section title="Story">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ToggleRow title="Show on the About page" checked={content.story.enabled} onCheckedChange={(value) => update('story.enabled', value)} />
            </div>
            {text('story.eyebrow', 'Small label', { optional: true })}
            {text('story.title', 'Title')}
            {text('story.body', 'Story', { multiline: true, rows: 8, className: 'sm:col-span-2', description: <FormattingHint /> })}
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
      </TabPanel>

      <TabPanel value="values">
        {heading('values')}
        <Section title="Cards" description={`Up to ${VALUE_LIMIT}. Four fit on one row on large screens.`}>
          {iconItems('values.items', content.values.items, 'Value', VALUE_LIMIT)}
        </Section>
      </TabPanel>

      <TabPanel value="process">
        {heading('process')}
        <Section title="Steps" description={`Up to ${STEP_LIMIT}, numbered in this order.`}>
          {iconItems('process.steps', content.process.steps, 'Step', STEP_LIMIT)}
        </Section>
      </TabPanel>

      <TabPanel value="milestones">
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
      </TabPanel>

      <TabPanel value="team">
        {heading('team')}
        <Section title="Members" description={`Up to ${TEAM_LIMIT}. Without a photo, the person's initials are shown.`}>
          <ItemList<TeamMember> items={content.team.members} onChange={(members) => update('team.members', members)} max={TEAM_LIMIT} noun="Member" blank={BLANK_MEMBER} sortable>
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
      </TabPanel>

      <TabPanel value="gallery">
        {heading('gallery')}
        <Section title="Photos" description={`Up to ${GALLERY_LIMIT}. Landscape photos of 1200 × 900 px work best. Every fifth photo is shown larger.`}>
          <ItemList<GalleryImage> items={content.gallery.images} onChange={(images) => update('gallery.images', images)} max={GALLERY_LIMIT} noun="Photo" blank={BLANK_IMAGE} sortable>
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
      </TabPanel>

      <TabPanel value="cta">
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
      </TabPanel>

      <TabPanel value="seo">
        <Section title="Search result" description="Leave empty to use the store's default title and description for this page.">
          <SeoFields tools={tools} url={PAGE_URL} fallbackTitle="About Us — Our Sundarbans Story" fallbackDescription={content.hero.description} />
        </Section>
      </TabPanel>
    </>
  )
}
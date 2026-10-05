import { CircleHelp, Clock, ContactRound, GalleryHorizontal, Mail, MapPin, MessageSquareText, Phone, Search, Settings2, Share2, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { STOREFRONT_URL } from '@/lib/config'
import {
  CONTACT_BLOCKS,
  contactToSections,
  embedSrc,
  FAQ_LIMIT,
  HOURS_LIMIT,
  isMapEmbed,
  otherContactSections,
  parseContactContent,
  TOPIC_LIMIT,
  type ContactContent,
  type Faq,
  type OpeningHours,
} from '@/lib/contact-content'
import { usePublicSettings } from '@/lib/queries'
import { isAdmin } from '@/lib/types'
import { useAuthStore } from '@/stores/auth'

import { seoFromPage, validateStrings, type Seo } from '../home-page/content-form'
import { FormattingHint, ItemList, Section, ToggleRow } from '../home-page/fields'
import { PageEditor, SeoFields, TabPanel, type EditorTab, type EditorTools } from '../home-page/page-editor'

type Draft = ContactContent & { seo: Seo }

const TABS: EditorTab<keyof Draft>[] = [
  { id: 'hero', title: 'Hero', description: 'The green banner at the top of the Contact page.', icon: GalleryHorizontal, blocks: ['hero'] },
  {
    id: 'channels',
    title: 'Contact cards',
    description: 'Cards for phone, WhatsApp, email and address. The details come from Settings; here you add the short line under each.',
    icon: ContactRound,
    blocks: ['channels'],
  },
  {
    id: 'form',
    title: 'Message form',
    description: 'A form customers fill in and send to you on WhatsApp or by email. Nothing is stored on the website.',
    icon: MessageSquareText,
    blocks: ['form'],
  },
  { id: 'hours', title: 'Opening hours', description: 'When customers can reach your team.', icon: Clock, blocks: ['hours'] },
  { id: 'social', title: 'Social links', description: 'A card with your social media buttons. The links come from Settings.', icon: Share2, blocks: ['social'] },
  { id: 'map', title: 'Map', description: 'A Google map of your shop or office. Hidden until you turn it on.', icon: MapPin, blocks: ['map'] },
  { id: 'faq', title: 'FAQ', description: 'Common questions answered before customers need to ask.', icon: CircleHelp, blocks: ['faq'] },
  { id: 'seo', title: 'Search engines', description: 'How the Contact page appears in Google and when shared.', icon: Search, blocks: ['seo'] },
]

const PAGE_URL = `${STOREFRONT_URL}/contact`
const MAP_MESSAGE = 'Paste the link from Google Maps → Share → Embed a map. It starts with https://www.google.com/maps/embed?'

function validate(draft: Draft) {
  const errors = validateStrings(draft)
  const embed = draft.map.embed_url.trim()
  if (embed && !errors['map.embed_url'] && !isMapEmbed(embed)) errors['map.embed_url'] = MAP_MESSAGE
  return errors
}

export function ContactPageEditorPage() {
  return (
    <PageEditor<Draft>
      slug="contact"
      name="Contact page"
      defaultTitle="Contact Us"
      description="Edit the store's Contact page: the headline, the short notes on each contact card, the message form, opening hours, map and FAQ."
      viewUrl={PAGE_URL}
      tabs={TABS}
      blocks={CONTACT_BLOCKS}
      toDraft={(page) => ({ ...parseContactContent(page?.sections), seo: seoFromPage(page) })}
      toSections={(draft, page) => [...contactToSections(draft), ...otherContactSections(page?.sections)]}
      validate={validate}
    >
      {(tools) => <ContactFields tools={tools} />}
    </PageEditor>
  )
}

function ContactFields({ tools }: { tools: EditorTools<Draft> }) {
  const { content, update, text, errors } = tools
  const settings = usePublicSettings().data
  const value = (key: string) => (typeof settings?.[key] === 'string' ? (settings[key] as string) : '')
  const socialCount = settings?.social_links && typeof settings.social_links === 'object' ? Object.values(settings.social_links).filter(Boolean).length : 0

  const toggle = (block: Exclude<keyof ContactContent, 'hero'>, title = 'Show on the Contact page', description?: string) => (
    <ToggleRow title={title} description={description} checked={content[block].enabled} onCheckedChange={(checked) => update(`${block}.enabled`, checked)} />
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
          </div>
        </Section>
      </TabPanel>

      <TabPanel value="channels">
        <Section title="Contact cards" description="A card only appears when its detail is filled in under Settings.">
          <div className="grid gap-4">
            {toggle('channels')}
            {(
              [
                ['phone_note', 'Phone', Phone, value('contact_phone'), 'Every day, 9am – 9pm'],
                ['whatsapp_note', 'WhatsApp', MessageSquareText, value('whatsapp_number'), 'Fastest reply, usually within minutes'],
                ['email_note', 'Email', Mail, value('contact_email'), 'We reply within one working day'],
                ['address_note', 'Address', MapPin, value('contact_address'), 'Khulna, near the Sundarbans'],
              ] as [string, string, LucideIcon, string, string][]
            ).map(([key, label, Icon, detail, placeholder]) => (
              <div key={key} className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[13rem_1fr] sm:items-start">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p className={detail ? 'text-xs break-words text-muted-foreground' : 'text-xs text-amber-600 dark:text-amber-400'}>{detail || 'Not set — card hidden'}</p>
                  </div>
                </div>
                {text(`channels.${key}`, 'Line under the detail', { optional: true, placeholder })}
              </div>
            ))}
          </div>
        </Section>
        <SettingsLink tab="contact" what="the phone number, email and address" extra={{ tab: 'whatsapp', label: 'WhatsApp settings' }} />
      </TabPanel>

      <TabPanel value="form">
        <Section title="Form" description="Customers write their name, an optional phone number and a message. Sending opens WhatsApp or their email app with the message ready to send.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">{toggle('form', 'Show the message form', 'Also hidden when neither a WhatsApp number nor an email address is set.')}</div>
            {text('form.eyebrow', 'Small label', { optional: true })}
            {text('form.title', 'Title')}
            {text('form.description', 'Description', { multiline: true, rows: 2, optional: true, className: 'sm:col-span-2' })}
            {text('form.whatsapp_label', 'WhatsApp button text', { placeholder: 'Send on WhatsApp' })}
            {text('form.email_label', 'Email button text', { placeholder: 'Send by email' })}
            {text('form.note', 'Small print', { optional: true, className: 'sm:col-span-2', placeholder: 'We never share your details with anyone.' })}
          </div>
        </Section>
        <Section title="Topics" description={`Up to ${TOPIC_LIMIT} quick choices customers can tap, e.g. “Order & delivery”. Leave the list empty to hide them.`}>
          <ItemList<string> items={content.form.topics} onChange={(topics) => update('form.topics', topics)} max={TOPIC_LIMIT} noun="Topic" blank="" sortable>
            {(_, index) => text(`form.topics.${index}`, 'Topic')}
          </ItemList>
        </Section>
      </TabPanel>

      <TabPanel value="hours">
        <Section title="Opening hours">
          <div className="grid gap-4">
            {toggle('hours')}
            {text('hours.title', 'Title', { placeholder: 'Opening hours' })}
            <ItemList<OpeningHours>
              items={content.hours.items}
              onChange={(items) => update('hours.items', items)}
              max={HOURS_LIMIT}
              noun="Row"
              blank={{ days: '', hours: '' }}
              sortable
            >
              {(_, index) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  {text(`hours.items.${index}.days`, 'Days', { placeholder: 'Saturday – Thursday' })}
                  {text(`hours.items.${index}.hours`, 'Hours', { placeholder: '9:00 am – 9:00 pm or Closed' })}
                </div>
              )}
            </ItemList>
            {text('hours.note', 'Note', { optional: true, placeholder: 'Orders placed online are accepted 24/7.' })}
          </div>
        </Section>
      </TabPanel>

      <TabPanel value="social">
        <Section title="Social card" description={socialCount ? `Shows your ${socialCount} social link${socialCount === 1 ? '' : 's'} from Settings.` : 'No social links are set yet, so this card is hidden.'}>
          <div className="grid gap-4">
            {toggle('social')}
            {text('social.title', 'Title', { placeholder: 'Follow us' })}
            {text('social.text', 'Text', { multiline: true, rows: 2, optional: true })}
          </div>
        </Section>
        <SettingsLink tab="contact" what="your Facebook, Instagram and other social links" />
      </TabPanel>

      <TabPanel value="map">
        <Section title="Map">
          <div className="grid gap-4">
            {toggle('map')}
            {text('map.title', 'Title', { placeholder: 'Find us' })}
            {text('map.embed_url', 'Google Maps embed link', {
              optional: true,
              placeholder: 'https://www.google.com/maps/embed?pb=…',
              description: errors['map.embed_url'] ? undefined : 'In Google Maps, open your place → Share → Embed a map → Copy HTML, and paste it here. Without it, only the Directions button is shown.',
              onChange: (raw) => update('map.embed_url', embedSrc(raw)),
            })}
            {text('map.directions_url', 'Directions link', {
              optional: true,
              placeholder: 'https://maps.app.goo.gl/…',
              description: 'Leave empty to search Google Maps for the address from Settings.',
            })}
            {isMapEmbed(content.map.embed_url) && (
              <iframe src={content.map.embed_url.trim()} title="Map preview" loading="lazy" className="aspect-video w-full max-w-xl rounded-lg border" />
            )}
          </div>
        </Section>
      </TabPanel>

      <TabPanel value="faq">
        <Section title="Heading">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">{toggle('faq')}</div>
            {text('faq.eyebrow', 'Small label', { optional: true })}
            {text('faq.title', 'Title')}
            {text('faq.subtitle', 'Subtitle', { multiline: true, rows: 2, optional: true, className: 'sm:col-span-2' })}
          </div>
        </Section>
        <Section title="Questions" description={`Up to ${FAQ_LIMIT}. The first one starts open.`}>
          <ItemList<Faq> items={content.faq.items} onChange={(items) => update('faq.items', items)} max={FAQ_LIMIT} noun="Question" blank={{ question: '', answer: '' }} sortable>
            {(_, index) => (
              <div className="grid gap-3">
                {text(`faq.items.${index}.question`, 'Question')}
                {text(`faq.items.${index}.answer`, 'Answer', { multiline: true, rows: 3, description: <FormattingHint /> })}
              </div>
            )}
          </ItemList>
        </Section>
      </TabPanel>

      <TabPanel value="seo">
        <Section title="Search result" description="Leave empty to use the store's default title and description for this page.">
          <SeoFields tools={tools} url={PAGE_URL} fallbackTitle="Contact Us" fallbackDescription={content.hero.description} />
        </Section>
      </TabPanel>
    </>
  )
}

function SettingsLink({ tab, what, extra }: { tab: string; what: string; extra?: { tab: string; label: string } }) {
  const admin = isAdmin(useAuthStore((state) => state.user))

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {admin ? `Change ${what} in Settings.` : `Only an admin can change ${what} in Settings.`}
      </p>
      {admin && (
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to={`/settings?tab=${tab}`}>
              <Settings2 /> Open Settings
            </Link>
          </Button>
          {extra && (
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to={`/settings?tab=${extra.tab}`}>{extra.label}</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

"use client";

import { ArrowUpRight, Clock, Mail, MapPin, MessageSquareText, Navigation, Phone, Send, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ComponentType, type FormEvent, type ReactNode, type SVGProps } from "react";
import { toast } from "sonner";

import { RichText } from "@/components/home/rich-text";
import { FacebookIcon, InstagramIcon, LinkedInIcon, TwitterIcon, whatsappHref, WhatsAppIcon, YouTubeIcon } from "@/components/layout/social-icons";
import { Container } from "@/components/shared/container";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageSectionHeading } from "@/components/shared/page-section-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { isMapEmbed, useContactContent, type ContactContent } from "@/lib/contact-content";
import { useSettings } from "@/lib/queries";
import type { PublicSettings as Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

type IconType = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

const mapsSearch = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

function Hero({ hero, title }: { hero: ContactContent["hero"]; title: string }) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-[#0d4a36] via-[#0d4a36] to-forest text-white">
      <div className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-brand/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 size-96 rounded-full bg-gold/15 blur-3xl" />
      <MessageSquareText aria-hidden className="pointer-events-none absolute top-1/2 right-[8%] hidden size-64 -translate-y-1/2 rotate-6 text-white/[0.06] lg:block" strokeWidth={1} />

      <Container className="relative pb-28 md:pb-36">
        <PageBreadcrumb items={[{ label: title }]} className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white [&_[aria-current=page]]:text-white" />
        <div className="max-w-2xl pt-6 md:pt-10">
          {hero.eyebrow && (
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 ring-1 ring-white/15">
              <Sparkles className="size-3.5 text-gold" /> {hero.eyebrow}
            </p>
          )}
          <h1 className="font-heading mt-5 text-4xl leading-[1.08] font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
            {hero.title || title} {hero.highlight && <span className="text-gold">{hero.highlight}</span>}
          </h1>
          {hero.description && <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-white/80 md:text-lg">{hero.description}</p>}
        </div>
      </Container>
    </section>
  );
}

type Channel = { key: string; icon: IconType; label: string; value: string; note: string; href?: string; action: string; external?: boolean; accent: string };

function Channels({ channels, settings }: { channels: ContactContent["channels"]; settings: Settings | undefined }) {
  if (!channels.enabled || !settings) return null;

  const items = [
    settings.contact_phone && {
      key: "phone",
      icon: Phone,
      label: "Call us",
      value: settings.contact_phone,
      note: channels.phone_note,
      href: `tel:${settings.contact_phone.replace(/\s+/g, "")}`,
      action: "Call now",
      accent: "bg-primary text-white shadow-primary/25",
    },
    settings.whatsapp_number && {
      key: "whatsapp",
      icon: WhatsAppIcon,
      label: "WhatsApp",
      value: settings.whatsapp_number,
      note: channels.whatsapp_note,
      href: whatsappHref(settings.whatsapp_number, settings.whatsapp_message),
      action: "Start a chat",
      external: true,
      accent: "bg-[#25d366] text-white shadow-[#25d366]/25",
    },
    settings.contact_email && {
      key: "email",
      icon: Mail,
      label: "Email",
      value: settings.contact_email,
      note: channels.email_note,
      href: `mailto:${settings.contact_email}`,
      action: "Write to us",
      accent: "bg-gold text-white shadow-gold/25",
    },
    settings.contact_address && {
      key: "address",
      icon: MapPin,
      label: "Visit us",
      value: settings.contact_address,
      note: channels.address_note,
      href: mapsSearch(settings.contact_address),
      action: "Open in Maps",
      external: true,
      accent: "bg-forest text-white shadow-forest/25",
    },
  ].filter(Boolean) as Channel[];

  if (!items.length) return null;

  return (
    <Container className="relative z-10 -mt-16 md:-mt-20">
      <ul className={cn("grid gap-4 sm:grid-cols-2", items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 && "lg:grid-cols-3")}>
        {items.map(({ key, icon: Icon, label, value, note, href, action, external, accent }) => (
          <li key={key}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex h-full gap-4 rounded-2xl border bg-card p-5 shadow-xl shadow-black/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-forest/10 sm:flex-col sm:gap-0 sm:p-6"
            >
              <span
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
                  accent,
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col sm:mt-5">
                <span className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">{label}</span>
                <span className="mt-1 font-semibold break-words text-foreground">{value}</span>
                {note && <span className="mt-1 text-sm text-muted-foreground">{note}</span>}
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-primary sm:pt-4 dark:text-brand">
                  {action} <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  );
}

type Draft = { name: string; phone: string; topic: string; message: string };
const EMPTY: Draft = { name: "", phone: "", topic: "", message: "" };

function MessageForm({ form, settings }: { form: ContactContent["form"]; settings: Settings | undefined }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});

  const whatsapp = settings?.whatsapp_number;
  const email = settings?.contact_email;
  if (!form.enabled || (!whatsapp && !email)) return null;

  const set = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const compose = () =>
    [
      `Hello ${settings?.site_name ?? "Mangrove Collection"}!`,
      "",
      `Name: ${draft.name.trim()}`,
      draft.phone.trim() ? `Phone: ${draft.phone.trim()}` : null,
      draft.topic ? `Topic: ${draft.topic}` : null,
      "",
      draft.message.trim(),
    ]
      .filter((line) => line !== null)
      .join("\n");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found: typeof errors = {};
    if (!draft.name.trim()) found.name = "Please tell us your name.";
    if (draft.phone.trim() && !/^\+?[\d\s-]{6,20}$/.test(draft.phone.trim())) found.phone = "Enter a valid phone number, e.g. 01712345678.";
    if (draft.message.trim().length < 10) found.message = "Please write a little more so we can help (at least 10 characters).";
    setErrors(found);
    if (Object.keys(found).length) return;

    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const via = submitter?.value === "email" || !whatsapp ? "email" : "whatsapp";

    if (via === "whatsapp" && whatsapp) {
      window.open(whatsappHref(whatsapp, compose()), "_blank", "noopener,noreferrer");
      toast.success("Your message is ready in WhatsApp — just press send.");
    } else if (email) {
      const subject = `${draft.topic || "Message"} from ${draft.name.trim()}`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(compose())}`;
      toast.success("Your message is ready in your email app — just press send.");
    }
    setDraft(EMPTY);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-xl shadow-black/5 sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-primary/5" />
      <div className="relative">
        {form.eyebrow && <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-gold uppercase">{form.eyebrow}</p>}
        {form.title && <h2 className="font-heading text-2xl leading-tight font-semibold tracking-tight text-foreground md:text-3xl">{form.title}</h2>}
        {form.description && <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{form.description}</p>}

        <form onSubmit={submit} noValidate className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field id="contact-name" label="Your name" error={errors.name}>
            <Input id="contact-name" value={draft.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" maxLength={100} aria-invalid={Boolean(errors.name)} className="h-11" />
          </Field>
          <Field id="contact-phone" label="Phone" optional error={errors.phone}>
            <Input
              id="contact-phone"
              type="tel"
              inputMode="tel"
              value={draft.phone}
              onChange={(e) => set("phone", e.target.value)}
              autoComplete="tel"
              placeholder="01712345678"
              maxLength={20}
              aria-invalid={Boolean(errors.phone)}
              className="h-11"
            />
          </Field>

          {form.topics.length > 0 && (
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm font-medium text-foreground">What is it about?</legend>
              <div className="flex flex-wrap gap-2">
                {form.topics.map((topic) => {
                  const active = draft.topic === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      aria-pressed={active}
                      onClick={() => set("topic", active ? "" : topic)}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm transition-colors",
                        active ? "border-primary bg-primary text-white shadow-md shadow-primary/20" : "bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <Field id="contact-message" label="Message" error={errors.message} className="sm:col-span-2">
            <Textarea
              id="contact-message"
              value={draft.message}
              onChange={(e) => set("message", e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Your order number, the product you're asking about, or anything else we should know."
              aria-invalid={Boolean(errors.message)}
              className="resize-y"
            />
          </Field>

          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
            {whatsapp && (
              <Button type="submit" name="via" value="whatsapp" size="lg" className="rounded-full bg-[#25d366] text-white hover:bg-[#25d366]/90">
                <WhatsAppIcon className="size-4" /> {form.whatsapp_label || "Send on WhatsApp"}
              </Button>
            )}
            {email && (
              <Button type="submit" name="via" value="email" size="lg" variant={whatsapp ? "outline" : "default"} className="rounded-full">
                <Send /> {form.email_label || "Send by email"}
              </Button>
            )}
          </div>
          {form.note && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:col-span-2">
              <ShieldCheck className="size-3.5 text-primary dark:text-brand" /> {form.note}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ id, label, optional, error, className, children }: { id: string; label: string; optional?: boolean; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SideCard({ icon: Icon, title, children }: { icon: IconType; title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border bg-card p-6 sm:p-7">
      <h2 className="font-heading flex items-center gap-2.5 text-lg font-semibold text-foreground">
        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary dark:text-brand">
          <Icon className="size-4.5" />
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Hours({ hours }: { hours: ContactContent["hours"] }) {
  const items = hours.items.filter((item) => item.days.trim() || item.hours.trim());
  if (!hours.enabled || (!items.length && !hours.note)) return null;

  return (
    <SideCard icon={Clock} title={hours.title || "Opening hours"}>
      {items.length > 0 && (
        <dl className="divide-y divide-dashed">
          {items.map((item, index) => (
            <div key={index} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt className="text-sm text-muted-foreground">{item.days}</dt>
              <dd className="text-right text-sm font-semibold text-foreground tabular-nums">{item.hours}</dd>
            </div>
          ))}
        </dl>
      )}
      {hours.note && <p className="mt-4 rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">{hours.note}</p>}
    </SideCard>
  );
}

const SOCIALS: { key: keyof NonNullable<Settings["social_links"]>; label: string; icon: IconType; className: string }[] = [
  { key: "facebook", label: "Facebook", icon: FacebookIcon, className: "hover:bg-[#1877f2]" },
  { key: "instagram", label: "Instagram", icon: InstagramIcon, className: "hover:bg-[#e1306c]" },
  { key: "youtube", label: "YouTube", icon: YouTubeIcon, className: "hover:bg-[#ff0000]" },
  { key: "linkedin", label: "LinkedIn", icon: LinkedInIcon, className: "hover:bg-[#0a66c2]" },
  { key: "twitter", label: "X (Twitter)", icon: TwitterIcon, className: "hover:bg-black" },
];

function Social({ social, settings }: { social: ContactContent["social"]; settings: Settings | undefined }) {
  const links = SOCIALS.filter(({ key }) => settings?.social_links?.[key]);
  if (!social.enabled || !links.length) return null;

  return (
    <SideCard icon={Sparkles} title={social.title || "Follow us"}>
      {social.text && <p className="text-sm leading-relaxed text-muted-foreground">{social.text}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map(({ key, label, icon: Icon, className }) => (
          <a
            key={key}
            href={settings!.social_links![key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={cn("flex size-11 items-center justify-center rounded-xl border bg-background text-foreground transition-all hover:-translate-y-0.5 hover:border-transparent hover:text-white", className)}
          >
            <Icon className="size-5" />
          </a>
        ))}
      </div>
    </SideCard>
  );
}

function MapCard({ map, address }: { map: ContactContent["map"]; address: string | null | undefined }) {
  if (!map.enabled) return null;
  const embed = isMapEmbed(map.embed_url) ? map.embed_url.trim() : null;
  const directions = map.directions_url.trim() || (address ? mapsSearch(address) : "");
  if (!embed && !directions) return null;

  return (
    <section className="overflow-hidden rounded-3xl border bg-card">
      {embed && (
        <iframe
          src={embed}
          title={map.title || "Map"}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block aspect-[4/3] w-full border-0 grayscale-[30%]"
          allowFullScreen
        />
      )}
      <div className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <h2 className="font-heading text-base font-semibold text-foreground">{map.title || "Find us"}</h2>
          {address && <p className="truncate text-sm text-muted-foreground">{address}</p>}
        </div>
        {directions && (
          <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full">
            <a href={directions} target="_blank" rel="noopener noreferrer">
              <Navigation /> Directions
            </a>
          </Button>
        )}
      </div>
    </section>
  );
}

function Faqs({ faq }: { faq: ContactContent["faq"] }) {
  const items = faq.items.filter((item) => item.question.trim() && item.answer.trim());
  if (!faq.enabled || !items.length) return null;

  return (
    <section className="mt-24 bg-surface py-20 md:mt-28">
      <Container>
        <PageSectionHeading eyebrow={faq.eyebrow} title={faq.title} subtitle={faq.subtitle} />
        <Accordion type="single" collapsible defaultValue="faq-0" className="mx-auto max-w-3xl gap-3">
          {items.map((item, index) => (
            <AccordionItem key={index} value={`faq-${index}`} className="rounded-2xl border bg-card px-5 not-last:border-b data-[state=open]:shadow-lg data-[state=open]:shadow-black/5">
              <AccordionTrigger className="py-4 text-base font-semibold text-foreground hover:no-underline">{item.question}</AccordionTrigger>
              <AccordionContent className="pb-5">
                <RichText
                  text={item.answer}
                  className="text-[15px] leading-relaxed text-muted-foreground"
                  strongClassName="font-semibold text-foreground"
                  linkClassName="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary dark:text-brand"
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}

function ContactSkeleton() {
  return (
    <>
      <div className="bg-linear-to-br from-[#0d4a36] to-forest">
        <Container className="space-y-5 pt-20 pb-36">
          <Skeleton className="h-6 w-40 bg-white/10" />
          <Skeleton className="h-14 w-full max-w-xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-lg bg-white/10" />
        </Container>
      </div>
      <Container className="-mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-48 rounded-2xl" />
        ))}
      </Container>
    </>
  );
}

/** The Contact page. Copy is edited on the dashboard's "Contact page" screen; contact details come from the store settings. */
export function ContactView() {
  const { content, page, ready } = useContactContent();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const title = page?.title ?? "Contact us";

  useEffect(() => {
    if (page?.meta_title) document.title = `${page.meta_title} | Mangrove Collection`;
  }, [page]);

  if (!ready || settingsLoading) return <ContactSkeleton />;

  const hasForm = content.form.enabled && Boolean(settings?.whatsapp_number || settings?.contact_email);

  return (
    <div className="pb-4">
      <Hero hero={content.hero} title={title} />
      <Channels channels={content.channels} settings={settings} />
      <Container className="mt-16 md:mt-20">
        <div className="grid items-start gap-6 lg:grid-cols-5 lg:gap-8">
          {hasForm && (
            <div className="lg:col-span-3">
              <MessageForm form={content.form} settings={settings} />
            </div>
          )}
          <aside className={cn("grid gap-6 empty:hidden", hasForm ? "lg:sticky lg:top-28 lg:col-span-2" : "md:grid-cols-2 lg:col-span-5 lg:grid-cols-3")}>
            <Hours hours={content.hours} />
            <Social social={content.social} settings={settings} />
            <MapCard map={content.map} address={settings?.contact_address} />
          </aside>
        </div>
      </Container>
      <Faqs faq={content.faq} />
    </div>
  );
}

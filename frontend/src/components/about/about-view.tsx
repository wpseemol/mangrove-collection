"use client";

import { ArrowRight, Quote, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";

import { HomeIcon } from "@/components/home/home-icon";
import { RichText } from "@/components/home/rich-text";
import { Container } from "@/components/shared/container";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { RemoteImage } from "@/components/shared/remote-image";
import { PageSectionHeading } from "@/components/shared/page-section-heading";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAboutContent, type AboutContent } from "@/lib/about-content";
import { cn } from "@/lib/utils";

const filled = <T extends object>(items: T[]) => items.filter((item) => Object.values(item).some((value) => typeof value === "string" && value.trim()));

function LinkButtons({
  primary,
  secondary,
  tone = "light",
}: {
  primary: [string, string];
  secondary: [string, string];
  tone?: "light" | "dark";
}) {
  const [primaryLabel, primaryUrl] = primary;
  const [secondaryLabel, secondaryUrl] = secondary;
  if (!(primaryLabel && primaryUrl) && !(secondaryLabel && secondaryUrl)) return null;

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {primaryLabel && primaryUrl && (
        <Button asChild size="lg" className={cn("rounded-full", tone === "dark" && "bg-white text-[#0d4a36] hover:bg-white/90")}>
          <Link href={primaryUrl}>
            {primaryLabel} <ArrowRight />
          </Link>
        </Button>
      )}
      {secondaryLabel && secondaryUrl && (
        <Button
          asChild
          size="lg"
          variant="outline"
          className={cn(
            "rounded-full",
            tone === "dark" && "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white dark:border-white/30 dark:bg-transparent dark:hover:bg-white/10",
          )}
        >
          <Link href={secondaryUrl}>{secondaryLabel}</Link>
        </Button>
      )}
    </div>
  );
}

/** Brand-green panel with the logo, used wherever an image is optional and not set. */
function BrandPanel({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-linear-to-br from-[#0d4a36] via-[#0d4a36] to-forest", className)}>
      <div className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-brand/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-24 size-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Image src="/assets/logo.png" alt="" width={200} height={200} className="size-36 rounded-full bg-white/95 object-contain p-3 shadow-2xl ring-8 ring-white/10 sm:size-44" />
      </div>
    </div>
  );
}

function Hero({ hero, title }: { hero: AboutContent["hero"]; title: string }) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-[#0d4a36] via-[#0d4a36] to-forest text-white">
      {hero.image ? (
        <>
          <RemoteImage src={hero.image} alt="" sizes="100vw" priority />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/55 to-black/20" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-brand/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-1/4 size-96 rounded-full bg-gold/15 blur-3xl" />
          <Image
            src="/assets/logo.png"
            alt=""
            width={300}
            height={300}
            priority
            className="pointer-events-none absolute top-1/2 right-[6%] hidden size-72 -translate-y-1/2 rounded-full bg-white/95 object-contain p-5 shadow-2xl ring-[12px] ring-white/10 lg:block"
          />
        </>
      )}

      <Container className="relative pb-24 md:pb-32">
        <PageBreadcrumb items={[{ label: title }]} className="text-white/70 [&_a]:text-white/70 [&_a:hover]:text-white [&_[aria-current=page]]:text-white" />
        <div className="max-w-2xl pt-6 md:pt-12">
          {hero.eyebrow && (
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 ring-1 ring-white/15">
              <Sparkles className="size-3.5 text-gold" /> {hero.eyebrow}
            </p>
          )}
          <h1 className="font-heading mt-5 text-4xl leading-[1.08] font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
            {hero.title || title} {hero.highlight && <span className="text-gold">{hero.highlight}</span>}
          </h1>
          {hero.description && <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-white/80 md:text-lg">{hero.description}</p>}
          <LinkButtons tone="dark" primary={[hero.primary_label, hero.primary_url]} secondary={[hero.secondary_label, hero.secondary_url]} />
        </div>
      </Container>
    </section>
  );
}

function Stats({ stats }: { stats: AboutContent["stats"] }) {
  const items = filled(stats.items);
  if (!stats.enabled || items.length === 0) return null;

  return (
    <Container className="relative z-10 -mt-14 md:-mt-16">
      {/* The 1px gap over a border-coloured background draws the dividers between cells. */}
      <dl
        className={cn(
          "grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-xl shadow-black/5",
          items.length >= 4 ? "md:grid-cols-4" : items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2",
        )}
      >
        {items.map((stat, index) => (
          <div key={index} className={cn("flex flex-col-reverse bg-card px-5 py-6 text-center md:py-8", items.length % 2 === 1 && index === items.length - 1 && "max-md:col-span-2")}>
            <dt className="mt-1 text-xs text-muted-foreground md:text-sm">{stat.label}</dt>
            <dd className="font-heading text-2xl font-semibold text-primary md:text-4xl dark:text-brand">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}

function Story({ story }: { story: AboutContent["story"] }) {
  if (!story.enabled || (!story.title && !story.body)) return null;

  return (
    <Container className="mt-20 md:mt-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-forest/20 sm:aspect-[4/3] lg:aspect-[4/5]">
            {story.image ? <RemoteImage src={story.image} alt={story.title || "Our story"} sizes="(max-width: 1024px) 100vw, 50vw" /> : <BrandPanel />}
          </div>
          <div className="pointer-events-none absolute -bottom-5 -left-5 -z-10 hidden size-40 rounded-3xl border-2 border-dashed border-gold/40 sm:block" />
          {story.quote && (
            <figure className="relative mx-4 -mt-16 rounded-2xl border bg-card p-6 shadow-xl sm:absolute sm:right-[-1.5rem] sm:-bottom-10 sm:mx-0 sm:mt-0 sm:max-w-xs">
              <Quote className="size-7 text-gold" />
              <blockquote className="font-heading mt-2 text-lg leading-snug font-medium text-foreground">“{story.quote}”</blockquote>
              {story.quote_author && <figcaption className="mt-3 text-sm text-muted-foreground">— {story.quote_author}</figcaption>}
            </figure>
          )}
        </div>

        <div className={cn(story.quote && "sm:mt-10 lg:mt-0")}>
          {story.eyebrow && <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold uppercase">{story.eyebrow}</p>}
          {story.title && <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground md:text-4xl">{story.title}</h2>}
          {story.body && (
            <RichText
              text={story.body}
              className="mt-6 space-y-4 text-[15px] leading-7 text-pretty text-muted-foreground md:text-base md:leading-8"
              strongClassName="font-semibold text-foreground"
              linkClassName="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary dark:text-brand"
            />
          )}
        </div>
      </div>
    </Container>
  );
}

function Values({ values }: { values: AboutContent["values"] }) {
  const items = filled(values.items);
  if (!values.enabled || items.length === 0) return null;

  return (
    <section className="mt-24 bg-surface py-20 md:mt-32">
      <Container>
        <PageSectionHeading eyebrow={values.eyebrow} title={values.title} subtitle={values.subtitle} />
        <div className={cn("grid gap-5 sm:grid-cols-2", items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 && "lg:grid-cols-3")}>
          {items.map((item, index) => (
            <article
              key={index}
              className="group relative overflow-hidden rounded-2xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-forest/10"
            >
              <div className="pointer-events-none absolute -top-16 -right-16 size-36 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
              <span className="relative flex size-13 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <HomeIcon name={item.icon} className="size-6" />
              </span>
              <h3 className="font-heading relative mt-6 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Process({ process }: { process: AboutContent["process"] }) {
  const steps = filled(process.steps);
  if (!process.enabled || steps.length === 0) return null;

  return (
    <Container className="mt-24 md:mt-28">
      <PageSectionHeading eyebrow={process.eyebrow} title={process.title} subtitle={process.subtitle} />
      <ol className={cn("relative grid gap-10 sm:grid-cols-2 lg:gap-6", steps.length >= 4 ? "lg:grid-cols-4" : steps.length === 3 && "lg:grid-cols-3")}>
        <span aria-hidden className="absolute top-8 right-[12%] left-[12%] hidden border-t-2 border-dashed border-primary/25 lg:block" />
        {steps.map((step, index) => (
          <li key={index} className="relative flex flex-col items-center text-center">
            <span className="relative flex size-16 items-center justify-center rounded-full bg-card text-primary shadow-lg ring-1 ring-border dark:text-brand">
              <HomeIcon name={step.icon} className="size-7" />
              <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-white ring-4 ring-background">
                {index + 1}
              </span>
            </span>
            <h3 className="font-heading mt-5 text-base font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 max-w-60 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
    </Container>
  );
}

function Milestones({ milestones }: { milestones: AboutContent["milestones"] }) {
  const items = filled(milestones.items);
  if (!milestones.enabled || items.length === 0) return null;

  return (
    <Container className="mt-24 md:mt-32">
      <PageSectionHeading eyebrow={milestones.eyebrow} title={milestones.title} subtitle={milestones.subtitle} />
      <ol className="relative mx-auto max-w-4xl">
        <span aria-hidden className="absolute top-2 bottom-2 left-[1.15rem] w-px bg-linear-to-b from-primary/50 via-primary/25 to-transparent md:left-1/2" />
        {items.map((item, index) => (
          <li key={index} className={cn("relative pb-10 pl-14 last:pb-0 md:w-1/2 md:pl-0", index % 2 === 0 ? "md:pr-12 md:text-right" : "md:ml-auto md:pl-12")}>
            <span
              aria-hidden
              className={cn(
                "absolute top-1 left-2.5 flex size-4 items-center justify-center rounded-full bg-primary ring-4 ring-primary/15 dark:bg-brand",
                index % 2 === 0 ? "md:right-[-0.5rem] md:left-auto" : "md:left-[-0.5rem]",
              )}
            />
            {item.year && <span className="inline-block rounded-full bg-gold/15 px-3 py-0.5 text-xs font-bold tracking-wider text-gold">{item.year}</span>}
            <h3 className="font-heading mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
            {item.text && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.text}</p>}
          </li>
        ))}
      </ol>
    </Container>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Team({ team }: { team: AboutContent["team"] }) {
  const members = filled(team.members);
  if (!team.enabled || members.length === 0) return null;

  return (
    <Container className="mt-24 md:mt-32">
      <PageSectionHeading eyebrow={team.eyebrow} title={team.title} subtitle={team.subtitle} />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {members.map((member, index) => (
          <article key={index} className="group overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-xl hover:shadow-forest/10">
            <div className="relative aspect-square overflow-hidden bg-secondary">
              {member.image ? (
                <RemoteImage src={member.image} alt={member.name} sizes="(max-width: 768px) 50vw, 25vw" className="transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <span className="font-heading absolute inset-0 flex items-center justify-center text-4xl font-semibold text-primary/60">{initials(member.name) || "?"}</span>
              )}
            </div>
            <div className="p-4 sm:p-5">
              <h3 className="font-semibold text-foreground">{member.name}</h3>
              {member.role && <p className="text-xs font-medium tracking-wide text-primary uppercase dark:text-brand">{member.role}</p>}
              {member.bio && <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>}
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}

function Gallery({ gallery }: { gallery: AboutContent["gallery"] }) {
  const images = gallery.images.filter((item) => item.image);
  if (!gallery.enabled || images.length === 0) return null;

  return (
    <Container className="mt-24 md:mt-32">
      <PageSectionHeading eyebrow={gallery.eyebrow} title={gallery.title} subtitle={gallery.subtitle} />
      <div className="grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:gap-4 md:grid-cols-4">
        {images.map((item, index) => (
          <figure
            key={index}
            className={cn("group relative overflow-hidden rounded-2xl bg-muted", index % 5 === 0 && "col-span-2 row-span-2")}
          >
            <RemoteImage
              src={item.image}
              alt={item.caption || ""}
              sizes={index % 5 === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
              className="transition-transform duration-700 group-hover:scale-105"
            />
            {item.caption && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent p-4 pt-10 text-sm font-medium text-white">
                {item.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </Container>
  );
}

function CallToAction({ cta }: { cta: AboutContent["cta"] }) {
  if (!cta.enabled || !cta.title) return null;

  return (
    <Container className="mt-24 md:mt-32">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0d4a36] via-[#0d4a36] to-forest px-6 py-14 text-center text-white sm:px-12 md:py-20">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-brand/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl">{cta.title}</h2>
          {cta.description && <p className="mt-4 text-base leading-relaxed text-white/80">{cta.description}</p>}
          <div className="flex justify-center [&>div]:justify-center">
            <LinkButtons tone="dark" primary={[cta.primary_label, cta.primary_url]} secondary={[cta.secondary_label, cta.secondary_url]} />
          </div>
        </div>
      </div>
    </Container>
  );
}

function AboutSkeleton({ children }: { children?: ReactNode }) {
  return (
    <>
      <div className="bg-linear-to-br from-[#0d4a36] to-forest">
        <Container className="space-y-5 pt-20 pb-32">
          <Skeleton className="h-6 w-32 bg-white/10" />
          <Skeleton className="h-14 w-full max-w-xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-lg bg-white/10" />
        </Container>
      </div>
      {children}
    </>
  );
}

/** The About page. Every block is edited on the dashboard's "About page" screen; defaults fill in until it is saved. */
export function AboutView() {
  const { content, page, ready } = useAboutContent();
  const title = page?.title ?? "About us";

  useEffect(() => {
    if (page?.meta_title) document.title = `${page.meta_title} | Mangrove Collection`;
  }, [page]);

  if (!ready) return <AboutSkeleton />;

  return (
    <div className="pb-4">
      <Hero hero={content.hero} title={title} />
      <Stats stats={content.stats} />
      <Story story={content.story} />
      <Values values={content.values} />
      <Process process={content.process} />
      <Milestones milestones={content.milestones} />
      <Team team={content.team} />
      <Gallery gallery={content.gallery} />
      <CallToAction cta={content.cta} />
    </div>
  );
}

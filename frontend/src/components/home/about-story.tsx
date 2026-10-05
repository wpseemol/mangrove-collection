"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

import { HomeIcon } from "@/components/home/home-icon";
import { RichText } from "@/components/home/rich-text";
import { Container } from "@/components/shared/container";
import { RemoteImage } from "@/components/shared/remote-image";
import { Button } from "@/components/ui/button";
import { paragraphs, useHomeContent } from "@/lib/home-content";
import { cn } from "@/lib/utils";

/**
 * Text cards about the store (sourcing, delivery, quality...). Every card stays in the page markup so
 * search engines can read it; cards past `visible_count` are only hidden until "Read more".
 */
export function InfoCards() {
  const { content, ready } = useHomeContent();
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const info = content.info;
  const cards = info.items.filter((card) => card.title || card.body);
  const visible = info.visible_count > 0 ? info.visible_count : cards.length;
  const collapsible = cards.length > visible;

  if (!ready || !info.enabled || cards.length === 0) return null;

  return (
    <section aria-labelledby={info.title ? `${listId}-title` : undefined} className="mt-24">
      <Container>
        {(info.eyebrow || info.title || info.subtitle) && (
          <header className="mx-auto mb-12 max-w-2xl text-center">
            {info.eyebrow && <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold uppercase">{info.eyebrow}</p>}
            {info.title && (
              <h2 id={`${listId}-title`} className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground md:text-4xl">
                {info.title}
              </h2>
            )}
            {info.subtitle && <p className="mt-4 text-[15px] leading-relaxed text-pretty text-muted-foreground">{info.subtitle}</p>}
          </header>
        )}

        <div id={listId} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <article
              key={index}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-forest p-7 text-white shadow-lg shadow-forest/10 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl hover:shadow-forest/20",
                !expanded && index >= visible && "hidden",
              )}
            >
              <div className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-brand/15 blur-3xl transition-opacity duration-300 group-hover:opacity-80" />
              <div className="relative mb-5 flex items-center gap-3">
                <span className="font-heading text-sm font-semibold tracking-widest text-gold tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <span className="h-px flex-1 bg-linear-to-r from-gold/50 to-transparent" />
              </div>
              {card.title && <h3 className="relative font-heading text-lg leading-snug font-semibold tracking-tight text-balance">{card.title}</h3>}
              {card.body && (
                <RichText
                  text={card.body}
                  className="relative mt-3 text-[15px] leading-7 text-pretty text-white/75"
                  strongClassName="font-semibold text-white"
                  linkClassName="font-medium text-[#9fe0b8] underline decoration-[#9fe0b8]/40 decoration-1 underline-offset-4 transition-colors hover:text-gold hover:decoration-gold focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                />
              )}
            </article>
          ))}
        </div>

        {collapsible && (
          <div className="mt-10 flex justify-center">
            <Button size="lg" variant="outline" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded((open) => !open)} className="min-w-44 rounded-full">
              {expanded ? info.read_less_label || "Show less" : info.read_more_label || "Read more"}
              <ChevronDown className={cn("transition-transform duration-300", expanded && "rotate-180")} />
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}

export function PromiseBand() {
  const { content, ready } = useHomeContent();
  const promise = content.promise;
  const steps = promise.steps.filter((step) => step.title || step.text);

  if (!ready || !promise.enabled) return null;

  return (
    <section className="mt-24 bg-surface">
      <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          {promise.eyebrow && <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold uppercase">{promise.eyebrow}</p>}
          <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-foreground md:text-4xl">{promise.title}</h2>
          {promise.description && <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">{promise.description}</p>}
          {(promise.primary_label || promise.secondary_label) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {promise.primary_label && promise.primary_url && (
                <Button asChild size="lg">
                  <Link href={promise.primary_url}>
                    {promise.primary_label} <ArrowRight />
                  </Link>
                </Button>
              )}
              {promise.secondary_label && promise.secondary_url && (
                <Button asChild size="lg" variant="outline">
                  <Link href={promise.secondary_url}>{promise.secondary_label}</Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {steps.length > 0 && (
          <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-4 rounded-2xl border bg-card p-5">
                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                  <HomeIcon name={step.icon} className="size-5" />
                  <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-semibold">{index + 1}</span>
                </span>
                <span>
                  <span className="block font-semibold text-foreground">{step.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </Container>
    </section>
  );
}

/** Short "Our story" teaser at the bottom of the home page, linking to the full About page. */
export function OurStory() {
  const { content, ready } = useHomeContent();
  const story = content.story;
  const stats = story.stats.filter((stat) => stat.value || stat.label);

  if (!ready || !story.enabled || (!story.title && !story.body)) return null;

  return (
    <Container className="mt-20">
      <div className="grid overflow-hidden rounded-3xl border bg-card lg:grid-cols-[1fr_1.1fr]">
        <div className="relative min-h-64 overflow-hidden bg-linear-to-br from-[#0d4a36] via-[#0d4a36] to-forest sm:min-h-80">
          {story.image ? (
            <>
              <RemoteImage src={story.image} alt={story.title || "Our story"} sizes="(max-width: 1024px) 100vw, 45vw" />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </>
          ) : (
            <>
              <div className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-brand/25 blur-3xl" />
              <div className="pointer-events-none absolute -right-16 -bottom-24 size-72 rounded-full bg-gold/20 blur-3xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/assets/logo.png"
                  alt=""
                  width={200}
                  height={200}
                  className="size-36 rounded-full bg-white/95 object-contain p-3 shadow-2xl ring-8 ring-white/10 sm:size-44"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          {story.eyebrow && <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold uppercase">{story.eyebrow}</p>}
          {story.title && (
            <h2 className="font-heading text-2xl leading-tight font-semibold tracking-tight text-foreground md:text-3xl">{story.title}</h2>
          )}
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
            {paragraphs(story.body).map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          {stats.length > 0 && (
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t pt-6">
              {stats.map((stat, index) => (
                <div key={index} className="min-w-0">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-heading text-xl font-semibold text-primary sm:text-2xl">{stat.value}</dd>
                  <dd className="mt-0.5 text-xs leading-snug text-muted-foreground sm:text-sm">{stat.label}</dd>
                </div>
              ))}
            </dl>
          )}

          {story.button_label && story.button_url && (
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href={story.button_url}>
                  {story.button_label} <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

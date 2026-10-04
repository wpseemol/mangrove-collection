"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HomeIcon } from "@/components/home/home-icon";
import { Container } from "@/components/shared/container";
import { RemoteImage } from "@/components/shared/remote-image";
import { Button } from "@/components/ui/button";
import { paragraphs, useHomeContent } from "@/lib/home-content";

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

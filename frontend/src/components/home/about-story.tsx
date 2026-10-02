"use client";

import { ArrowRight, Fish, Leaf, PackageCheck } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { usePage } from "@/lib/queries";

const STEPS = [
  { icon: Fish, title: "Collected at the source", text: "Local collectors gather fish, crab, prawn and honey straight from the Sundarbans." },
  { icon: Leaf, title: "Kept natural", text: "No shortcuts — products are cleaned, sorted and kept as close to nature as possible." },
  { icon: PackageCheck, title: "Packed & delivered", text: "Carefully packed and sent to your door anywhere in Bangladesh." },
];

export function StoryBand() {
  return (
    <section className="mt-24 bg-surface">
      <Container className="grid gap-12 py-20 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold uppercase">Our promise</p>
          <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-foreground md:text-4xl">
            From the heart of the Sundarbans to your kitchen.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Mangrove Collection sources directly from the Sundarbans, so you get honest, fresh and natural products without the middlemen.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/about">
                Read our story <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>

        <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="flex gap-4 rounded-2xl border bg-card p-5">
              <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <Icon className="size-5" />
                <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-semibold">{index + 1}</span>
              </span>
              <span>
                <span className="block font-semibold text-foreground">{title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/**
 * Story blocks come from the dashboard-managed `home` page: each section has
 * a `title` and a plain-text `description` (one paragraph per line).
 */
export function AboutStory() {
  const { data: page } = usePage("home");

  const sections = (page?.sections ?? []).filter((section) => section.title || section.description);

  if (!sections.length && !page?.content) return null;

  return (
    <Container className="mt-20">
      <SectionHeading eyebrow="Why Mangrove Collection" title={page?.title && page.title.toLowerCase() !== "home" ? page.title : "Good to know"} />
      {page?.content && <div className="prose-content mx-auto mb-10 max-w-3xl" dangerouslySetInnerHTML={{ __html: page.content }} />}
      {sections.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((section, index) => (
            <article key={section.id ?? index} className="rounded-2xl border bg-card p-6 md:p-8">
              {section.title && <h3 className="font-heading mb-3 text-xl font-semibold text-foreground">{section.title}</h3>}
              <div className="space-y-2 text-[15px] leading-relaxed text-muted-foreground">
                {String(section.description ?? "")
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </Container>
  );
}

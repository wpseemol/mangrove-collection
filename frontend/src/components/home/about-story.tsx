"use client";

import { Container } from "@/components/shared/container";
import { usePage } from "@/lib/queries";

/**
 * Story blocks come from the dashboard-managed `home` page: each section has
 * a `title` and a plain-text `description` (one paragraph per line).
 */
export function AboutStory() {
  const { data: page } = usePage("home");

  const sections = (page?.sections ?? []).filter((section) => section.title || section.description);

  if (!sections.length && !page?.content) return null;

  return (
    <section className="mt-16 bg-surface py-10">
      <Container className="space-y-8">
        {page?.content && <div className="prose-content" dangerouslySetInnerHTML={{ __html: page.content }} />}

        {sections.map((section, index) => (
          <article key={section.id ?? index}>
            {section.title && <h2 className="mb-3 text-xl font-semibold text-gray-900">{section.title}</h2>}
            <div className="space-y-2 text-[15px] leading-relaxed text-gray-700">
              {String(section.description ?? "")
                .split(/\n+/)
                .filter(Boolean)
                .map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
            </div>
          </article>
        ))}
      </Container>
    </section>
  );
}

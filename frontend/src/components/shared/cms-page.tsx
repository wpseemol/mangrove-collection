"use client";

import { FileText } from "lucide-react";
import { useEffect } from "react";

import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { usePage } from "@/lib/queries";

export function CmsPageView({ slug, title, children }: { slug: string; title: string; children?: React.ReactNode }) {
  const { data: page, isLoading, isError } = usePage(slug);

  useEffect(() => {
    if (page?.meta_title) document.title = `${page.meta_title} | Mangrove Collection`;
  }, [page]);

  const heading = page?.title ?? title;
  const sections = page?.sections?.filter((section) => section.title || section.description) ?? [];

  return (
    <Container className="max-w-4xl">
      <PageBreadcrumb items={[{ label: heading }]} />
      <h1 className="font-heading mb-6 text-2xl font-medium tracking-[0.12em] text-gray-900 uppercase">{heading}</h1>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ) : isError || (!page?.content && sections.length === 0) ? (
        !children && <EmptyState icon={FileText} title="Content coming soon" description="This page hasn't been published yet." />
      ) : (
        <>
          {page?.content && <div className="prose-content" dangerouslySetInnerHTML={{ __html: page.content }} />}
          {sections.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {sections.map((section, index) => (
                <div key={section.id ?? index} className="rounded-sm bg-surface p-5">
                  {section.title && <h2 className="mb-2 font-medium text-gray-900">{section.title}</h2>}
                  {section.description?.split("\n").map((line, i) => (
                    <p key={i} className="text-sm leading-relaxed text-gray-700">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {children}
    </Container>
  );
}

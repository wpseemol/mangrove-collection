"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { IconGlyph } from "@/components/shared/icon-glyph";
import { RemoteImage } from "@/components/shared/remote-image";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomeContent } from "@/lib/home-content";
import { useCategories } from "@/lib/queries";
import type { Category } from "@/lib/types";

export const CATEGORY_GRID = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";

export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link href={`/shop?category=${category.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-black/5">
      <span className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {!category.image && category.icon_nodes ? (
          <span className="flex size-full items-center justify-center bg-secondary text-primary">
            <IconGlyph nodes={category.icon_nodes} strokeWidth={1.5} className="size-14 transition-transform duration-500 group-hover:scale-110" />
          </span>
        ) : (
          <RemoteImage src={category.image} alt={category.name} sizes="(max-width: 640px) 50vw, 240px" className="transition-transform duration-500 group-hover:scale-105" />
        )}
      </span>
      <span className="flex items-center justify-between gap-2 p-3.5">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">{category.name}</span>
          {category.products_count !== undefined && (
            <span className="block text-xs text-muted-foreground">
              {category.products_count} product{category.products_count === 1 ? "" : "s"}
            </span>
          )}
        </span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white">
          <ArrowUpRight className="size-4" />
        </span>
      </span>
    </Link>
  );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={CATEGORY_GRID}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-2 p-3.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategorySection() {
  const { data: categories, isLoading } = useCategories();
  const { content, ready } = useHomeContent();
  const section = content.categories;

  if ((ready && !section.enabled) || (!isLoading && !categories?.length)) return null;

  return (
    <Container className="mt-20">
      {ready ? (
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} align="left">
          {section.link_label && (
            <Link href="/categories" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {section.link_label} <ArrowRight className="size-4" />
            </Link>
          )}
        </SectionHeading>
      ) : (
        <Skeleton className="mb-8 h-14 w-72 max-w-full" />
      )}
      {isLoading ? (
        <CategoryGridSkeleton />
      ) : (
        <div className={CATEGORY_GRID}>
          {categories?.slice(0, 12).map((category) => (
            <CategoryTile key={category.id} category={category} />
          ))}
        </div>
      )}
    </Container>
  );
}

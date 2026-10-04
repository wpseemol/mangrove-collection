"use client";

import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { clamp, type ProductRowBlock } from "@/lib/home-content";
import type { Product } from "@/lib/types";

/** Saved numbers come from free-form JSON, so fall back to the defaults when they are out of range. */
export function productRowSettings(section: ProductRowBlock, fallback: ProductRowBlock) {
  return {
    limit: clamp(section.limit, 1, 60, fallback.limit),
    rows: clamp(section.rows, 1, 4, fallback.rows),
    delaySeconds: clamp(section.autoplay_seconds, 0, 30, fallback.autoplay_seconds),
    slider: section.layout !== "grid",
  };
}

/** Columns per row at each breakpoint; must match `PAGE_GRID` and the single-row slide widths. */
const COLUMN_QUERIES: [string, number][] = [
  ["(min-width: 1280px)", 5],
  ["(min-width: 1024px)", 4],
  ["(min-width: 640px)", 3],
];
const PAGE_GRID = "grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5";

const subscribeColumns = (onChange: () => void) => {
  const lists = COLUMN_QUERIES.map(([query]) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
};
const currentColumns = () => COLUMN_QUERIES.find(([query]) => window.matchMedia(query).matches)?.[1] ?? 2;

function useColumns() {
  return useSyncExternalStore(subscribeColumns, currentColumns, () => 5);
}

/**
 * One row slides card by card. Several rows slide a page at a time, and each page fills
 * row by row (5 then 1 for six products on a wide screen), like the regular product grid.
 */
export function ProductSlider({ products, rows, delaySeconds }: { products: Product[]; rows: number; delaySeconds: number }) {
  const columns = useColumns();
  const [plugins] = useState(() =>
    delaySeconds > 0 && typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? [Autoplay({ delay: delaySeconds * 1000, stopOnInteraction: false, stopOnMouseEnter: true })]
      : [],
  );

  const perSlide = rows === 1 ? 1 : columns * rows;
  const slides: Product[][] = [];
  for (let i = 0; i < products.length; i += perSlide) slides.push(products.slice(i, i + perSlide));

  return (
    <Carousel opts={{ align: "start", loop: slides.length > 1 }} plugins={plugins}>
      <CarouselContent className="-ml-3 sm:-ml-4 md:-ml-5">
        {rows === 1
          ? products.map((product) => (
              <CarouselItem key={product.id} className="basis-1/2 pl-3 sm:basis-1/3 sm:pl-4 md:pl-5 lg:basis-1/4 xl:basis-1/5">
                <ProductCard product={product} />
              </CarouselItem>
            ))
          : slides.map((slide) => (
              <CarouselItem key={slide[0].id} className="pl-3 sm:pl-4 md:pl-5">
                <div className={PAGE_GRID}>
                  {slide.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </CarouselItem>
            ))}
      </CarouselContent>
      <CarouselPrevious className="-left-3 hidden size-10 bg-background shadow-md sm:not-disabled:flex" />
      <CarouselNext className="-right-3 hidden size-10 bg-background shadow-md sm:not-disabled:flex" />
    </Carousel>
  );
}

/** Heading plus a slider or grid; shared by the popular and new-arrival rows. */
export function ProductRowSection({
  section,
  ready,
  products,
  viewAllHref,
  rows,
  delaySeconds,
  slider,
}: {
  section: ProductRowBlock;
  ready: boolean;
  products?: Product[];
  viewAllHref: string;
  rows: number;
  delaySeconds: number;
  slider: boolean;
}) {
  return (
    <Container className="mt-20">
      {ready ? (
        <SectionHeading eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} align="left">
          {section.link_label && (
            <Link href={viewAllHref} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {section.link_label} <ArrowRight className="size-4" />
            </Link>
          )}
        </SectionHeading>
      ) : (
        <Skeleton className="mb-8 h-14 w-72 max-w-full" />
      )}
      {slider && products?.length ? (
        <ProductSlider key={`${rows}-${delaySeconds}`} products={products} rows={rows} delaySeconds={delaySeconds} />
      ) : (
        <ProductGrid products={products} loading={!products} skeletons={5 * (slider ? rows : 1)} />
      )}
    </Container>
  );
}

"use client";

import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

/** Products are laid out in columns of `rows` cards; each column is one slide. */
export function ProductSlider({ products, rows, delaySeconds }: { products: Product[]; rows: number; delaySeconds: number }) {
  const [plugins] = useState(() =>
    delaySeconds > 0 && typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? [Autoplay({ delay: delaySeconds * 1000, stopOnInteraction: false, stopOnMouseEnter: true })]
      : [],
  );

  const columns: Product[][] = [];
  for (let i = 0; i < products.length; i += rows) columns.push(products.slice(i, i + rows));

  return (
    <Carousel opts={{ align: "start", loop: columns.length > 1 }} plugins={plugins}>
      <CarouselContent className="-ml-3 sm:-ml-4 md:-ml-5">
        {columns.map((column) => (
          <CarouselItem key={column[0].id} className="basis-1/2 pl-3 sm:basis-1/3 sm:pl-4 md:pl-5 lg:basis-1/4 xl:basis-1/5">
            {/* Columns stretch to the tallest one and split it into equal rows, so every card is the same height. */}
            <div className="grid h-full gap-3 sm:gap-4 md:gap-5" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
              {column.map((product) => (
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

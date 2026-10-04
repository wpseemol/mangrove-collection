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
import { clamp, DEFAULT_HOME, useHomeContent } from "@/lib/home-content";
import { type ProductFilters, useProducts } from "@/lib/queries";
import type { Product } from "@/lib/types";

function ProductSlider({ products, rows, delaySeconds }: { products: Product[]; rows: number; delaySeconds: number }) {
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
            <div className="grid gap-3 sm:gap-4 md:gap-5">
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

export function ProductSection({
  block,
  filters,
  viewAllHref,
}: {
  /** Which dashboard-managed block to use. */
  block: "popular" | "latest";
  filters: ProductFilters;
  viewAllHref: string;
}) {
  const { content, ready } = useHomeContent();
  const section = content[block];
  const fallback = DEFAULT_HOME[block];
  const limit = clamp(section.limit, 1, 60, fallback.limit);
  const rows = clamp(section.rows, 1, 4, fallback.rows);
  const delaySeconds = clamp(section.autoplay_seconds, 0, 30, fallback.autoplay_seconds);
  const slider = section.layout !== "grid";

  const { data, isLoading } = useProducts({ per_page: limit, ...filters }, ready && section.enabled);
  const products = data?.data;

  if ((ready && !section.enabled) || (ready && !isLoading && !products?.length)) return null;

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

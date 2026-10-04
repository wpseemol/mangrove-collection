"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomeContent } from "@/lib/home-content";
import { type ProductFilters, useProducts } from "@/lib/queries";

export function ProductSection({
  block,
  filters,
  viewAllHref,
}: {
  /** Which dashboard-managed heading to use. */
  block: "popular" | "latest";
  filters: ProductFilters;
  viewAllHref: string;
}) {
  const { content, ready } = useHomeContent();
  const section = content[block];
  const { data, isLoading } = useProducts({ per_page: 10, ...filters }, !ready || section.enabled);

  if ((ready && !section.enabled) || (!isLoading && !data?.data.length)) return null;

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
      <ProductGrid products={data?.data} loading={isLoading} skeletons={5} />
    </Container>
  );
}

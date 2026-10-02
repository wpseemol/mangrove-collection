"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { type ProductFilters, useProducts } from "@/lib/queries";

export function ProductSection({
  eyebrow,
  title,
  subtitle,
  filters,
  viewAllHref,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  filters: ProductFilters;
  viewAllHref: string;
}) {
  const { data, isLoading } = useProducts({ per_page: 10, ...filters });

  if (!isLoading && !data?.data.length) return null;

  return (
    <Container className="mt-20">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} align="left">
        <Link href={viewAllHref} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
          View all <ArrowRight className="size-4" />
        </Link>
      </SectionHeading>
      <ProductGrid products={data?.data} loading={isLoading} skeletons={5} />
    </Container>
  );
}

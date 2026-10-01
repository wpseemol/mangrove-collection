"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { type ProductFilters, useProducts } from "@/lib/queries";

export function ProductSection({
  title,
  icon,
  filters,
  viewAllHref,
}: {
  title: string;
  icon?: string;
  filters: ProductFilters;
  viewAllHref: string;
}) {
  const { data, isLoading } = useProducts({ per_page: 12, ...filters });

  if (!isLoading && !data?.data.length) return null;

  return (
    <Container className="mt-12">
      <SectionHeading title={title}>{icon && <span className="ml-1">{icon}</span>}</SectionHeading>
      <ProductGrid products={data?.data} loading={isLoading} skeletons={6} />
      <div className="mt-6 text-center">
        <Link href={viewAllHref} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
    </Container>
  );
}

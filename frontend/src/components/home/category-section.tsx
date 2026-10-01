"use client";

import Link from "next/link";

import { Container } from "@/components/shared/container";
import { RemoteImage } from "@/components/shared/remote-image";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/lib/queries";
import type { Category } from "@/lib/types";

export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group flex w-40 flex-col items-center gap-2 rounded-sm border bg-white p-2.5 text-center shadow-sm transition-shadow hover:border-primary/40 hover:shadow-md sm:w-44"
    >
      <span className="relative block h-16 w-full overflow-hidden rounded-sm bg-muted">
        <RemoteImage src={category.image} alt={category.name} sizes="176px" className="transition-transform group-hover:scale-105" />
      </span>
      <span className="text-sm font-medium text-gray-800 group-hover:text-primary">{category.name}</span>
    </Link>
  );
}

export function CategorySection() {
  const { data: categories, isLoading } = useCategories();

  if (!isLoading && !categories?.length) return null;

  return (
    <Container className="mt-12">
      <SectionHeading title="Our Product Category" subtitle="Get your desired product from a featured category" />
      <div className="flex flex-wrap justify-center gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-40 sm:w-44" />)
          : categories?.map((category) => <CategoryTile key={category.id} category={category} />)}
      </div>
    </Container>
  );
}

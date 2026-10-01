"use client";

import { LayoutGrid } from "lucide-react";

import { CategoryTile } from "@/components/home/category-section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/lib/queries";

export function CategoriesContent() {
  const { data: categories, isLoading } = useCategories();

  return (
    <Container>
      <PageBreadcrumb items={[{ label: "Categories" }]} />
      <SectionHeading title="Our Product Category" subtitle="Get your desired product from a featured category" />
      {!isLoading && !categories?.length ? (
        <EmptyState icon={LayoutGrid} title="No categories yet" description="Categories will appear here once they are added." />
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 w-40 sm:w-44" />)
            : categories?.map((category) => <CategoryTile key={category.id} category={category} />)}
        </div>
      )}
    </Container>
  );
}

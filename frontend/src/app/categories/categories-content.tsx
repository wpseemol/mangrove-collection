"use client";

import { LayoutGrid } from "lucide-react";

import { CATEGORY_GRID, CategoryGridSkeleton, CategoryTile } from "@/components/home/category-section";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-breadcrumb";
import { useCategories } from "@/lib/queries";

export function CategoriesContent() {
  const { data: categories, isLoading } = useCategories();

  return (
    <>
      <PageHeader title="Categories" description="Find exactly what you're looking for — browse our produce by category." breadcrumb={[{ label: "Categories" }]} />
      <Container>
        {isLoading ? (
          <CategoryGridSkeleton count={12} />
        ) : !categories?.length ? (
          <EmptyState icon={LayoutGrid} title="No categories yet" description="Categories will appear here once they are added." />
        ) : (
          <div className={CATEGORY_GRID}>
            {categories.map((category) => (
              <CategoryTile key={category.id} category={category} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

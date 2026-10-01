import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ProductCard } from "./product-card";

const GRID = {
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

export function ProductGrid({
  products,
  loading,
  columns = 6,
  layout = "grid",
  skeletons = 12,
  emptyMessage = "No products found.",
}: {
  products?: Product[];
  loading?: boolean;
  columns?: keyof typeof GRID;
  layout?: "grid" | "list";
  skeletons?: number;
  emptyMessage?: string;
}) {
  if (loading && !products) {
    return (
      <div className={cn("grid gap-3 md:gap-4", GRID[columns])}>
        {Array.from({ length: skeletons }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-sm shadow-[0_1px_6px_rgba(0,0,0,0.08)]">
            <Skeleton className="aspect-[6/5] rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="mx-auto h-4 w-3/4" />
              <Skeleton className="mx-auto h-3 w-1/3" />
              <Skeleton className="mx-auto h-8 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return <EmptyState icon={PackageSearch} title={emptyMessage} description="Try a different filter or check back soon." />;
  }

  if (layout === "list") {
    return (
      <div className="flex flex-col gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} layout="list" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3 md:gap-4", GRID[columns])}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

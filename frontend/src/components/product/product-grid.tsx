import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ProductCard } from "./product-card";

const GRID = {
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  3: "grid-cols-2 sm:grid-cols-3",
};

export function ProductGrid({
  products,
  loading,
  columns = 5,
  layout = "grid",
  skeletons = 10,
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
      <div className={cn("grid gap-3 sm:gap-4 md:gap-5", GRID[columns])}>
        {Array.from({ length: skeletons }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border">
            <Skeleton className="aspect-square rounded-none" />
            <div className="space-y-2.5 p-4">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-4 h-9 w-full" />
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
      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} layout="list" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3 sm:gap-4 md:gap-5", GRID[columns])}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

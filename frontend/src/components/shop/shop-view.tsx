"use client";

import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/shared/container";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { type ProductFilters, useProducts } from "@/lib/queries";
import { cn } from "@/lib/utils";

import { ShopFilters, type ShopFilterValues } from "./shop-filters";

const SORT_OPTIONS = [
  { value: "latest", label: "Newest first" },
  { value: "popular", label: "Most popular" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
] as const;

export function ShopView({
  title = "Products",
  baseFilters = {},
}: {
  title?: string;
  baseFilters?: ProductFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const categories = params.get("category")?.split(",").filter(Boolean) ?? [];
  const minPrice = params.get("min_price") ?? "";
  const maxPrice = params.get("max_price") ?? "";
  const sort = (params.get("sort") ?? "latest") as ProductFilters["sort"];
  const page = Number(params.get("page") ?? 1) || 1;
  const view = params.get("view") === "list" ? "list" : "grid";

  const { data, isLoading, isFetching } = useProducts({
    ...baseFilters,
    q: q || undefined,
    category: categories.join(",") || undefined,
    min_price: minPrice || undefined,
    max_price: maxPrice || undefined,
    sort,
    page,
    per_page: 20,
  });

  const update = (changes: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const onFilterChange = (changes: Partial<ShopFilterValues>) =>
    update({
      ...(changes.categories !== undefined ? { category: changes.categories.join(",") } : {}),
      ...(changes.minPrice !== undefined ? { min_price: changes.minPrice } : {}),
      ...(changes.maxPrice !== undefined ? { max_price: changes.maxPrice } : {}),
    });

  const filterValues: ShopFilterValues = { categories, minPrice, maxPrice };
  const filtersKey = `${categories.join(",")}|${minPrice}|${maxPrice}`;

  return (
    <Container>
      <PageBreadcrumb items={[{ label: title }]} />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <ShopFilters key={filtersKey} values={filterValues} onChange={onFilterChange} />
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-gray-800 pb-2">
            <div className="flex items-center gap-1">
              <Button
                size="icon-sm"
                variant={view === "grid" ? "default" : "outline"}
                aria-label="Grid view"
                onClick={() => update({ view: null }, false)}
              >
                <LayoutGrid />
              </Button>
              <Button
                size="icon-sm"
                variant={view === "list" ? "default" : "outline"}
                aria-label="List view"
                onClick={() => update({ view: "list" }, false)}
              >
                <List />
              </Button>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <ShopFilters key={filtersKey} values={filterValues} onChange={onFilterChange} />
                </div>
              </SheetContent>
            </Sheet>

            <p className={cn("text-xs text-muted-foreground sm:text-sm", isFetching && "opacity-60")}>
              {data ? `${data.meta.total} product${data.meta.total === 1 ? "" : "s"}` : ""}
            </p>

            <div className="ml-auto">
              <Select value={sort} onValueChange={(value) => update({ sort: value === "latest" ? null : value })}>
                <SelectTrigger size="sm" className="w-44" aria-label="Sort products">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {q && (
            <div className="mb-4 flex items-center gap-2 text-sm">
              <span>
                Search results for <strong>“{q}”</strong>
              </span>
              <Button variant="ghost" size="icon-xs" aria-label="Clear search" onClick={() => update({ q: null })}>
                <X />
              </Button>
            </div>
          )}

          <ProductGrid products={data?.data} loading={isLoading} columns={5} layout={view} skeletons={10} />

          <SimplePagination
            page={data?.meta.current_page ?? page}
            lastPage={data?.meta.last_page ?? 1}
            onChange={(target) => {
              update({ page: String(target) }, false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </section>
      </div>
    </Container>
  );
}

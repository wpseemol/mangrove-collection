"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/lib/queries";

const VISIBLE_CATEGORIES = 6;

export type ShopFilterValues = {
  categories: string[];
  minPrice: string;
  maxPrice: string;
};

export function ShopFilters({
  values,
  onChange,
}: {
  values: ShopFilterValues;
  onChange: (values: Partial<ShopFilterValues>) => void;
}) {
  const { data: categories, isLoading } = useCategories();
  const [showAll, setShowAll] = useState(false);
  const [price, setPrice] = useState({ min: values.minPrice, max: values.maxPrice });

  const visible = showAll ? categories : categories?.slice(0, VISIBLE_CATEGORIES);
  const hasFilters = values.categories.length > 0 || values.minPrice || values.maxPrice;

  const toggleCategory = (slug: string, checked: boolean) =>
    onChange({ categories: checked ? [...values.categories, slug] : values.categories.filter((c) => c !== slug) });

  const applyPrice = () => onChange({ minPrice: price.min, maxPrice: price.max });

  return (
    <div className="space-y-7 rounded-sm bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.1)]">
      <section>
        <h2 className="mb-3 text-base font-medium tracking-wide text-gray-800 uppercase">Categories</h2>
        <ul className="space-y-2.5">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-5 w-full" />
              </li>
            ))}
          {visible?.map((category) => {
            const id = `cat-${category.slug}`;
            return (
              <li key={category.id} className="flex items-start gap-2.5">
                <Checkbox
                  id={id}
                  checked={values.categories.includes(category.slug)}
                  onCheckedChange={(checked) => toggleCategory(category.slug, checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor={id} className="flex flex-1 cursor-pointer justify-between gap-2 text-sm text-gray-600">
                  <span>{category.name}</span>
                  <span>({category.products_count ?? 0})</span>
                </label>
              </li>
            );
          })}
        </ul>
        {(categories?.length ?? 0) > VISIBLE_CATEGORIES && (
          <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "See less" : "See more..."}
          </Button>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-medium tracking-wide text-gray-800 uppercase">Price</h2>
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            applyPrice();
          }}
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="min"
              aria-label="Minimum price"
              value={price.min}
              onChange={(e) => setPrice((p) => ({ ...p, min: e.target.value }))}
              className="h-8"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="max"
              aria-label="Maximum price"
              value={price.max}
              onChange={(e) => setPrice((p) => ({ ...p, max: e.target.value }))}
              className="h-8"
            />
          </div>
          <Button type="submit" size="sm" className="w-full">
            Apply
          </Button>
        </form>
      </section>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => {
            setPrice({ min: "", max: "" });
            onChange({ categories: [], minPrice: "", maxPrice: "" });
          }}
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}

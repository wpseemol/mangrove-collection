"use client";

import { useSearchParams } from "next/navigation";
import { type ComponentProps, Suspense } from "react";

import { BlogListing } from "@/components/blog/blog-listing";
import { isThinListing, listingFilters } from "@/app/blog/listing-params";
import { useBlogPosts } from "@/lib/queries";

type Props = Omit<ComponentProps<typeof BlogListing>, "filters" | "loading">;

const DEFAULT_FILTERS = { sort: "latest", page: 1 } as const;

/** The exported HTML holds page 1; search, tag, sort and later pages are fetched in the browser. */
function FilteredListing(props: Props) {
  const searchParams = useSearchParams();
  const filters = listingFilters(Object.fromEntries(searchParams));
  const filtered = isThinListing(filters) || filters.page > 1;
  const { data, isPending } = useBlogPosts(
    { q: filters.q, tag: filters.tag, sort: filters.sort, page: filters.page, category: props.activeCategory?.slug, per_page: 12 },
    filtered,
  );

  if (!filtered) return <BlogListing {...props} filters={filters} />;
  return <BlogListing {...props} featured={undefined} posts={data ?? null} loading={isPending} filters={filters} />;
}

export function BlogListingPage(props: Props) {
  return (
    <Suspense fallback={<BlogListing {...props} filters={DEFAULT_FILTERS} />}>
      <FilteredListing {...props} />
    </Suspense>
  );
}

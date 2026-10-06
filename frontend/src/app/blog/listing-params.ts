import type { ListingFilters } from "@/components/blog/blog-listing";
import { postHref } from "@/lib/blog";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

export function listingFilters(params: Record<string, string | string[] | undefined>): ListingFilters {
  const page = Number(first(params.page));
  return {
    q: first(params.q)?.slice(0, 100),
    tag: first(params.tag)?.slice(0, 50),
    sort: first(params.sort) === "popular" ? "popular" : "latest",
    page: Number.isInteger(page) && page > 1 && page < 1000 ? page : 1,
  };
}

export const isThinListing = (filters: ListingFilters) => Boolean(filters.q || filters.tag || filters.sort !== "latest");

export function listingJsonLd({ name, description, path, posts, crumbs }: { name: string; description: string; path: string; posts: BlogPost[]; crumbs: { name: string; path: string }[] }) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name,
        description,
        url,
        isPartOf: { "@type": "Blog", name: `${SITE_NAME} Blog`, url: absoluteUrl("/blog/") },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.map((post, index) => ({ "@type": "ListItem", position: index + 1, url: absoluteUrl(postHref(post.slug)), name: post.title })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: absoluteUrl(crumb.path) })),
      },
    ],
  };
}

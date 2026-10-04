import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import { BlogListing } from "@/components/blog/blog-listing";
import { blogCategoryHref } from "@/lib/blog";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { getBlogCategories, getBlogPosts, settle } from "@/lib/server-api";

import { canonicalPath, isThinListing, listingFilters, listingJsonLd, type SearchParams } from "./listing-params";

const TITLE = "Blog — Sundarbans Honey, Fish Guides & Healthy Recipes";
const DESCRIPTION =
  "Honey health benefits, sea and river fish buying guides, crab and prawn recipes, storage tips and stories from the Sundarbans, written by the Mangrove Collection team.";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const filters = listingFilters(await searchParams);
  return pageMetadata({
    title: filters.page > 1 ? `${TITLE} (page ${filters.page})` : TITLE,
    description: DESCRIPTION,
    path: canonicalPath("/blog/", filters),
    noindex: isThinListing(filters),
    keywords: ["Sundarbans honey benefits", "how to choose fresh fish", "hilsa recipe", "mud crab recipe", "raw honey storage", "Mangrove Collection blog"],
  });
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const legacyCategory = typeof params.category === "string" ? params.category : undefined;
  if (legacyCategory) permanentRedirect(blogCategoryHref(legacyCategory));

  const filters = listingFilters(params);
  const showFeatured = !isThinListing(filters) && filters.page === 1;

  const [categories, posts, featured] = await Promise.all([
    settle(getBlogCategories(), []),
    settle(getBlogPosts({ q: filters.q, tag: filters.tag, sort: filters.sort, page: filters.page, per_page: 12 }), null),
    showFeatured ? settle(getBlogPosts({ featured: true, per_page: 1 }), null) : null,
  ]);

  const data = listingJsonLd({ name: "Mangrove Collection Blog", description: DESCRIPTION, path: "/blog/", posts: posts?.data ?? [], crumbs: [{ name: "Blog", path: "/blog/" }] });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
      <BlogListing
        title="Stories, guides & recipes from the Sundarbans"
        description="How to spot pure honey, choose the freshest fish, cook crab and prawn at home, and meet the people who collect them."
        basePath="/blog/"
        breadcrumb={[{ label: "Blog" }]}
        categories={categories}
        posts={posts}
        featured={featured?.data[0]}
        filters={filters}
      />
    </>
  );
}

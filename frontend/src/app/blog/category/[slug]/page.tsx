import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { BlogListing } from "@/components/blog/blog-listing";
import { blogCategoryHref } from "@/lib/blog";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { getBlogCategories, getBlogPosts, settle } from "@/lib/server-api";

import { canonicalPath, isThinListing, listingFilters, listingJsonLd, type SearchParams } from "../../listing-params";

type Params = Promise<{ slug: string }>;

const findCategory = cache(async (slug: string) => {
  const categories = await settle(getBlogCategories(), []);
  return { categories, category: categories.find((item) => item.slug === decodeURIComponent(slug)) };
});

const describe = (name: string, description: string | null) =>
  description || `${name}: articles, tips and guides from the Mangrove Collection team about Sundarbans honey, fish and seafood.`;

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const { category } = await findCategory((await params).slug);
  if (!category) return pageMetadata({ title: "Category not found", description: "This blog category doesn't exist.", noindex: true });
  const filters = listingFilters(await searchParams);
  const base = blogCategoryHref(category.slug);
  return pageMetadata({
    title: filters.page > 1 ? `${category.name} — Blog (page ${filters.page})` : `${category.name} — Blog`,
    description: describe(category.name, category.description),
    path: canonicalPath(base, filters),
    noindex: isThinListing(filters),
  });
}

export default async function BlogCategoryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { categories, category } = await findCategory((await params).slug);
  if (!category) notFound();

  const filters = listingFilters(await searchParams);
  const base = blogCategoryHref(category.slug);
  const posts = await settle(getBlogPosts({ category: category.slug, q: filters.q, tag: filters.tag, sort: filters.sort, page: filters.page, per_page: 12 }), null);
  const description = describe(category.name, category.description);

  const data = listingJsonLd({
    name: category.name,
    description,
    path: base,
    posts: posts?.data ?? [],
    crumbs: [
      { name: "Blog", path: "/blog/" },
      { name: category.name, path: base },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
      <BlogListing
        title={category.name}
        description={description}
        basePath={base}
        breadcrumb={[{ label: "Blog", href: "/blog/" }, { label: category.name }]}
        categories={categories}
        activeCategory={category}
        posts={posts}
        filters={filters}
      />
    </>
  );
}

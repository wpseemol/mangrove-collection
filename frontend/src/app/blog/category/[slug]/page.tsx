import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { BlogListingPage } from "@/components/blog/blog-listing-page";
import { blogCategoryHref } from "@/lib/blog";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { getBlogCategories, getBlogPosts, requireParams, settle } from "@/lib/server-api";

import { listingJsonLd } from "../../listing-params";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export async function generateStaticParams() {
  return requireParams(
    (await getBlogCategories()).map((category) => ({ slug: category.slug })),
    "blog categories",
  );
}

const findCategory = cache(async (slug: string) => {
  const categories = await settle(getBlogCategories(), []);
  return { categories, category: categories.find((item) => item.slug === decodeURIComponent(slug)) };
});

const describe = (name: string, description: string | null) =>
  description || `${name}: articles, tips and guides from the Mangrove Collection team about Sundarbans honey, fish and seafood.`;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await findCategory((await params).slug);
  if (!category) return pageMetadata({ title: "Category not found", description: "This blog category doesn't exist.", noindex: true });
  return pageMetadata({
    title: `${category.name} — Blog`,
    description: describe(category.name, category.description),
    path: blogCategoryHref(category.slug),
  });
}

export default async function BlogCategoryPage({ params }: { params: Params }) {
  const { categories, category } = await findCategory((await params).slug);
  if (!category) notFound();

  const base = blogCategoryHref(category.slug);
  const posts = await settle(getBlogPosts({ category: category.slug, page: 1, per_page: 12 }), null);
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
      <BlogListingPage
        title={category.name}
        description={description}
        basePath={base}
        breadcrumb={[{ label: "Blog", href: "/blog/" }, { label: category.name }]}
        categories={categories}
        activeCategory={category}
        posts={posts}
      />
    </>
  );
}

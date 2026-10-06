import type { Metadata } from "next";

import { BlogListingPage } from "@/components/blog/blog-listing-page";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { getBlogCategories, getBlogPosts, settle } from "@/lib/server-api";

import { listingJsonLd } from "./listing-params";

const TITLE = "Blog — Sundarbans Honey, Fish Guides & Healthy Recipes";
const DESCRIPTION =
  "Honey health benefits, sea and river fish buying guides, crab and prawn recipes, storage tips and stories from the Sundarbans, written by the Mangrove Collection team.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/blog/",
  keywords: ["Sundarbans honey benefits", "how to choose fresh fish", "hilsa recipe", "mud crab recipe", "raw honey storage", "Mangrove Collection blog"],
});

export default async function BlogPage() {
  const [categories, posts, featured] = await Promise.all([
    settle(getBlogCategories(), []),
    settle(getBlogPosts({ page: 1, per_page: 12 }), null),
    settle(getBlogPosts({ featured: true, per_page: 1 }), null),
  ]);

  const data = listingJsonLd({ name: "Mangrove Collection Blog", description: DESCRIPTION, path: "/blog/", posts: posts?.data ?? [], crumbs: [{ name: "Blog", path: "/blog/" }] });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
      <BlogListingPage
        title="Stories, guides & recipes from the Sundarbans"
        description="How to spot pure honey, choose the freshest fish, cook crab and prawn at home, and meet the people who collect them."
        basePath="/blog/"
        breadcrumb={[{ label: "Blog" }]}
        categories={categories}
        posts={posts}
        featured={featured?.data[0]}
      />
    </>
  );
}

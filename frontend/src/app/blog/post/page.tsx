import type { Metadata } from "next";
import { Suspense } from "react";

import { BlogPostView } from "@/components/blog/blog-post-view";
import { pageMetadata } from "@/lib/seo";

/** The URL depends on `?slug=`, so the canonical link and article details are set in the browser by `BlogPostSeo`. */
export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Stories, recipes and tips from the Sundarbans by Mangrove Collection.",
});

/** `/blog/post/?slug=...` rather than `/blog/[slug]`: posts are written after the static export is built. */
export default function BlogPostPage() {
  return (
    <Suspense>
      <BlogPostView />
    </Suspense>
  );
}

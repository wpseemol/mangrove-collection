import type { Metadata } from "next";
import { Suspense } from "react";

import { BlogView } from "@/components/blog/blog-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog — Sundarbans Stories, Recipes & Tips",
  description:
    "Stories from the Sundarbans, recipes for fish, crab and prawn, and tips for choosing pure mangrove honey — from the Mangrove Collection team.",
  path: "/blog/",
});

export default function BlogPage() {
  return (
    <Suspense>
      <BlogView />
    </Suspense>
  );
}

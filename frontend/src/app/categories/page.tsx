import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

import { CategoriesContent } from "./categories-content";

export const metadata: Metadata = pageMetadata({
  title: "Shop by Category",
  description:
    "Explore every Mangrove Collection category — raw mangrove honey, seawater fish, crab, prawn and more — all sourced directly from the Sundarbans.",
  path: "/categories/",
});

export default function CategoriesPage() {
  return <CategoriesContent />;
}

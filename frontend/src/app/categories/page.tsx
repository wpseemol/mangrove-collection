import type { Metadata } from "next";

import { CategoriesContent } from "./categories-content";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return <CategoriesContent />;
}

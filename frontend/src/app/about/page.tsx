import type { Metadata } from "next";

import { CmsPageView } from "@/components/shared/cms-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us — Our Sundarbans Story",
  description:
    "How Mangrove Collection works with Sundarbans fishermen and honey collectors to bring fresh, natural food to homes across Bangladesh — fairly and without middlemen.",
  path: "/about/",
});

export default function AboutPage() {
  return <CmsPageView slug="about" title="About us" />;
}

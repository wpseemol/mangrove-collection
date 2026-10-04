import type { Metadata } from "next";

import { AboutView } from "@/components/about/about-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us — Our Sundarbans Story",
  description:
    "How Mangrove Collection works with Sundarbans fishermen and honey collectors to bring fresh, natural food to homes across Bangladesh — fairly and without middlemen.",
  path: "/about/",
});

export default function AboutPage() {
  return <AboutView />;
}

import type { Metadata } from "next";

import { CmsPageView } from "@/components/shared/cms-page";

export const metadata: Metadata = {
  title: "About us",
  description: "Mangrove Collection brings fresh, natural products straight from the Sundarbans to your door.",
};

export default function AboutPage() {
  return <CmsPageView slug="about" title="About us" />;
}

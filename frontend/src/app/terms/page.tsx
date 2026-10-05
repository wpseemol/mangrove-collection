import type { Metadata } from "next";

import { CmsPageView } from "@/components/shared/cms-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: "The terms that apply when you shop with Mangrove Collection, including orders, payment, delivery and returns.",
  path: "/terms/",
});

export default function TermsPage() {
  return <CmsPageView slug="terms" title="Terms & conditions" />;
}

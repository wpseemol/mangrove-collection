import type { Metadata } from "next";

import { CmsPageView } from "@/components/shared/cms-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Mangrove Collection collects, uses and protects your personal information when you shop with us.",
  path: "/privacy-policy/",
});

export default function PrivacyPolicyPage() {
  return <CmsPageView slug="privacy-policy" title="Privacy policy" />;
}

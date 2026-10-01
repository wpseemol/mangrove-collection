import type { Metadata } from "next";

import { CmsPageView } from "@/components/shared/cms-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPolicyPage() {
  return <CmsPageView slug="privacy-policy" title="Privacy policy" />;
}

import type { Metadata } from "next";

import { CmsPageView } from "@/components/shared/cms-page";

export const metadata: Metadata = { title: "Terms & conditions" };

export default function TermsPage() {
  return <CmsPageView slug="terms" title="Terms & conditions" />;
}

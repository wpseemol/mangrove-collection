import type { Metadata } from "next";

import { CmsPageView } from "@/components/shared/cms-page";
import { pageMetadata } from "@/lib/seo";

import { ContactInfo } from "./contact-info";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Mangrove Collection about orders, delivery or product advice. Call, email or message us on WhatsApp — we're happy to help.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <CmsPageView slug="contact" title="Contact us">
      <ContactInfo />
    </CmsPageView>
  );
}

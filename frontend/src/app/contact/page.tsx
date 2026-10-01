import type { Metadata } from "next";

import { CmsPageView } from "@/components/shared/cms-page";

import { ContactInfo } from "./contact-info";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <CmsPageView slug="contact" title="Contact us">
      <ContactInfo />
    </CmsPageView>
  );
}

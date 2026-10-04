import type { Metadata } from "next";

import { ContactView } from "@/components/contact/contact-view";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Mangrove Collection about orders, delivery or product advice. Call, email or message us on WhatsApp — we're happy to help.",
  path: "/contact/",
});

export default function ContactPage() {
  return <ContactView />;
}

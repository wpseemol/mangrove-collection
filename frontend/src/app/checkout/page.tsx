import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

import { CheckoutContent } from "./checkout-content";

export const metadata: Metadata = pageMetadata({
  title: "Checkout",
  description: "Enter your delivery details and place your Mangrove Collection order securely.",
  path: "/checkout/",
  noindex: true,
});

export default function CheckoutPage() {
  return <CheckoutContent />;
}

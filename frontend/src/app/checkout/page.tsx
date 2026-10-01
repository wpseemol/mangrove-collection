import type { Metadata } from "next";

import { CheckoutContent } from "./checkout-content";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutContent />;
}

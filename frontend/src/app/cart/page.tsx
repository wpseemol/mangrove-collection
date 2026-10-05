import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

import { CartContent } from "./cart-content";

export const metadata: Metadata = pageMetadata({
  title: "Your cart",
  description: "Review the products in your Mangrove Collection cart and continue to checkout.",
  path: "/cart/",
  noindex: true,
});

export default function CartPage() {
  return <CartContent />;
}

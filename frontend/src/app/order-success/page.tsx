import type { Metadata } from "next";
import { Suspense } from "react";

import { pageMetadata } from "@/lib/seo";

import { OrderSuccessContent } from "./order-success-content";

export const metadata: Metadata = pageMetadata({
  title: "Order placed",
  description: "Thank you for your order from Mangrove Collection.",
  noindex: true,
});

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  );
}

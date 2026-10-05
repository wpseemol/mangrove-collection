import type { Metadata } from "next";
import { Suspense } from "react";

import { pageMetadata } from "@/lib/seo";

import { TrackOrderContent } from "./track-order-content";

export const metadata: Metadata = pageMetadata({
  title: "Track Your Order",
  description: "Check the delivery status of your Mangrove Collection order with your order number and phone number.",
  path: "/track-order/",
});

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderContent />
    </Suspense>
  );
}

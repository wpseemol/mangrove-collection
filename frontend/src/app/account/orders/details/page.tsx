import type { Metadata } from "next";
import { Suspense } from "react";

import { OrderDetailContent } from "./order-detail-content";

export const metadata: Metadata = { title: "Order details" };

export default function OrderDetailPage() {
  return (
    <Suspense>
      <OrderDetailContent />
    </Suspense>
  );
}

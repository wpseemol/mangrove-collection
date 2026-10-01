import type { Metadata } from "next";
import { Suspense } from "react";

import { OrderSuccessContent } from "./order-success-content";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  );
}

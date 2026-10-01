import type { Metadata } from "next";
import { Suspense } from "react";

import { TrackOrderContent } from "./track-order-content";

export const metadata: Metadata = { title: "Track order" };

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrderContent />
    </Suspense>
  );
}

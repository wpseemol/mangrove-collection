import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Log in",
  description: "Log in to your Mangrove Collection account to track orders, save addresses and check out faster.",
  path: "/login/",
  noindex: true,
});

/** The auth card lives in `(auth)/layout.tsx`; the route only picks which form it shows. */
export default function LoginPage() {
  return null;
}

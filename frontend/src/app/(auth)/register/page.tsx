import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Create account",
  description: "Create a free Mangrove Collection account to track orders, save delivery addresses and review the products you buy.",
  path: "/register/",
  noindex: true,
});

/** The auth card lives in `(auth)/layout.tsx`; the route only picks which form it shows. */
export default function RegisterPage() {
  return null;
}

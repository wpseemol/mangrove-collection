"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";
import { productHref } from "@/lib/product";

/**
 * Legacy `/product/?slug=…` bookmarks. Production redirects in `.htaccess`;
 * this client fallback covers local `next dev` where Apache rules do not run.
 */
export default function LegacyProductRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const review = searchParams.get("review");

  useEffect(() => {
    if (!slug) {
      router.replace("/shop/");
      return;
    }
    const target = productHref(slug);
    router.replace(review === "1" ? `${target}?review=1` : target);
  }, [slug, review, router]);

  return (
    <Container>
      <div className="grid gap-8 py-6 md:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </Container>
  );
}

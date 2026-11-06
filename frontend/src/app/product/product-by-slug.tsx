"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

import { ProductDetail } from "./product-detail";

/**
 * Client product page for `/product/?slug=…`.
 *
 * Used when a product was added or its slug changed after the last static
 * export, so `/product/[slug]/` HTML does not exist yet. Also used by the
 * dashboard "View" link and Apache fallback for missing pretty URLs.
 */
export function ProductBySlug() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug")?.trim() || null;

  useEffect(() => {
    if (!slug) router.replace("/shop/");
  }, [slug, router]);

  if (!slug) {
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

  return <ProductDetail slug={slug} />;
}

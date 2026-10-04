"use client";

import { DEFAULT_HOME, useHomeContent } from "@/lib/home-content";
import { useProducts } from "@/lib/queries";

import { ProductRowSection, productRowSettings } from "./product-section";

/** "Popular right now": best sellers, 1 row by default. */
export function PopularProducts() {
  const { content, ready } = useHomeContent();
  const section = content.popular;
  const { limit, rows, delaySeconds, slider } = productRowSettings(section, DEFAULT_HOME.popular);

  const { data, isLoading } = useProducts({ sort: "popular", per_page: limit }, ready && section.enabled);
  const products = data?.data;

  if (ready && (!section.enabled || (!isLoading && !products?.length))) return null;

  return (
    <ProductRowSection
      section={section}
      ready={ready}
      products={products}
      viewAllHref="/shop?sort=popular"
      rows={rows}
      delaySeconds={delaySeconds}
      slider={slider}
    />
  );
}

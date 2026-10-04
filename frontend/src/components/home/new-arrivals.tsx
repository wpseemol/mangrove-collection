"use client";

import { DEFAULT_HOME, useHomeContent } from "@/lib/home-content";
import { useProducts } from "@/lib/queries";

import { ProductRowSection, productRowSettings } from "./product-section";

/** "New arrivals": newest published products, 2 rows by default. */
export function NewArrivals() {
  const { content, ready } = useHomeContent();
  const section = content.latest;
  const { limit, rows, delaySeconds, slider } = productRowSettings(section, DEFAULT_HOME.latest);

  const { data, isLoading } = useProducts({ sort: "latest", per_page: limit }, ready && section.enabled);
  const products = data?.data;

  if (ready && (!section.enabled || (!isLoading && !products?.length))) return null;

  return (
    <ProductRowSection
      section={section}
      ready={ready}
      products={products}
      viewAllHref="/shop?sort=latest"
      rows={rows}
      delaySeconds={delaySeconds}
      slider={slider}
    />
  );
}

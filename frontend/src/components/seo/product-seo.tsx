"use client";

import { useEffect } from "react";

import { canonical, clip, meta, toAbsolute } from "@/lib/head";
import { absoluteUrl, jsonLd, SITE_NAME } from "@/lib/seo";
import type { Product } from "@/lib/types";

const plain = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Product pages are `/product/?slug=...`, so the static HTML only has generic tags. Once the product loads this
 * fills in the title, description, canonical URL, social previews and Product / Breadcrumb structured data.
 */
export function ProductSeo({ product, images }: { product: Product; images: string[] }) {
  const url = absoluteUrl(`/product/?slug=${encodeURIComponent(product.slug)}`);
  const title = `${product.meta_title || product.name} | ${SITE_NAME}`;
  const description = clip(
    product.meta_description || product.short_description || (product.description ? plain(product.description) : "") || `Buy ${product.name} online from ${SITE_NAME}.`,
    160,
  );
  const pictures = images.map(toAbsolute);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    const undo = [
      meta("name", "description", description),
      canonical(url),
      meta("property", "og:type", "product"),
      meta("property", "og:title", title),
      meta("property", "og:description", description),
      meta("property", "og:url", url),
      meta("name", "twitter:title", title),
      meta("name", "twitter:description", description),
      ...(pictures[0] ? [meta("property", "og:image", pictures[0]), meta("name", "twitter:image", pictures[0])] : []),
    ];

    return () => {
      document.title = previousTitle;
      undo.forEach((restore) => restore());
    };
  }, [title, description, url, pictures[0]]); // eslint-disable-line react-hooks/exhaustive-deps

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description,
        url,
        ...(pictures.length ? { image: pictures } : {}),
        ...(product.category ? { category: product.category.name } : {}),
        brand: { "@type": "Brand", name: SITE_NAME },
        ...(product.price !== undefined
          ? {
              offers: {
                "@type": "Offer",
                url,
                price: product.price,
                priceCurrency: product.currency || "BDT",
                availability: product.in_stock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@type": "Organization", name: SITE_NAME },
              },
            }
          : {}),
        ...(product.rating && product.rating.count > 0
          ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.average, reviewCount: product.rating.count } }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: absoluteUrl("/") },
          { name: "Products", item: absoluteUrl("/shop/") },
          ...(product.category ? [{ name: product.category.name, item: absoluteUrl(`/shop/?category=${encodeURIComponent(product.category.slug)}`) }] : []),
          { name: product.name, item: url },
        ].map((crumb, index) => ({ "@type": "ListItem", position: index + 1, ...crumb })),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}

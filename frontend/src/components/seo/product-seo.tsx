"use client";

import { useEffect } from "react";

import { absoluteUrl, jsonLd, SITE_NAME } from "@/lib/seo";
import type { Product } from "@/lib/types";

const plain = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : text);

const toAbsolute = (url: string) => (/^https?:\/\//i.test(url) ? url : absoluteUrl(url));

/** Sets `<meta>` / `<link>` in the head, creating the tag when the page metadata didn't render one. Returns an undo function. */
function setHeadTag(selector: string, create: () => HTMLElement, attribute: string, value: string) {
  let element = document.head.querySelector<HTMLElement>(selector);
  const created = !element;
  element ??= document.head.appendChild(create());
  const previous = element.getAttribute(attribute);
  element.setAttribute(attribute, value);

  return () => {
    if (created) element.remove();
    else if (previous !== null) element.setAttribute(attribute, previous);
  };
}

const meta = (key: "name" | "property", name: string, content: string) =>
  setHeadTag(
    `meta[${key}="${name}"]`,
    () => {
      const tag = document.createElement("meta");
      tag.setAttribute(key, name);
      return tag;
    },
    "content",
    content,
  );

const canonical = (href: string) =>
  setHeadTag(
    'link[rel="canonical"]',
    () => {
      const tag = document.createElement("link");
      tag.rel = "canonical";
      return tag;
    },
    "href",
    href,
  );

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

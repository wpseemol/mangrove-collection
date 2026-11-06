import { clip, toAbsolute } from "@/lib/head";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import type { Product } from "@/lib/types";

export const productHref = (slug: string) => `/product/${encodeURIComponent(slug)}/`;

export const productReviewHref = (slug: string) => `${productHref(slug)}?review=1`;

export const plainProductText = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export const productDescription = (product: Product) =>
  clip(
    product.meta_description ||
      product.short_description ||
      (product.description ? plainProductText(product.description) : "") ||
      `Buy ${product.name} online from ${SITE_NAME}. Fresh Sundarbans produce delivered across Bangladesh.`,
    160,
  );

export const productImages = (product: Product) =>
  [...new Set([product.thumbnail, ...(product.images ?? []).map((image) => image.url)])].filter(Boolean).map((src) => toAbsolute(src!));

/** Product + breadcrumb JSON-LD baked into the static HTML for Google and AI crawlers. */
export function productJsonLd(product: Product) {
  const url = absoluteUrl(productHref(product.slug));
  const pictures = productImages(product);
  const description = productDescription(product);
  const defaultVariant = product.variants?.find((variant) => variant.is_default) ?? product.variants?.[0];
  const price = defaultVariant?.price ?? product.price;
  const inStock = defaultVariant?.in_stock ?? product.in_stock !== false;
  const sku = defaultVariant?.sku || undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${product.meta_title || product.name} | ${SITE_NAME}`,
        description,
        isPartOf: { "@id": `${absoluteUrl("/")}#website` },
        about: { "@id": `${url}#product` },
        inLanguage: "en",
      },
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.name,
        description,
        url,
        sku,
        ...(pictures.length ? { image: pictures } : {}),
        ...(product.category ? { category: product.category.name } : {}),
        brand: { "@type": "Brand", name: SITE_NAME },
        ...(product.tags.length ? { keywords: product.tags.join(", ") } : {}),
        ...(product.unit
          ? {
              additionalProperty: [
                { "@type": "PropertyValue", name: "Unit", value: product.unit },
                ...(product.size ? [{ "@type": "PropertyValue", name: "Size", value: product.size }] : []),
              ],
            }
          : {}),
        ...(product.video_url
          ? {
              video: {
                "@type": "VideoObject",
                name: `${product.name} video`,
                description,
                contentUrl: product.video_url,
                embedUrl: product.video_embed_url || product.video_url,
                ...(pictures[0] ? { thumbnailUrl: pictures[0] } : {}),
              },
            }
          : {}),
        ...(price !== undefined
          ? {
              offers: {
                "@type": "Offer",
                url,
                price,
                priceCurrency: product.currency || "BDT",
                availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
              },
            }
          : {}),
        ...(product.rating && product.rating.count > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Number(product.rating.average.toFixed(1)),
                reviewCount: product.rating.count,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: absoluteUrl("/") },
          { name: "Products", item: absoluteUrl("/shop/") },
          ...(product.category
            ? [{ name: product.category.name, item: absoluteUrl(`/shop/?category=${encodeURIComponent(product.category.slug)}`) }]
            : []),
          { name: product.name, item: url },
        ].map((crumb, index) => ({ "@type": "ListItem", position: index + 1, ...crumb })),
      },
    ],
  };
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { productDescription, productHref, productImages, productJsonLd } from "@/lib/product";
import { jsonLd, pageMetadata, SITE_KEYWORDS } from "@/lib/seo";
import { getAllProducts, getProduct, getRelatedProducts, NotFoundError, requireParams, settle } from "@/lib/server-api";

import { ProductDetail } from "../product-detail";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export async function generateStaticParams() {
  return requireParams(
    (await getAllProducts()).map((product) => ({ slug: product.slug })),
    "products",
  );
}

const loadProduct = cache(async (slug: string) => {
  try {
    return await getProduct(decodeURIComponent(slug));
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) {
    return pageMetadata({
      title: "Product not found",
      description: "This product may have been removed or is no longer available.",
      noindex: true,
    });
  }

  const images = productImages(product);
  const keywords = [...new Set([...(product.tags ?? []), ...(product.category ? [product.category.name] : []), ...SITE_KEYWORDS.slice(0, 4)])];

  return pageMetadata({
    title: product.meta_title || product.name,
    description: productDescription(product),
    path: productHref(product.slug),
    image: images[0] ?? null,
    keywords,
  });
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const related = await settle(getRelatedProducts(product.slug), []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd(product)) }} />
      <ProductDetail initialProduct={product} initialRelated={related} />
    </>
  );
}

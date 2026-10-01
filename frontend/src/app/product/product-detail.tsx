"use client";

import { PackageX, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ProductGrid } from "@/components/product/product-grid";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { QuantityInput } from "@/components/shared/quantity-input";
import { RemoteImage } from "@/components/shared/remote-image";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { defaultVariant, useCartActions } from "@/hooks/use-cart-actions";
import { formatPrice } from "@/lib/format";
import { useProduct, useRelatedProducts } from "@/lib/queries";
import { cn } from "@/lib/utils";

function DetailSkeleton() {
  return (
    <div className="grid gap-8 py-6 md:grid-cols-2">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    </div>
  );
}

export function ProductDetail() {
  const slug = useSearchParams().get("slug");
  const { data: product, isLoading, isError } = useProduct(slug);
  const { data: related } = useRelatedProducts(slug);
  const { addToCart, buyNow } = useCartActions();

  const [variantId, setVariantId] = useState<number | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) document.title = `${product.meta_title || product.name} | Mangrove Collection`;
  }, [product]);

  if (!slug || isError) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={PackageX}
          title="Product not found"
          description="This product may have been removed or is no longer available."
          action={
            <Button asChild>
              <Link href="/shop">Continue shopping</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  if (isLoading || !product) {
    return (
      <Container>
        <DetailSkeleton />
      </Container>
    );
  }

  const variants = product.variants ?? [];
  const variant = variants.find((v) => v.id === variantId) ?? defaultVariant(product);
  const gallery = [product.thumbnail, ...(product.images ?? []).map((image) => image.url)].filter(Boolean) as string[];
  const activeImage = gallery[imageIndex] ?? product.thumbnail;
  const inStock = variant?.in_stock ?? false;

  return (
    <Container>
      <PageBreadcrumb
        items={[
          { label: "Products", href: "/shop" },
          ...(product.category ? [{ label: product.category.name, href: `/shop?category=${product.category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 py-2 md:grid-cols-2 lg:gap-12">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-sm bg-muted shadow-sm">
            <RemoteImage src={activeImage} alt={product.name} sizes="(max-width: 768px) 100vw, 50vw" priority />
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {gallery.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={`Show image ${index + 1}`}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-sm border-2 bg-muted",
                    index === imageIndex ? "border-primary" : "border-transparent opacity-80 hover:opacity-100",
                  )}
                >
                  <RemoteImage src={src} alt="" sizes="100px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            {product.category && (
              <Link href={`/shop?category=${product.category.slug}`} className="text-xs font-medium tracking-wide text-primary uppercase">
                {product.category.name}
              </Link>
            )}
            <h1 className="font-bangla mt-1 text-2xl leading-snug text-gray-900 md:text-3xl">{product.name}</h1>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold text-primary">{formatPrice(variant?.price)}</span>
            {variant?.compare_price && variant.compare_price > variant.price && (
              <span className="text-base text-muted-foreground line-through">{formatPrice(variant.compare_price)}</span>
            )}
            {product.unit && <span className="text-sm text-muted-foreground">/ {product.unit}</span>}
            <Badge variant={inStock ? "secondary" : "destructive"}>{inStock ? "In stock" : "Out of stock"}</Badge>
          </div>

          {product.short_description && <p className="leading-relaxed text-gray-700">{product.short_description}</p>}

          {variants.length > 1 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-800 capitalize">{variants[0].type || "Option"}</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setVariantId(option.id);
                      setQuantity(1);
                    }}
                    disabled={!option.in_stock}
                    className={cn(
                      "rounded-sm border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      option.id === variant?.id ? "border-primary bg-primary text-white" : "border-gray-300 hover:border-primary",
                    )}
                  >
                    {option.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <QuantityInput value={quantity} onChange={setQuantity} max={variant?.stock} />
            <Button size="lg" className="h-10 px-6 shadow-md shadow-primary/30" disabled={!inStock} onClick={() => buyNow(product, variant, quantity)}>
              Buy Now
            </Button>
            <Button size="lg" variant="outline" className="h-10 border-primary px-6 text-primary hover:bg-secondary hover:text-primary" disabled={!inStock} onClick={() => addToCart(product, variant, quantity)}>
              Add to Cart
            </Button>
          </div>

          <div className="grid gap-3 rounded-sm bg-surface p-4 text-sm text-gray-700 sm:grid-cols-2">
            <p className="flex items-center gap-2">
              <Truck className="size-4 text-primary" /> Home delivery all over Bangladesh
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Fresh, directly from the Sundarbans
            </p>
          </div>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {product.description && (
        <section className="mt-12">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Product details</h2>
          <Separator className="mb-4" />
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: product.description }} />
        </section>
      )}

      {related && related.length > 0 && (
        <section className="mt-14">
          <SectionHeading title="Related Products" />
          <ProductGrid products={related} />
        </section>
      )}
    </Container>
  );
}

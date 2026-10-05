"use client";

import { Leaf, PackageX, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ProductGrid } from "@/components/product/product-grid";
import { ProductReviews } from "@/components/reviews/product-reviews";
import { Stars } from "@/components/reviews/stars";
import { ProductSeo } from "@/components/seo/product-seo";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { QuantityInput } from "@/components/shared/quantity-input";
import { RemoteImage } from "@/components/shared/remote-image";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const reviewRequested = searchParams.get("review") === "1";
  const { data: product, isLoading, isError } = useProduct(slug);
  const { data: related } = useRelatedProducts(slug);
  const { addToCart, buyNow } = useCartActions();

  const [variantId, setVariantId] = useState<number | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
  const gallery = [...new Set([product.thumbnail, ...(product.images ?? []).map((image) => image.url)])].filter(Boolean) as string[];
  const activeImage = gallery[imageIndex] ?? product.thumbnail;
  const inStock = variant?.in_stock ?? false;

  return (
    <Container className="pb-20 md:pb-0">
      <ProductSeo product={product} images={gallery} />
      <PageBreadcrumb
        items={[
          { label: "Products", href: "/shop" },
          ...(product.category ? [{ label: product.category.name, href: `/shop?category=${product.category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-6 py-2 md:grid-cols-2 md:gap-8 lg:gap-14">
        <div className="space-y-3 md:sticky md:top-28 md:self-start">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted md:rounded-3xl">
            <RemoteImage src={activeImage} alt={product.name} sizes="(max-width: 768px) 100vw, 50vw" priority />
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {gallery.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={`Show image ${index + 1}`}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-xl border-2 bg-muted transition-all",
                    index === imageIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <RemoteImage src={src} alt="" sizes="100px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5 md:space-y-6">
          <div>
            {product.category && (
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase hover:bg-primary hover:text-white"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="font-bangla mt-3 text-2xl leading-snug text-foreground sm:text-3xl md:text-4xl">{product.name}</h1>
            <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              {product.rating && product.rating.count > 0 ? (
                <>
                  <Stars value={product.rating.average} />
                  <span className="font-medium text-foreground">{product.rating.average.toFixed(1)}</span>
                  <span>
                    ({product.rating.count} review{product.rating.count === 1 ? "" : "s"})
                  </span>
                </>
              ) : (
                <span>No reviews yet — be the first</span>
              )}
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-y py-4 md:py-5">
            <span className="text-2xl font-semibold text-primary sm:text-3xl">{formatPrice(variant?.price)}</span>
            {variant?.compare_price && variant.compare_price > variant.price && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(variant.compare_price)}</span>
            )}
            {product.unit && <span className="text-sm text-muted-foreground">/ {product.unit}</span>}
            <Badge variant={inStock ? "secondary" : "destructive"} className="ml-auto rounded-full px-3">
              {inStock ? "● In stock" : "Out of stock"}
            </Badge>
          </div>

          {product.short_description && <p className="text-[15px] leading-relaxed text-muted-foreground">{product.short_description}</p>}

          {variants.length > 1 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground capitalize">{variants[0].type || "Option"}</p>
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
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      option.id === variant?.id ? "border-primary bg-primary text-white" : "border-input bg-card hover:border-primary hover:text-primary",
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
            <Button size="lg" className="h-12 flex-1 px-8 sm:flex-none" disabled={!inStock} onClick={() => buyNow(product, variant, quantity)}>
              <Zap /> Buy now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 flex-1 border-primary/30 px-8 text-primary hover:border-primary hover:bg-secondary hover:text-primary sm:flex-none"
              disabled={!inStock}
              onClick={() => addToCart(product, variant, quantity)}
            >
              <ShoppingBag /> Add to cart
            </Button>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Leaf, text: "Directly from the Sundarbans" },
              { icon: Truck, text: "Delivery all over Bangladesh" },
              { icon: ShieldCheck, text: "Easy, secure payment" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 rounded-xl border bg-surface/60 p-3 text-xs font-medium text-foreground/80">
                <Icon className="size-4 shrink-0 text-primary" /> {text}
              </li>
            ))}
          </ul>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {product.description && (
        <section className="mt-16 rounded-3xl border bg-card p-6 md:p-10">
          <h2 className="font-heading mb-6 text-2xl font-semibold text-foreground">Product details</h2>
          <div className="prose-content max-w-3xl" dangerouslySetInnerHTML={{ __html: product.description }} />
        </section>
      )}

      <ProductReviews key={product.slug} product={product} autoOpen={reviewRequested} />

      {related && related.length > 0 && (
        <section className="mt-14 md:mt-20">
          <SectionHeading eyebrow="You may also like" title="Related products" align="left" />
          <ProductGrid products={related.slice(0, 5)} />
        </section>
      )}

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <div className="mr-auto min-w-0 leading-tight">
            <p className="truncate text-xs text-muted-foreground">{variants.length > 1 ? variant?.title : product.unit ? `per ${product.unit}` : "Price"}</p>
            <p className="text-lg font-semibold text-primary">{formatPrice(variant?.price)}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="size-11 rounded-xl border-primary/30 text-primary"
            disabled={!inStock}
            aria-label="Add to cart"
            onClick={() => addToCart(product, variant, quantity)}
          >
            <ShoppingBag className="size-5" />
          </Button>
          <Button className="h-11 rounded-xl px-6" disabled={!inStock} onClick={() => buyNow(product, variant, quantity)}>
            <Zap /> {inStock ? "Buy now" : "Out of stock"}
          </Button>
        </div>
      </div>
    </Container>
  );
}

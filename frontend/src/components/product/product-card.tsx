"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { RemoteImage } from "@/components/shared/remote-image";
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/hooks/use-cart-actions";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

function discountPercent(product: Product): number | null {
  if (!product.compare_price || !product.price || product.compare_price <= product.price) return null;
  return Math.round(((product.compare_price - product.price) / product.compare_price) * 100);
}

function CardActions({ product, className }: { product: Product; className?: string }) {
  const { addToCart, buyNow } = useCartActions();
  const disabled = product.in_stock === false;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button disabled={disabled} className="h-9 flex-1 rounded-lg text-[13px]" onClick={() => buyNow(product)}>
        {disabled ? "Out of stock" : "Buy now"}
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={disabled}
        className="rounded-lg border-primary/25 text-primary hover:border-primary hover:bg-primary hover:text-white"
        aria-label={`Add ${product.name} to cart`}
        title="Add to cart"
        onClick={() => addToCart(product)}
      >
        <ShoppingBag className="size-4" />
      </Button>
    </div>
  );
}

function Badges({ product }: { product: Product }) {
  const discount = discountPercent(product);
  const outOfStock = product.in_stock === false;

  if (!discount && !outOfStock && !product.is_featured) return null;

  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
      {discount && <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">-{discount}%</span>}
      {product.is_featured && !discount && <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-semibold text-white">Featured</span>}
      {outOfStock && <span className="rounded-full bg-black/75 px-2.5 py-0.5 text-[11px] font-semibold text-white">Sold out</span>}
    </div>
  );
}

function Price({ product, className }: { product: Product; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className="text-base font-semibold text-primary">{formatPrice(product.price)}</span>
      {product.compare_price && product.price && product.compare_price > product.price ? (
        <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compare_price)}</span>
      ) : null}
      {product.unit && <span className="text-xs text-muted-foreground">/ {product.unit}</span>}
    </p>
  );
}

export function ProductCard({ product, layout = "grid" }: { product: Product; layout?: "grid" | "list" }) {
  const href = `/product?slug=${product.slug}`;

  if (layout === "list") {
    return (
      <article className="flex gap-5 rounded-2xl border bg-card p-3 transition-shadow hover:shadow-lg hover:shadow-black/5">
        <Link href={href} className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:w-44">
          <Badges product={product} />
          <RemoteImage src={product.thumbnail} alt={product.name} sizes="176px" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-1 pr-1">
          <div>
            {product.category && <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{product.category.name}</p>}
            <Link href={href} className="font-bangla mt-1 block text-lg leading-snug text-foreground hover:text-primary">
              {product.name}
            </Link>
            {product.short_description && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Price product={product} />
            <CardActions product={product} className="w-full sm:w-56" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-xl hover:shadow-black/5">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-muted">
        <Badges product={product} />
        <RemoteImage src={product.thumbnail} alt={product.name} className="transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {product.category && <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{product.category.name}</p>}
        <Link href={href} className="font-bangla mt-1 line-clamp-2 text-[15px] leading-snug text-foreground hover:text-primary">
          {product.name}
        </Link>
        <Price product={product} className="mt-2" />
        <CardActions product={product} className="mt-auto pt-4" />
      </div>
    </article>
  );
}

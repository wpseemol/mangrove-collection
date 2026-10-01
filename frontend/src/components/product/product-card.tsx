"use client";

import Link from "next/link";

import { RemoteImage } from "@/components/shared/remote-image";
import { Badge } from "@/components/ui/badge";
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
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      <Button size="sm" disabled={disabled} className="h-8 px-3 text-xs font-medium shadow-md shadow-primary/30" onClick={() => buyNow(product)}>
        Buy Now
      </Button>
      <Button size="sm" disabled={disabled} className="h-8 px-3 text-xs font-medium" onClick={() => addToCart(product)}>
        Add to Cart
      </Button>
    </div>
  );
}

export function ProductCard({ product, layout = "grid" }: { product: Product; layout?: "grid" | "list" }) {
  const href = `/product?slug=${product.slug}`;
  const discount = discountPercent(product);
  const outOfStock = product.in_stock === false;

  const badges = (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
      {discount && <Badge className="bg-red-600 text-white">-{discount}%</Badge>}
      {outOfStock && <Badge variant="secondary">Stock out</Badge>}
    </div>
  );

  if (layout === "list") {
    return (
      <article className="flex gap-4 rounded-md border bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
        <Link href={href} className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-sm bg-muted sm:w-40">
          {badges}
          <RemoteImage src={product.thumbnail} alt={product.name} sizes="160px" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div>
            <Link href={href} className="font-bangla text-lg leading-snug text-gray-900 hover:text-primary">
              {product.name}
            </Link>
            {product.short_description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Price product={product} />
            <CardActions product={product} className="justify-start" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm bg-white shadow-[0_1px_6px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
      <Link href={href} className="relative block aspect-[6/5] overflow-hidden bg-muted">
        {badges}
        <RemoteImage src={product.thumbnail} alt={product.name} className="transition-transform duration-300 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col px-2 pt-2 pb-4 text-center">
        <Link href={href} className="font-bangla line-clamp-2 text-[15px] leading-snug text-gray-900 hover:text-primary">
          {product.name}
        </Link>
        <Price product={product} className="mt-1 justify-center" />
        <CardActions product={product} className="mt-auto pt-3" />
      </div>
    </article>
  );
}

function Price({ product, className }: { product: Product; className?: string }) {
  return (
    <p className={cn("flex items-baseline gap-2 text-sm", className)}>
      <span className="font-medium text-gray-900">{formatPrice(product.price)}</span>
      {product.compare_price && product.price && product.compare_price > product.price ? (
        <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compare_price)}</span>
      ) : null}
    </p>
  );
}

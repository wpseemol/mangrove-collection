"use client";

import { ShoppingBasket, Trash2 } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { QuantityInput } from "@/components/shared/quantity-input";
import { RemoteImage } from "@/components/shared/remote-image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatPrice } from "@/lib/format";
import { useSettings } from "@/lib/queries";
import { cartCount, cartSubtotal, useCartStore } from "@/stores/cart";

export function CartContent() {
  const hydrated = useHydrated();
  const { items, setQuantity, remove, clear } = useCartStore();
  const { data: settings } = useSettings();

  if (!hydrated) {
    return (
      <Container className="py-8">
        <Skeleton className="h-64 w-full" />
      </Container>
    );
  }

  const subtotal = cartSubtotal(items);
  const threshold = settings?.free_shipping_threshold ?? null;
  const remaining = threshold ? threshold - subtotal : 0;

  return (
    <Container>
      <PageBreadcrumb items={[{ label: "Cart" }]} />
      <h1 className="font-heading mb-6 text-xl font-medium tracking-[0.12em] uppercase">Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBasket}
          title="Your cart is empty"
          description="Fresh products from the Sundarbans are waiting for you."
          action={
            <Button asChild>
              <Link href="/shop">Start shopping</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="rounded-sm border">
            <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
              <span className="font-medium">{cartCount(items)} item(s)</span>
              <button type="button" onClick={clear} className="text-muted-foreground hover:text-destructive">
                Clear cart
              </button>
            </div>
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 p-4">
                  <Link href={`/product?slug=${item.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-sm bg-muted sm:size-24">
                    <RemoteImage src={item.image} alt={item.name} sizes="96px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <Link href={`/product?slug=${item.slug}`} className="font-bangla line-clamp-2 text-gray-900 hover:text-primary">
                        {item.name}
                      </Link>
                      {item.variantTitle && <p className="text-xs text-muted-foreground">{item.variantTitle}</p>}
                      <p className="mt-1 text-sm text-primary">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <QuantityInput size="sm" value={item.quantity} max={item.stock} onChange={(qty) => setQuantity(item.variantId, qty)} />
                      <span className="w-24 text-right text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => remove(item.variantId)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="h-fit space-y-4 rounded-sm border bg-surface p-5 lg:sticky lg:top-28">
            <h2 className="font-medium text-gray-900">Order summary</h2>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping is calculated at checkout.</p>
            {threshold && remaining > 0 && (
              <p className="rounded-sm bg-secondary px-3 py-2 text-xs text-primary">
                Add {formatPrice(remaining)} more for free delivery.
              </p>
            )}
            {threshold && remaining <= 0 && <p className="rounded-sm bg-secondary px-3 py-2 text-xs text-primary">You get free delivery!</p>}
            <Separator />
            <Button asChild size="lg" className="w-full shadow-md shadow-primary/30">
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
            <Button asChild variant="link" className="w-full">
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </aside>
        </div>
      )}
    </Container>
  );
}

"use client";

import { ArrowRight, ShieldCheck, ShoppingBasket, Trash2, Truck } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-breadcrumb";
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
        <Skeleton className="h-64 w-full rounded-2xl" />
      </Container>
    );
  }

  const subtotal = cartSubtotal(items);
  const threshold = settings?.free_shipping_threshold ?? null;
  const remaining = threshold ? threshold - subtotal : 0;
  const progress = threshold ? Math.min(100, Math.round((subtotal / threshold) * 100)) : 0;

  return (
    <>
      <PageHeader
        title="Shopping cart"
        description={items.length ? `You have ${cartCount(items)} item${cartCount(items) === 1 ? "" : "s"} in your cart.` : undefined}
        breadcrumb={[{ label: "Cart" }]}
      />
      <Container>
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBasket}
            title="Your cart is empty"
            description="Fresh products from the Sundarbans are waiting for you."
            action={
              <Button asChild size="lg">
                <Link href="/shop">Start shopping</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="overflow-hidden rounded-2xl border bg-white">
              <div className="flex items-center justify-between border-b bg-surface/60 px-5 py-3.5 text-sm">
                <span className="font-semibold text-gray-900">Products</span>
                <button type="button" onClick={clear} className="font-medium text-muted-foreground hover:text-destructive">
                  Clear cart
                </button>
              </div>
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-4 p-5">
                    <Link href={`/product?slug=${item.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl border bg-muted sm:size-24">
                      <RemoteImage src={item.image} alt={item.name} sizes="96px" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <Link href={`/product?slug=${item.slug}`} className="font-bangla line-clamp-2 text-[15px] text-gray-900 hover:text-primary">
                          {item.name}
                        </Link>
                        {item.variantTitle && <p className="mt-0.5 text-xs text-muted-foreground">{item.variantTitle}</p>}
                        <p className="mt-1 text-sm font-medium text-primary">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <QuantityInput size="sm" value={item.quantity} max={item.stock} onChange={(qty) => setQuantity(item.variantId, qty)} />
                        <span className="w-24 text-right text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => remove(item.variantId)}
                          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-red-50 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="h-fit space-y-5 rounded-2xl border bg-white p-6 lg:sticky lg:top-28">
              <h2 className="font-heading text-xl font-semibold text-gray-900">Order summary</h2>

              {threshold ? (
                <div className="space-y-2 rounded-xl bg-secondary p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Truck className="size-4" />
                    {remaining > 0 ? `Add ${formatPrice(remaining)} more for free delivery` : "You've unlocked free delivery!"}
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Estimated total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">
                  Proceed to checkout <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/shop">Continue shopping</Link>
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" /> Safe &amp; secure checkout
              </p>
            </aside>
          </div>
        )}
      </Container>
    </>
  );
}

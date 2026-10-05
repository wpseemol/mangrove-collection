"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Product, ProductVariant } from "@/lib/types";
import { useCartStore } from "@/stores/cart";

export function defaultVariant(product: Product): ProductVariant | undefined {
  return product.variants?.find((variant) => variant.is_default) ?? product.variants?.[0];
}

export function useCartActions() {
  const router = useRouter();
  const add = useCartStore((s) => s.add);

  const resolve = (product: Product, variant?: ProductVariant) => {
    const chosen = variant ?? defaultVariant(product);

    if (!chosen) {
      router.push(`/product?slug=${product.slug}`);
      return null;
    }

    if (!chosen.in_stock) {
      toast.error("This product is currently out of stock.");
      return null;
    }

    return chosen;
  };

  return {
    addToCart(product: Product, variant?: ProductVariant, quantity = 1) {
      const chosen = resolve(product, variant);
      if (!chosen) return;

      add(product, chosen, quantity);
      toast.success("Added to cart", {
        description: product.name,
        action: { label: "View cart", onClick: () => router.push("/cart") },
      });
    },
    buyNow(product: Product, variant?: ProductVariant, quantity = 1) {
      const chosen = resolve(product, variant);
      if (!chosen) return;

      add(product, chosen, quantity);
      router.push("/checkout");
    },
  };
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Product, ProductVariant } from "@/lib/types";

export type CartItem = {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  variantTitle: string | null;
  image: string | null;
  price: number;
  stock: number | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (product: Product, variant: ProductVariant, quantity?: number) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
};

const clamp = (quantity: number, stock: number | null) =>
  Math.max(1, Math.min(quantity, stock ?? 100, 100));

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product, variant, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.variantId === variant.id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.variantId === variant.id
                  ? { ...item, price: variant.price, stock: variant.stock, quantity: clamp(item.quantity + quantity, variant.stock) }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                variantId: variant.id,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                variantTitle: (product.variants?.length ?? 0) > 1 ? variant.title : null,
                image: product.thumbnail,
                price: variant.price,
                stock: variant.stock,
                quantity: clamp(quantity, variant.stock),
              },
            ],
          };
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId ? { ...item, quantity: clamp(quantity, item.stock) } : item,
          ),
        })),
      remove: (variantId) => set((state) => ({ items: state.items.filter((item) => item.variantId !== variantId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "mc-cart" },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((sum, item) => sum + item.quantity, 0);

export const cartSubtotal = (items: CartItem[]) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

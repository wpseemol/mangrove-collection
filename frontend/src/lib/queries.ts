"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  Address,
  Banner,
  Category,
  CmsPage,
  Order,
  Paginated,
  Product,
  PublicSettings,
  SessionResponse,
  ShippingMethod,
} from "@/lib/types";
import { useAuthStore } from "@/stores/auth";

const FIVE_MINUTES = 5 * 60 * 1000;

export type ProductFilters = {
  q?: string;
  category?: string;
  tag?: string;
  featured?: boolean;
  min_price?: number | string;
  max_price?: number | string;
  sort?: "latest" | "oldest" | "price_asc" | "price_desc" | "popular" | "name";
  page?: number;
  per_page?: number;
};

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => api<{ data: PublicSettings }>("/settings").then((r) => r.data),
    staleTime: FIVE_MINUTES,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api<{ data: Category[] }>("/categories").then((r) => r.data),
    staleTime: FIVE_MINUTES,
  });
}

export function useProducts(filters: ProductFilters, enabled = true) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => api<Paginated<Product>>("/products", { query: filters }),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useProduct(slug: string | null) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => api<{ data: Product }>(`/products/${slug}`).then((r) => r.data),
    enabled: Boolean(slug),
  });
}

export function useRelatedProducts(slug: string | null) {
  return useQuery({
    queryKey: ["product", slug, "related"],
    queryFn: () => api<{ data: Product[] }>(`/products/${slug}/related`).then((r) => r.data),
    enabled: Boolean(slug),
  });
}

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => api<{ data: Banner[] }>("/banners").then((r) => r.data),
    staleTime: FIVE_MINUTES,
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: () => api<{ data: CmsPage }>(`/pages/${slug}`).then((r) => r.data),
    staleTime: FIVE_MINUTES,
    retry: false,
  });
}

export function useShippingMethods() {
  return useQuery({
    queryKey: ["shipping-methods"],
    queryFn: () => api<{ data: ShippingMethod[] }>("/shipping-methods").then((r) => r.data),
    staleTime: FIVE_MINUTES,
  });
}

export const sessionQueryKey = ["session"] as const;

/**
 * Asks the API who owns the session cookie (200 for guests too) and syncs the
 * auth store. Refetched on focus so a logout in another tab or in the
 * dashboard (which shares the cookie) is picked up.
 */
export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const session = await api<SessionResponse>("/auth/session");
      const store = useAuthStore.getState();
      if (session.user) store.setUser(session.user);
      else store.clear();
      return session;
    },
    staleTime: FIVE_MINUTES,
    refetchOnWindowFocus: true,
  });
}

export function useMyOrders(page = 1) {
  return useQuery({
    queryKey: ["my-orders", page],
    queryFn: () => api<Paginated<Order>>("/account/orders", { query: { page } }),
    placeholderData: (previous) => previous,
  });
}

export function useMyOrder(orderNumber: string | null) {
  return useQuery({
    queryKey: ["my-order", orderNumber],
    queryFn: () => api<{ data: Order }>(`/account/orders/${orderNumber}`).then((r) => r.data),
    enabled: Boolean(orderNumber),
  });
}

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => api<{ data: Address[] }>("/account/addresses").then((r) => r.data),
    enabled,
  });
}

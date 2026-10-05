import type { MetadataRoute } from "next";

import { blogCategoryHref, postHref } from "@/lib/blog";
import { API_URL } from "@/lib/config";
import { absoluteUrl } from "@/lib/seo";

/** Rebuilt hourly so new products and blog posts appear without a redeploy. */
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

const PAGES: { path: string; changeFrequency: Entry["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/shop/", changeFrequency: "daily", priority: 0.9 },
  { path: "/categories/", changeFrequency: "weekly", priority: 0.8 },
  { path: "/offers/", changeFrequency: "daily", priority: 0.8 },
  { path: "/blog/", changeFrequency: "daily", priority: 0.7 },
  { path: "/about/", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact/", changeFrequency: "monthly", priority: 0.5 },
  { path: "/track-order/", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy/", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms/", changeFrequency: "yearly", priority: 0.2 },
];

type Listed = { slug: string; updated_at?: string | null };

/** The build must not fail when the API is down: the sitemap then lists only the fixed pages. */
async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10_000) });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

async function allPages(path: string, perPage: number): Promise<Listed[]> {
  const rows: Listed[] = [];
  for (let page = 1; page <= 100; page++) {
    const body = await getJson<{ data: Listed[]; meta?: { last_page?: number } }>(`${path}?per_page=${perPage}&page=${page}`);
    if (!body) break;
    rows.push(...body.data);
    if (page >= (body.meta?.last_page ?? 1)) break;
  }
  return rows;
}

const lastModified = (value?: string | null) => (value ? new Date(value) : undefined);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts, blogCategories] = await Promise.all([
    allPages("/products", 60),
    getJson<{ data: Listed[] }>("/categories"),
    allPages("/blog/posts", 48),
    getJson<{ data: Listed[] }>("/blog/categories"),
  ]);

  return [
    ...PAGES.map(({ path, changeFrequency, priority }) => ({ url: absoluteUrl(path), changeFrequency, priority })),
    ...(categories?.data ?? []).map((category) => ({
      url: absoluteUrl(`/shop/?category=${encodeURIComponent(category.slug)}`),
      lastModified: lastModified(category.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/product/?slug=${encodeURIComponent(product.slug)}`),
      lastModified: lastModified(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(blogCategories?.data ?? []).map((category) => ({
      url: absoluteUrl(blogCategoryHref(category.slug)),
      lastModified: lastModified(category.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(postHref(post.slug)),
      lastModified: lastModified(post.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

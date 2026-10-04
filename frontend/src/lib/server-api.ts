import { API_URL } from "@/lib/config";
import type { BlogCategory, BlogPost, Paginated, PublicSettings } from "@/lib/types";

/** Every visitor shares one cached copy, so the API's per-IP rate limit only sees the Next server now and then. */
const REVALIDATE_SECONDS = 300;

type Query = Record<string, string | number | boolean | undefined>;

export class NotFoundError extends Error {}

async function serverGet<T>(path: string, query: Query = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS, tags: ["blog"] },
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status === 404) throw new NotFoundError(path);
  if (!response.ok) throw new Error(`API ${response.status} for ${path}`);
  return (await response.json()) as T;
}

export type BlogListQuery = { q?: string; category?: string; tag?: string; sort?: "latest" | "popular"; page?: number; per_page?: number; featured?: boolean };

export const getBlogPosts = (query: BlogListQuery) => serverGet<Paginated<BlogPost>>("/blog/posts", { ...query, featured: query.featured ? 1 : undefined });

export const getBlogCategories = () => serverGet<{ data: BlogCategory[] }>("/blog/categories").then((r) => r.data);

/** `track=0`: the cached render must not count as a view; the reader's browser records it instead. */
export const getBlogPost = (slug: string) => serverGet<{ data: BlogPost; related: BlogPost[] }>(`/blog/posts/${encodeURIComponent(slug)}`, { track: 0 });

export const getPublicSettings = () => serverGet<{ data: PublicSettings }>("/settings").then((r) => r.data);

/** Listing pages degrade to empty sections instead of a 500 when the API is briefly unreachable. */
export async function settle<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    return fallback;
  }
}

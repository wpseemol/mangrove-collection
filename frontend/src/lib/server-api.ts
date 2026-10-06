import { API_URL } from "@/lib/config";
import type { BlogCategory, BlogPost, Paginated, PublicSettings } from "@/lib/types";

/** Build-time API client for the statically exported blog pages. */

type Query = Record<string, string | number | boolean | undefined>;

export class NotFoundError extends Error {}

async function serverGet<T>(path: string, query: Query = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "force-cache",
    signal: AbortSignal.timeout(20_000),
  });
  if (response.status === 404) throw new NotFoundError(path);
  if (!response.ok) throw new Error(`API ${response.status} for ${path}`);
  return (await response.json()) as T;
}

export type BlogListQuery = { q?: string; category?: string; tag?: string; sort?: "latest" | "popular"; page?: number; per_page?: number; featured?: boolean };

export const getBlogPosts = (query: BlogListQuery) => serverGet<Paginated<BlogPost>>("/blog/posts", { ...query, featured: query.featured ? 1 : undefined });

export const getBlogCategories = () => serverGet<{ data: BlogCategory[] }>("/blog/categories").then((r) => r.data);

/** `track=0`: the build must not count as a view; the reader's browser records it instead. */
export const getBlogPost = (slug: string) => serverGet<{ data: BlogPost; related: BlogPost[] }>(`/blog/posts/${encodeURIComponent(slug)}`, { track: 0 });

export const getPublicSettings = () => serverGet<{ data: PublicSettings }>("/settings").then((r) => r.data);

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  for (let page = 1; page <= 100; page++) {
    const body = await getBlogPosts({ page, per_page: 48 });
    posts.push(...body.data);
    if (page >= body.meta.last_page) break;
  }
  return posts;
}

/**
 * A static export can't build a dynamic route with no pages, and an API outage
 * would otherwise ship a blog without articles, so the build stops instead.
 */
export function requireParams<T>(params: T[], what: string): T[] {
  if (params.length === 0) throw new Error(`No ${what} returned by ${API_URL}; the static build needs at least one.`);
  return params;
}

/** Listing pages degrade to empty sections instead of failing when the API is briefly unreachable. */
export async function settle<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    return fallback;
  }
}

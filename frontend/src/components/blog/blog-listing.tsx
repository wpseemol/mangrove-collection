import { ArrowRight, ChevronLeft, ChevronRight, Flame, Newspaper, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";

import { FeaturedPostCard, PostCard, PostCardSkeleton } from "@/components/blog/post-card";
import { Container } from "@/components/shared/container";
import { IconGlyph } from "@/components/shared/icon-glyph";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { blogCategoryHref } from "@/lib/blog";
import type { BlogCategory, BlogPost, Paginated } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ListingFilters = { q?: string; tag?: string; sort: "latest" | "popular"; page: number };

const CHIP = "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors";

function hrefWith(basePath: string, filters: ListingFilters, changes: Partial<ListingFilters>) {
  const next = { ...filters, ...changes };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.tag) params.set("tag", next.tag);
  if (next.sort === "popular") params.set("sort", "popular");
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function pageWindow(current: number, last: number): (number | "gap")[] {
  const pages = [...new Set([1, last, current - 1, current, current + 1])].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
  return pages.flatMap((page, index) => (index > 0 && page - pages[index - 1] > 1 ? ["gap" as const, page] : [page]));
}

function Pagination({ basePath, filters, lastPage }: { basePath: string; filters: ListingFilters; lastPage: number }) {
  if (lastPage <= 1) return null;
  const { page } = filters;
  const link = "inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-full border px-3 text-sm font-medium transition-colors";
  return (
    <nav aria-label="Blog pages" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefWith(basePath, filters, { page: page - 1 })} rel="prev" className={cn(link, "bg-card hover:border-primary hover:text-primary")}>
          <ChevronLeft className="size-4" /> Newer
        </Link>
      ) : null}
      {pageWindow(page, lastPage).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefWith(basePath, filters, { page: item })}
            aria-current={item === page ? "page" : undefined}
            className={cn(link, item === page ? "border-primary bg-primary text-white" : "bg-card hover:border-primary hover:text-primary")}
          >
            {item}
          </Link>
        ),
      )}
      {page < lastPage ? (
        <Link href={hrefWith(basePath, filters, { page: page + 1 })} rel="next" className={cn(link, "bg-card hover:border-primary hover:text-primary")}>
          Older <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}

export function BlogListing({
  title,
  description,
  basePath,
  breadcrumb,
  categories,
  activeCategory,
  posts,
  featured,
  filters,
  loading = false,
}: {
  title: string;
  description: string;
  basePath: string;
  breadcrumb: { label: string; href?: string }[];
  categories: BlogCategory[];
  activeCategory?: BlogCategory;
  posts: Paginated<BlogPost> | null;
  featured?: BlogPost;
  filters: ListingFilters;
  loading?: boolean;
}) {
  const filtered = Boolean(filters.q || filters.tag || filters.sort !== "latest");
  const items = (posts?.data ?? []).filter((post) => post.id !== featured?.id);
  const total = posts?.meta.total ?? 0;

  return (
    <>
      <section className="relative overflow-hidden border-b bg-linear-to-br from-secondary via-surface to-background">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-gold/15 blur-3xl" />
        <Container className="relative pb-10">
          <PageBreadcrumb items={breadcrumb} />
          <div className="max-w-3xl">
            {activeCategory?.icon_nodes ? (
              <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-card text-primary shadow-sm">
                <IconGlyph nodes={activeCategory.icon_nodes} className="size-6" />
              </span>
            ) : (
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase shadow-sm">
                <Sparkles className="size-3.5" /> From the Sundarbans
              </span>
            )}
            <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance text-foreground md:text-5xl">{title}</h1>
            <p className="mt-3 text-lg text-pretty text-muted-foreground">{description}</p>
          </div>

          <form action={basePath} method="get" role="search" className="mt-6 flex max-w-xl items-center gap-2 rounded-full border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
            <Search className="ml-3 size-4 shrink-0 text-muted-foreground" />
            <label htmlFor="blog-search" className="sr-only">
              Search articles
            </label>
            <input
              id="blog-search"
              type="search"
              name="q"
              defaultValue={filters.q}
              maxLength={100}
              placeholder="Search honey, hilsa, crab recipes…"
              className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {filters.tag && <input type="hidden" name="tag" value={filters.tag} />}
            {filters.sort === "popular" && <input type="hidden" name="sort" value="popular" />}
            <Button type="submit" size="sm" className="rounded-full px-5">
              Search
            </Button>
          </form>
        </Container>
      </section>

      <Container className="pt-8 pb-20 md:pb-12">
        {categories.length > 0 && (
          <nav aria-label="Blog categories" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <Link href="/blog/" className={cn(CHIP, !activeCategory ? "border-primary bg-primary text-white" : "bg-card hover:border-primary hover:text-primary")} aria-current={!activeCategory ? "page" : undefined}>
              <Newspaper className="size-4" /> All articles
            </Link>
            {categories.map((item) => {
              const active = item.slug === activeCategory?.slug;
              return (
                <Link
                  key={item.id}
                  href={blogCategoryHref(item.slug)}
                  aria-current={active ? "page" : undefined}
                  className={cn(CHIP, active ? "border-primary bg-primary text-white" : "bg-card hover:border-primary hover:text-primary")}
                >
                  {item.icon_nodes && <IconGlyph nodes={item.icon_nodes} className="size-4" />}
                  {item.name}
                  {item.posts_count !== undefined && <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-white/20" : "bg-muted")}>{item.posts_count}</span>}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{total}</strong> {total === 1 ? "article" : "articles"}
            </span>
            {filters.q && (
              <Link href={hrefWith(basePath, filters, { q: undefined, page: 1 })} className="inline-flex items-center gap-1.5 rounded-full bg-secondary py-1 pr-2 pl-3 text-primary hover:bg-secondary/70">
                “{filters.q}” <X className="size-3.5" aria-label="Clear search" />
              </Link>
            )}
            {filters.tag && (
              <Link href={hrefWith(basePath, filters, { tag: undefined, page: 1 })} className="inline-flex items-center gap-1.5 rounded-full bg-secondary py-1 pr-2 pl-3 text-primary hover:bg-secondary/70">
                #{filters.tag} <X className="size-3.5" aria-label="Clear tag" />
              </Link>
            )}
          </div>
          <div className="flex rounded-full border bg-card p-1 text-sm" role="group" aria-label="Sort articles">
            <Link href={hrefWith(basePath, filters, { sort: "latest", page: 1 })} className={cn("rounded-full px-4 py-1.5 font-medium transition-colors", filters.sort === "latest" ? "bg-primary text-white" : "text-muted-foreground hover:text-primary")}>
              Newest
            </Link>
            <Link href={hrefWith(basePath, filters, { sort: "popular", page: 1 })} className={cn("inline-flex items-center gap-1 rounded-full px-4 py-1.5 font-medium transition-colors", filters.sort === "popular" ? "bg-primary text-white" : "text-muted-foreground hover:text-primary")}>
              <Flame className="size-3.5" /> Most read
            </Link>
          </div>
        </div>

        {featured && (
          <div className="mb-10">
            <FeaturedPostCard post={featured} />
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : featured ? null : (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
              <Newspaper className="size-6" />
            </span>
            <h2 className="font-heading text-xl font-semibold">{filtered ? "No articles match" : "No articles yet"}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{filtered ? "Try another word or browse a category." : "We're writing our first stories. Check back soon."}</p>
            {filtered && (
              <Button asChild variant="outline" className="mt-2 rounded-full">
                <Link href={basePath}>Show all articles</Link>
              </Button>
            )}
          </div>
        )}

        <Pagination basePath={basePath} filters={filters} lastPage={posts?.meta.last_page ?? 1} />

        <aside className="mt-16 grid items-center gap-6 overflow-hidden rounded-3xl bg-primary p-8 text-white md:grid-cols-[1fr_auto] md:p-12">
          <div>
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">Taste what you just read about</h2>
            <p className="mt-2 max-w-xl text-white/80">Raw Sundarbans honey, river and sea fish, mud crab and golda prawn, collected by local families and delivered across Bangladesh.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="rounded-full">
            <Link href="/shop/">
              Shop the collection <ArrowRight />
            </Link>
          </Button>
        </aside>
      </Container>
    </>
  );
}

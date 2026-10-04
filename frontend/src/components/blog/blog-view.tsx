"use client";

import { LayoutGrid, List, Newspaper, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { FeaturedPostCard, PostCard, PostCardSkeleton } from "@/components/blog/post-card";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { IconGlyph } from "@/components/shared/icon-glyph";
import { PageHeader } from "@/components/shared/page-breadcrumb";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type BlogFilters, useBlogCategories, useBlogPosts } from "@/lib/queries";
import { cn } from "@/lib/utils";

const CHIP = "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors";

export function BlogView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const tag = params.get("tag") ?? "";
  const sort: NonNullable<BlogFilters["sort"]> = params.get("sort") === "popular" ? "popular" : "latest";
  const page = Number(params.get("page") ?? 1) || 1;
  const view = params.get("view") === "list" ? "list" : "grid";
  const [search, setSearch] = useState(q);

  const { data: categories } = useBlogCategories();
  const filtered = Boolean(q || category || tag || sort !== "latest");
  const showFeatured = !filtered && page === 1;
  const { data: featured } = useBlogPosts({ featured: true, per_page: 1 }, showFeatured);
  const hero = showFeatured ? featured?.data[0] : undefined;
  const { data, isLoading, isFetching } = useBlogPosts({
    q: q || undefined,
    category: category || undefined,
    tag: tag || undefined,
    sort,
    page,
    per_page: 12,
  });
  const posts = data?.data.filter((post) => post.id !== hero?.id);

  const update = (changes: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  useEffect(() => {
    const term = search.trim();
    if (term === q) return;
    const timer = setTimeout(() => update({ q: term || null }), 400);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = categories?.find((item) => item.slug === category);

  return (
    <>
      <PageHeader
        title={active ? active.name : "Blog"}
        description={active?.description || "Stories from the Sundarbans, recipes, and tips for choosing the best fish, crab and honey."}
        breadcrumb={active ? [{ label: "Blog", href: "/blog" }, { label: active.name }] : [{ label: "Blog" }]}
      />
      <Container className="pb-20 md:pb-10">
        {categories && categories.length > 0 && (
          <nav aria-label="Blog categories" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <button
              type="button"
              onClick={() => update({ category: null })}
              className={cn(CHIP, !category ? "border-primary bg-primary text-white" : "bg-card hover:border-primary hover:text-primary")}
              aria-pressed={!category}
            >
              <Newspaper className="size-4" /> All posts
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => update({ category: item.slug })}
                className={cn(CHIP, item.slug === category ? "border-primary bg-primary text-white" : "bg-card hover:border-primary hover:text-primary")}
                aria-pressed={item.slug === category}
              >
                {item.icon_nodes && <IconGlyph nodes={item.icon_nodes} className="size-4" />}
                {item.name}
                {item.posts_count !== undefined && <span className="text-xs opacity-70">{item.posts_count}</span>}
              </button>
            ))}
          </nav>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border bg-card p-2">
          <div className="relative min-w-48 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles…"
              maxLength={100}
              aria-label="Search articles"
              className="h-9 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
            />
          </div>
          <Select value={sort} onValueChange={(value) => update({ sort: value === "latest" ? null : value })}>
            <SelectTrigger size="sm" className="w-36 rounded-lg" aria-label="Sort articles">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Newest first</SelectItem>
              <SelectItem value="popular">Most read</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
            <Button size="icon-sm" variant={view === "grid" ? "default" : "ghost"} aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => update({ view: null }, false)}>
              <LayoutGrid />
            </Button>
            <Button size="icon-sm" variant={view === "list" ? "default" : "ghost"} aria-label="List view" aria-pressed={view === "list"} onClick={() => update({ view: "list" }, false)}>
              <List />
            </Button>
          </div>
        </div>

        {(q || tag) && (
          <div className="mb-5 flex flex-wrap gap-2">
            {q && (
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary py-1 pr-1 pl-4 text-sm text-primary">
                Results for <strong>“{q}”</strong>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-full hover:bg-card"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearch("");
                    update({ q: null });
                  }}
                >
                  <X />
                </Button>
              </span>
            )}
            {tag && (
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary py-1 pr-1 pl-4 text-sm text-primary">
                Tagged <strong>#{tag}</strong>
                <Button variant="ghost" size="icon-xs" className="rounded-full hover:bg-card" aria-label="Clear tag" onClick={() => update({ tag: null })}>
                  <X />
                </Button>
              </span>
            )}
          </div>
        )}

        {hero && (
          <div className="mb-8">
            <FeaturedPostCard post={hero} />
          </div>
        )}

        {isLoading ? (
          <div className={view === "list" ? "space-y-4" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
            {Array.from({ length: 6 }, (_, index) => (
              <PostCardSkeleton key={index} layout={view} />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className={cn(view === "list" ? "space-y-4" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3", isFetching && "opacity-60 transition-opacity")}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} layout={view} />
            ))}
          </div>
        ) : hero ? null : (
          <EmptyState
            icon={Newspaper}
            title={filtered ? "No articles found" : "No articles yet"}
            description={filtered ? "Try another search or category." : "We're writing our first stories. Check back soon."}
            action={
              filtered ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    router.replace(pathname, { scroll: false });
                  }}
                >
                  Show all articles
                </Button>
              ) : undefined
            }
          />
        )}

        <SimplePagination
          page={data?.meta.current_page ?? page}
          lastPage={data?.meta.last_page ?? 1}
          onChange={(target) => {
            update({ page: String(target) }, false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </Container>
    </>
  );
}

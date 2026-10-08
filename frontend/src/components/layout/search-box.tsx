"use client";

import { ArrowRight, Clock, Flame, LayoutGrid, Loader2, PackageSearch, Search, ShoppingBag, Trash2, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { Stars } from "@/components/reviews/stars";
import { RemoteImage } from "@/components/shared/remote-image";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartActions } from "@/hooks/use-cart-actions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { formatPrice } from "@/lib/format";
import { useCategories, useProducts } from "@/lib/queries";
import type { Category, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

import { CategoryThumb } from "./main-nav";

const MIN_CHARS = 2;
const PRODUCT_LIMIT = 8;
const POPULAR_LIMIT = 6;

type Option = { id: string; href: string };

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps the parts of `text` that match `query` (case-insensitive) in a highlight. */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="rounded-sm bg-primary/15 font-semibold text-primary">
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/** A short piece of the description around the match, for products found by their description. */
function snippet(text: string | null, query: string): string | null {
  if (!text || !query) return null;
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  if (at < 0) return null;
  const start = Math.max(0, at - 20);
  const end = Math.min(text.length, at + query.length + 36);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

function SidebarTitle({ icon, children, action }: { icon: ReactNode; children: string; action?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        {icon}
        {children}
      </p>
      {action}
    </div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-b-2 bg-background px-1 font-sans text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border">
          <Skeleton className="aspect-square rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultCard({
  product,
  query,
  selected,
  optionProps,
  onOpen,
  onAdd,
}: {
  product: Product;
  query: string;
  selected: boolean;
  optionProps: Record<string, unknown>;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const saving = product.compare_price && product.price && product.compare_price > product.price ? product.compare_price - product.price : 0;
  const discount = saving ? Math.round((saving / product.compare_price!) * 100) : 0;
  const soldOut = product.in_stock === false;
  const needle = query.toLowerCase();
  const nameMatch = !query || product.name.toLowerCase().includes(needle) || product.category?.name.toLowerCase().includes(needle);
  const matchText = nameMatch ? null : snippet(product.short_description, query);

  return (
    <div
      {...optionProps}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-black/10",
        selected && "-translate-y-0.5 border-primary/60 shadow-lg ring-2 ring-primary/20",
      )}
    >
      <span className="relative block aspect-square overflow-hidden bg-muted">
        <RemoteImage
          src={product.thumbnail}
          alt=""
          sizes="(max-width: 640px) 45vw, 220px"
          className={cn("transition-transform duration-500 group-hover:scale-105", soldOut && "grayscale")}
        />
        {discount > 0 && <span className="absolute top-2 left-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">-{discount}%</span>}
        {soldOut && <span className="absolute top-2 left-2 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white">Sold out</span>}
        <button
          type="button"
          tabIndex={-1}
          disabled={soldOut}
          aria-label={`Add ${product.name} to cart`}
          title="Add to cart"
          onClick={onAdd}
          className="absolute right-2 bottom-2 z-10 flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-md transition-all hover:scale-105 hover:bg-primary/90 disabled:hidden sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-aria-selected:translate-y-0 sm:group-aria-selected:opacity-100"
        >
          <ShoppingBag className="size-4" />
        </button>
      </span>

      <span className="flex flex-1 flex-col p-3">
        {product.category && (
          <span className="truncate text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            <Highlight text={product.category.name} query={query} />
          </span>
        )}
        <Link
          href={`/product?slug=${product.slug}`}
          onClick={onOpen}
          tabIndex={-1}
          title={product.name}
          className="font-bangla mt-0.5 line-clamp-2 min-h-[2lh] text-sm leading-snug font-medium text-foreground after:absolute after:inset-0 group-hover:text-primary"
        >
          <Highlight text={product.name} query={query} />
        </Link>
        {matchText && (
          <span className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
            <Highlight text={matchText} query={query} />
          </span>
        )}
        {product.rating?.count ? (
          <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Stars value={product.rating.average} starClassName="size-3" />({product.rating.count})
          </span>
        ) : null}
        <span className="mt-auto pt-2">
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
            {product.unit && <span className="text-[11px] text-muted-foreground">/ {product.unit}</span>}
          </span>
          {saving > 0 && (
            <span className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compare_price)}</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">{formatPrice(saving)} OFF</span>
            </span>
          )}
        </span>
      </span>
    </div>
  );
}

export function SearchBox({ className, onSubmitted }: { className?: string; onSubmitted?: () => void }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToCart } = useCartActions();
  const recent = useRecentSearches();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const typed = term.trim();
  const query = useDebouncedValue(typed, 300);
  const searching = query.length >= MIN_CHARS;
  const idle = typed.length < MIN_CHARS;

  const { data: allCategories } = useCategories();
  const results = useProducts({ q: query, per_page: PRODUCT_LIMIT }, searching);
  const trending = useProducts({ sort: "popular", per_page: PRODUCT_LIMIT }, open);

  const needle = query.toLowerCase();
  const matchedCategories = searching ? (allCategories ?? []).filter((c) => c.name.toLowerCase().includes(needle)) : [];
  const categories: Category[] = idle ? (allCategories ?? []) : matchedCategories;
  const products: Product[] = idle ? (trending.data?.data ?? []) : searching ? (results.data?.data ?? []) : [];
  const highlight = idle ? "" : query;

  // Tags of best sellers make good one-tap searches; category names fill in when products have none.
  const popular = [
    ...new Set([...(trending.data?.data ?? []).flatMap((p) => p.tags ?? []), ...(allCategories ?? []).map((c) => c.name)]),
  ]
    .filter((item) => !recent.items.some((r) => r.toLowerCase() === item.toLowerCase()))
    .slice(0, POPULAR_LIMIT);

  const pending = !idle && (typed !== query || (results.isFetching && !results.data));
  const stale = !idle && (typed !== query || results.isFetching);
  const total = idle || stale ? undefined : results.data?.meta.total;
  const resultsHref = `/shop?q=${encodeURIComponent(typed)}`;
  const footerHref = idle ? "/shop" : resultsHref;
  const noResults = searching && !pending && !matchedCategories.length && !products.length;

  const options: Option[] = [
    ...categories.map((c) => ({ id: `${listId}-c${c.id}`, href: `/shop?category=${c.slug}` })),
    ...products.map((p) => ({ id: `${listId}-p${p.id}`, href: `/product?slug=${p.slug}` })),
    { id: `${listId}-all`, href: footerHref },
  ];
  const footerIndex = options.length - 1;
  const showPanel = open;

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const finish = () => {
    if (!idle) recent.remember(typed);
    close();
    onSubmitted?.();
  };

  const go = (href: string) => {
    finish();
    router.push(href);
  };

  const searchFor = (value: string) => {
    setTerm(value);
    setActive(-1);
    setOpen(true);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      // -1 means "back in the input", so the cycle is input -> options -> input.
      setActive((current) => {
        const next = current + step;
        if (next < -1) return options.length - 1;
        return next >= options.length ? -1 : next;
      });
    }
  };

  const optionProps = (index: number) => ({
    id: options[index].id,
    role: "option" as const,
    "aria-selected": active === index,
    onMouseEnter: () => setActive(index),
  });

  const sidebarLink = "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

  return (
    <div className={className} onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && close()}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const option = options[active];
          go(option ? option.href : typed ? resultsHref : "/shop");
        }}
      >
        <div
          className={cn(
            "flex h-11 w-full items-center overflow-hidden rounded-full border bg-muted/60 pl-4 transition-colors focus-within:border-primary/50 focus-within:bg-card focus-within:ring-3 focus-within:ring-primary/10",
            showPanel && "border-primary/50 bg-card",
          )}
        >
          {pending ? <Loader2 className="size-4 shrink-0 animate-spin text-primary" /> : <Search className="size-4 shrink-0 text-muted-foreground" />}
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            value={term}
            onChange={(event) => searchFor(event.target.value)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search fish, crab, prawn, honey…"
            aria-label="Search products"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-activedescendant={showPanel && options[active] ? options[active].id : undefined}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {term && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => searchFor("")}
              className="mr-1 flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
          <button type="submit" className="mr-1 h-9 shrink-0 rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90">
            Search
          </button>
        </div>
      </form>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          // Keeps focus in the input so clicking inside the panel doesn't close it first.
          onMouseDown={(event) => event.preventDefault()}
          className="absolute inset-x-4 top-full z-50 mt-1 flex max-h-[min(80vh,42rem)] flex-col overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-2xl shadow-black/20 ring-1 ring-black/5 animate-in fade-in-0 slide-in-from-top-2 duration-150 sm:inset-x-6"
        >
          <div className="grid min-h-0 flex-1 overflow-y-auto overscroll-contain md:grid-cols-[15rem_1fr] md:overflow-hidden">
            <aside className="space-y-5 border-b bg-muted/30 p-4 md:overflow-y-auto md:border-r md:border-b-0 md:p-5">
              {recent.items.length > 0 && (
                <section>
                  <SidebarTitle
                    icon={<Clock className="size-4 text-muted-foreground" />}
                    action={
                      <button
                        type="button"
                        onClick={recent.clear}
                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" /> Clear
                      </button>
                    }
                  >
                    Recent searches
                  </SidebarTitle>
                  <ul className="flex flex-wrap gap-1.5 md:flex-col md:gap-0">
                    {recent.items.map((item) => (
                      <li key={item} className="group/recent relative">
                        <button
                          type="button"
                          onClick={() => searchFor(item)}
                          className={cn(sidebarLink, "rounded-full border bg-card pr-7 md:rounded-lg md:border-0 md:bg-transparent")}
                        >
                          <span className="truncate">{item}</span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${item} from recent searches`}
                          onClick={() => recent.remove(item)}
                          className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground opacity-100 transition-opacity hover:bg-muted hover:text-foreground md:opacity-0 md:group-hover/recent:opacity-100"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {popular.length > 0 && (
                <section>
                  <SidebarTitle icon={<TrendingUp className="size-4 text-gold" />}>Popular searches</SidebarTitle>
                  <ul className="flex flex-wrap gap-1.5 md:flex-col md:gap-0">
                    {popular.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => searchFor(item)}
                          className={cn(sidebarLink, "rounded-full border bg-card md:rounded-lg md:border-0 md:bg-transparent")}
                        >
                          <Search className="hidden size-3.5 shrink-0 md:block" />
                          <span className="truncate">{item}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {categories.length > 0 && (
                <section className={cn("transition-opacity", stale && "opacity-60")}>
                  <SidebarTitle icon={<LayoutGrid className="size-4 text-primary" />}>{idle ? "Categories" : "Matching categories"}</SidebarTitle>
                  <div className="flex flex-wrap gap-1.5 md:flex-col md:gap-0.5">
                    {categories.map((category, index) => (
                      <Link
                        key={category.id}
                        href={`/shop?category=${category.slug}`}
                        {...optionProps(index)}
                        onClick={finish}
                        className={cn(
                          "flex items-center gap-2.5 rounded-full border bg-card py-1 pr-3 pl-1 text-sm transition-colors hover:bg-accent md:rounded-lg md:border-0 md:bg-transparent md:px-2 md:py-1.5",
                          active === index && "bg-accent ring-1 ring-primary/30 md:bg-accent",
                        )}
                      >
                        <CategoryThumb category={category} />
                        <span className="min-w-0 flex-1 truncate font-medium">
                          <Highlight text={category.name} query={highlight} />
                        </span>
                        {category.products_count !== undefined && (
                          <span className="rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground tabular-nums">{category.products_count}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </aside>

            <section className="flex min-h-0 flex-col md:overflow-y-auto">
              <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 md:px-5 md:pt-5">
                <h3 className="flex min-w-0 items-center gap-2 text-base font-semibold">
                  {idle ? (
                    <>
                      <Flame className="size-4 shrink-0 text-gold" /> Trending products
                    </>
                  ) : (
                    <span className="truncate">
                      Results for <span className="text-primary">“{typed}”</span>
                    </span>
                  )}
                </h3>
                {total !== undefined && total > 0 && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {total} product{total === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              <div className="flex-1 px-4 pb-4 md:px-5 md:pb-5">
                {products.length > 0 ? (
                  <div className={cn("grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 lg:grid-cols-4", stale && "opacity-60")}>
                    {products.map((product, i) => {
                      const index = categories.length + i;
                      return (
                        <ResultCard
                          key={product.id}
                          product={product}
                          query={highlight}
                          selected={active === index}
                          optionProps={optionProps(index)}
                          onOpen={finish}
                          onAdd={() => addToCart(product)}
                        />
                      );
                    })}
                  </div>
                ) : noResults ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
                      <PackageSearch className="size-8" />
                    </span>
                    <p className="mt-4 font-semibold">No results for “{query}”</p>
                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">Check the spelling, or pick a popular search or category on the left.</p>
                  </div>
                ) : (
                  <CardGridSkeleton />
                )}
              </div>
            </section>
          </div>

          <div className="flex items-center justify-between gap-3 border-t bg-muted/40 px-4 py-2.5">
            <p className="hidden items-center gap-3 text-[11px] text-muted-foreground md:flex">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> move
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd> open
              </span>
              <span className="flex items-center gap-1">
                <Kbd>esc</Kbd> close
              </span>
            </p>
            <Link
              href={footerHref}
              {...optionProps(footerIndex)}
              onClick={finish}
              className={cn(
                "ml-auto flex min-w-0 items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white",
                active === footerIndex && "bg-primary text-white",
              )}
            >
              <span className="truncate">{idle ? "Browse all products" : `See all ${total ? `${total} ` : ""}results`}</span>
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

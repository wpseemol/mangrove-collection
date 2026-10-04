"use client";

import { ArrowRight, Loader2, PackageSearch, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useId, useState, type KeyboardEvent } from "react";

import { RemoteImage } from "@/components/shared/remote-image";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatPrice } from "@/lib/format";
import { useCategories, useProducts } from "@/lib/queries";
import type { Category, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

import { CategoryThumb } from "./main-nav";

const MIN_CHARS = 2;
const PRODUCT_LIMIT = 6;
const CATEGORY_LIMIT = 4;

type Option = { id: string; href: string };

/** Wraps the parts of `text` that match `query` (case-insensitive) in a highlight. */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-transparent font-semibold text-primary">
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

function GroupLabel({ children }: { children: string }) {
  return <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{children}</p>;
}

export function SearchBox({ className, onSubmitted }: { className?: string; onSubmitted?: () => void }) {
  const router = useRouter();
  const listId = useId();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const typed = term.trim();
  const query = useDebouncedValue(typed, 300);
  const searching = query.length >= MIN_CHARS;

  const { data: allCategories } = useCategories();
  const { data, isFetching } = useProducts({ q: query, per_page: PRODUCT_LIMIT }, searching);

  const needle = query.toLowerCase();
  const categories: Category[] = searching ? (allCategories ?? []).filter((c) => c.name.toLowerCase().includes(needle)).slice(0, CATEGORY_LIMIT) : [];
  const products: Product[] = searching ? (data?.data ?? []) : [];
  const pending = typed !== query || (isFetching && !data);
  const stale = typed !== query || isFetching;
  const total = stale ? undefined : data?.meta.total;
  const resultsHref = `/shop?q=${encodeURIComponent(typed)}`;

  const options: Option[] = [
    ...categories.map((c) => ({ id: `${listId}-c${c.id}`, href: `/shop?category=${c.slug}` })),
    ...products.map((p) => ({ id: `${listId}-p${p.id}`, href: `/product?slug=${p.slug}` })),
  ];
  const hasResults = options.length > 0;
  if (hasResults) options.push({ id: `${listId}-all`, href: resultsHref });
  const showPanel = open && typed.length >= MIN_CHARS;
  const groupClass = cn("transition-opacity", stale && "opacity-60");

  const go = (href: string) => {
    setOpen(false);
    setActive(-1);
    router.push(href);
    onSubmitted?.();
  };

  const updateTerm = (value: string) => {
    setTerm(value);
    setActive(-1);
    setOpen(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!options.length) return;
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
    onClick: () => {
      setOpen(false);
      setActive(-1);
      onSubmitted?.();
    },
  });

  return (
    <div
      className={cn("relative", className)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setOpen(false)}
    >
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const option = options[active];
          go(option ? option.href : typed ? resultsHref : "/shop");
        }}
      >
        <div className="flex h-11 w-full items-center overflow-hidden rounded-full border bg-muted/60 pl-4 transition-colors focus-within:border-primary/50 focus-within:bg-card focus-within:ring-3 focus-within:ring-primary/10">
          {pending && showPanel ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search className="size-4 shrink-0 text-muted-foreground" />
          )}
          <input
            type="search"
            value={term}
            onChange={(event) => updateTerm(event.target.value)}
            onFocus={() => setOpen(true)}
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
          <button type="submit" className="mr-1 h-9 rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90">
            Search
          </button>
        </div>
      </form>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          // Keeps focus in the input so clicking a suggestion doesn't close the panel first.
          onMouseDown={(event) => event.preventDefault()}
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[min(70vh,32rem)] overflow-y-auto rounded-2xl border bg-popover pb-1.5 text-popover-foreground shadow-xl shadow-black/10 animate-in fade-in-0 slide-in-from-top-1 duration-150"
        >
          {categories.length > 0 && (
            <div className={groupClass}>
              <GroupLabel>Categories</GroupLabel>
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  {...optionProps(index)}
                  className={cn("mx-1.5 flex items-center gap-3 rounded-lg px-2 py-2 text-sm", active === index && "bg-accent text-accent-foreground")}
                >
                  <CategoryThumb category={category} />
                  <span className="min-w-0 flex-1 truncate">
                    <Highlight text={category.name} query={query} />
                  </span>
                  {category.products_count !== undefined && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {category.products_count} product{category.products_count === 1 ? "" : "s"}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div className={groupClass}>
              <GroupLabel>Products</GroupLabel>
              {products.map((product, i) => {
                const index = categories.length + i;
                return (
                  <Link
                    key={product.id}
                    href={`/product?slug=${product.slug}`}
                    {...optionProps(index)}
                    className={cn("mx-1.5 flex items-center gap-3 rounded-lg px-2 py-2", active === index && "bg-accent text-accent-foreground")}
                  >
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <RemoteImage src={product.thumbnail} alt="" sizes="44px" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-bangla block truncate text-sm text-foreground">
                        <Highlight text={product.name} query={query} />
                      </span>
                      {product.category && (
                        <span className="block truncate text-xs text-muted-foreground">
                          <Highlight text={product.category.name} query={query} />
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-right text-sm font-semibold text-primary">
                      {formatPrice(product.price)}
                      {product.unit && <span className="block text-[11px] font-normal text-muted-foreground">/ {product.unit}</span>}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {searching && !pending && !hasResults && (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <PackageSearch className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No results for “{query}”</p>
              <p className="text-xs text-muted-foreground">Try another word, like fish, crab or honey.</p>
            </div>
          )}

          {pending && !hasResults && (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Searching…
            </div>
          )}

          {hasResults && (
            <>
              <div className="mx-1.5 my-1.5 h-px bg-border" />
              <Link
                href={resultsHref}
                {...optionProps(options.length - 1)}
                className={cn(
                  "mx-1.5 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-primary",
                  active === options.length - 1 && "bg-accent",
                )}
              >
                <span className="truncate">
                  See all {total ? `${total} ` : ""}results for “{typed}”
                </span>
                <ArrowRight className="size-4 shrink-0" />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

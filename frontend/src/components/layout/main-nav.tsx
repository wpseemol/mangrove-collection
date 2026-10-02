"use client";

import { ChevronDown, LayoutGrid, Tag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Container } from "@/components/shared/container";
import { IconGlyph } from "@/components/shared/icon-glyph";
import { RemoteImage } from "@/components/shared/remote-image";
import { useCategories } from "@/lib/queries";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { href: "/categories", label: "Categories" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
];

const MENU_ITEM = "flex items-center justify-between rounded-md px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground";

/** Uploaded image first, then the chosen icon (same order as the home category cards). */
function CategoryThumb({ category }: { category: Category }) {
  return (
    <span className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary text-primary">
      {category.image ? (
        <RemoteImage src={category.image} alt="" sizes="28px" />
      ) : category.icon_nodes ? (
        <IconGlyph nodes={category.icon_nodes} className="size-4" />
      ) : (
        <LayoutGrid className="size-3.5 opacity-60" />
      )}
    </span>
  );
}

function CategoryMenu() {
  const { data: categories } = useCategories();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
      onFocus={() => setOpen(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && close()}
      onKeyDown={(e) => e.key === "Escape" && close()}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white outline-none hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <LayoutGrid className="size-4" /> Browse categories
        <ChevronDown className={cn("size-3.5 opacity-80 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 pt-2">
          <div className="w-64 rounded-lg bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
            {categories?.map((category) => (
              <Link key={category.id} href={`/shop?category=${category.slug}`} onClick={close} className={MENU_ITEM}>
                <span className="flex min-w-0 items-center gap-2.5">
                  <CategoryThumb category={category} />
                  <span className="truncate">{category.name}</span>
                </span>
                {category.products_count !== undefined && <span className="text-xs text-muted-foreground">{category.products_count}</span>}
              </Link>
            ))}
            {categories?.length ? <div className="-mx-1.5 my-1 h-px bg-border" /> : null}
            <Link href="/categories" onClick={close} className={cn(MENU_ITEM, "font-medium text-primary")}>
              View all categories
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function MainNav() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Main" className="hidden border-b bg-card md:block">
      <Container className="flex h-12 items-center gap-8">
        <CategoryMenu />

        <ul className="flex h-full items-center gap-7">
          {[{ href: "/", label: "Home" }, ...NAV_LINKS.slice(1)].map((link) => {
            const active = link.href === "/" ? pathname === "/" : isActive(link.href);
            return (
              <li key={link.href} className="h-full">
                <Link
                  href={link.href}
                  className={cn(
                    "relative flex h-full items-center text-sm font-medium transition-colors hover:text-primary",
                    active ? "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary" : "text-foreground/80",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href="/offers" className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold/80">
          <Tag className="size-4" /> Today&apos;s offers
        </Link>
      </Container>
    </nav>
  );
}

"use client";

import { ChevronDown, LayoutGrid, Tag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/shared/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCategories } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { href: "/categories", label: "Categories" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
];

export function MainNav() {
  const pathname = usePathname();
  const { data: categories } = useCategories();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Main" className="hidden border-b bg-card md:block">
      <Container className="flex h-12 items-center gap-8">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white outline-none hover:bg-primary/90">
            <LayoutGrid className="size-4" /> Browse categories <ChevronDown className="size-3.5 opacity-80" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 p-1.5">
            {categories?.map((category) => (
              <DropdownMenuItem key={category.id} asChild className="py-2">
                <Link href={`/shop?category=${category.slug}`} className="flex justify-between">
                  {category.name}
                  {category.products_count !== undefined && <span className="text-xs text-muted-foreground">{category.products_count}</span>}
                </Link>
              </DropdownMenuItem>
            ))}
            {categories?.length ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem asChild className="py-2">
              <Link href="/categories" className="font-medium text-primary">
                View all categories
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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

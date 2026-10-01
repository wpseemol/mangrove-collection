"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  { href: "/categories", label: "Category" },
  { href: "/shop", label: "Products" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export function MainNav() {
  const pathname = usePathname();
  const { data: categories } = useCategories();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const linkClass = (href: string) =>
    cn("text-sm font-medium transition-colors hover:text-brand", isActive(href) ? "text-brand" : "text-gray-900");

  return (
    <nav aria-label="Main" className="hidden border-b bg-white md:block">
      <ul className="flex h-11 items-center justify-center gap-8">
        <li>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className={cn(linkClass("/categories"), "flex items-center gap-1 outline-none")}>
              Category <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {categories?.map((category) => (
                <DropdownMenuItem key={category.id} asChild>
                  <Link href={`/shop?category=${category.slug}`}>{category.name}</Link>
                </DropdownMenuItem>
              ))}
              {categories?.length ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem asChild>
                <Link href="/categories" className="font-medium">
                  All categories
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
        {NAV_LINKS.slice(1).map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

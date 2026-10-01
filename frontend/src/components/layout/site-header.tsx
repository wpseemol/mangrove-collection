"use client";

import { DollarSign, Menu, Search, ShoppingBasket, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useHydrated } from "@/hooks/use-hydrated";
import { useAuthStore } from "@/stores/auth";
import { cartCount, useCartStore } from "@/stores/cart";

import { NAV_LINKS } from "./main-nav";

function SearchForm({ className, onSubmitted }: { className?: string; onSubmitted?: () => void }) {
  const router = useRouter();
  const [term, setTerm] = useState("");

  return (
    <form
      role="search"
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        router.push(term.trim() ? `/shop?q=${encodeURIComponent(term.trim())}` : "/shop");
        onSubmitted?.();
      }}
    >
      <div className="flex h-9 w-full overflow-hidden rounded-sm border border-white/80 bg-black">
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search"
          aria-label="Search products"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white placeholder:text-white/80 focus:outline-none"
        />
        <button type="submit" aria-label="Search" className="flex w-10 items-center justify-center bg-primary text-white hover:bg-primary/85">
          <Search className="size-4" />
        </button>
      </div>
    </form>
  );
}

function HeaderLink({
  href,
  icon: Icon,
  title,
  subtitle,
  badge,
}: {
  href: string;
  icon: typeof DollarSign;
  title: string;
  subtitle: string;
  badge?: number;
}) {
  return (
    <Link href={href} className="group flex items-center gap-2 text-white">
      <span className="relative">
        <Icon className="size-6 text-brand transition-transform group-hover:scale-110" strokeWidth={1.8} />
        {badge ? (
          <span className="absolute -top-2 -right-2 flex size-4.5 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-black">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span className="hidden leading-tight lg:block">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-white/80">{subtitle}</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const count = hydrated ? cartCount(items) : 0;
  const signedIn = hydrated && Boolean(user);

  return (
    <header className="sticky top-0 z-40 bg-black">
      <Container className="flex h-16 items-center gap-4 lg:gap-8">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col px-4">
              {[{ href: "/", label: "Home" }, ...NAV_LINKS, { href: "/offers", label: "Offers" }, { href: "/track-order", label: "Track Order" }].map(
                (link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="border-b py-3 text-sm font-medium text-gray-800 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Logo className="shrink-0" />

        <SearchForm className="hidden flex-1 md:block md:max-w-xs lg:max-w-sm" />

        <nav className="ml-auto flex items-center gap-5 lg:gap-8" aria-label="Shortcuts">
          <span className="hidden sm:block">
            <HeaderLink href="/offers" icon={DollarSign} title="Offers" subtitle="Latest Offers" />
          </span>
          <HeaderLink href="/cart" icon={ShoppingBasket} title="Cart" subtitle="Add items" badge={count} />
          <span className="hidden sm:block">
            <HeaderLink href={signedIn ? "/account/orders" : "/track-order"} icon={ShoppingCart} title="Order" subtitle="My Order" />
          </span>
          <HeaderLink
            href={signedIn ? "/account" : "/login"}
            icon={UserRound}
            title="Account"
            subtitle={signedIn ? (user?.name.split(" ")[0] ?? "My Account") : "Register or Login"}
          />
        </nav>
      </Container>

      <Container className="pb-3 md:hidden">
        <SearchForm />
      </Container>
    </header>
  );
}

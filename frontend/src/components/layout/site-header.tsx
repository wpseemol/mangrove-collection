"use client";

import { LayoutDashboard, Menu, Package, Phone, Search, ShoppingBag, Truck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useHydrated } from "@/hooks/use-hydrated";
import { DASHBOARD_URL } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { useSettings } from "@/lib/queries";
import { isStaff } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { cartCount, cartSubtotal, useCartStore } from "@/stores/cart";

import { NAV_LINKS } from "./main-nav";
import { ThemeToggle } from "./theme-toggle";

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
      <div className="flex h-11 w-full items-center overflow-hidden rounded-full border bg-muted/60 pl-4 transition-colors focus-within:border-primary/50 focus-within:bg-card focus-within:ring-3 focus-within:ring-primary/10">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search fish, crab, prawn, honey…"
          aria-label="Search products"
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button type="submit" className="mr-1 h-9 rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary/90">
          Search
        </button>
      </div>
    </form>
  );
}

function HeaderAction({
  href,
  icon: Icon,
  label,
  caption,
  badge,
  className,
}: {
  href: string;
  icon: typeof UserRound;
  label: string;
  caption?: string;
  badge?: number;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted", className)}>
      <span className="relative flex size-10 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white dark:text-brand dark:group-hover:text-white">
        <Icon className="size-5" strokeWidth={1.8} />
        {badge ? (
          <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] leading-5 font-semibold text-white ring-2 ring-background">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span className="hidden leading-tight xl:block">
        <span className="block text-[11px] text-muted-foreground">{caption}</span>
        <span className="block text-sm font-semibold text-foreground">{label}</span>
      </span>
    </Link>
  );
}

function TopBar() {
  const { data: settings } = useSettings();
  const threshold = settings?.free_shipping_threshold;

  return (
    <div className="bg-forest text-xs text-white/80">
      <Container className="flex h-8 items-center justify-between gap-4 text-[11px] sm:h-9 sm:text-xs">
        <p className="flex items-center gap-2 truncate">
          <Truck className="size-3.5 shrink-0 text-brand" />
          {threshold ? `Free home delivery on orders over ${formatPrice(threshold)}` : "Home delivery all over Bangladesh"}
        </p>
        <div className="hidden items-center gap-5 sm:flex">
          {settings?.contact_phone && (
            <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-1.5 hover:text-white">
              <Phone className="size-3.5" /> {settings.contact_phone}
            </a>
          )}
          <Link href="/track-order" className="hover:text-white">
            Track order
          </Link>
          <Link href="/contact" className="hover:text-white">
            Help &amp; contact
          </Link>
        </div>
      </Container>
    </div>
  );
}

export function SiteHeader() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const count = hydrated ? cartCount(items) : 0;
  const signedIn = hydrated && Boolean(user);
  const staff = signedIn && isStaff(user);

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <Container className="flex h-16 items-center gap-2 md:h-[72px] md:gap-3 lg:gap-8">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2 md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader className="border-b">
                <SheetTitle asChild>
                  <div>
                    <Logo />
                  </div>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col px-2">
                {[{ href: "/", label: "Home" }, ...NAV_LINKS, { href: "/offers", label: "Offers" }, { href: "/track-order", label: "Track order" }].map(
                  (link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-3 text-[15px] font-medium text-foreground hover:bg-muted hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
                {staff && (
                  <a href={DASHBOARD_URL} className="mt-2 flex items-center gap-2 rounded-lg bg-secondary px-3 py-3 text-[15px] font-medium text-primary">
                    <LayoutDashboard className="size-4" /> Open dashboard
                  </a>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Logo className="shrink-0" />

          <SearchForm className="mx-auto hidden w-full max-w-xl flex-1 md:block" />

          <nav className="ml-auto flex items-center gap-1 md:ml-0" aria-label="Shortcuts">
            {staff && (
              <Button asChild variant="outline" size="sm" className="mr-2 hidden rounded-full border-primary/30 text-primary lg:inline-flex dark:text-brand">
                <a href={DASHBOARD_URL}>
                  <LayoutDashboard /> Dashboard
                </a>
              </Button>
            )}
            <ThemeToggle className="md:mr-1" />
            <HeaderAction
              href={signedIn ? "/account" : "/login"}
              icon={UserRound}
              caption={signedIn ? `Hi, ${user?.name.split(" ")[0] ?? "there"}` : "Welcome"}
              label={signedIn ? "My account" : "Sign in"}
              className="hidden md:flex"
            />
            <HeaderAction
              href={signedIn ? "/account/orders" : "/track-order"}
              icon={Package}
              caption="Track your"
              label="Orders"
              className="hidden lg:flex"
            />
            <HeaderAction
              href="/cart"
              icon={ShoppingBag}
              caption={`${count} item${count === 1 ? "" : "s"}`}
              label={hydrated ? formatPrice(cartSubtotal(items)) : "Cart"}
              badge={count}
              className="hidden md:flex"
            />
          </nav>
        </Container>

        <Container className="pb-3 md:hidden">
          <SearchForm />
        </Container>
      </header>
    </>
  );
}

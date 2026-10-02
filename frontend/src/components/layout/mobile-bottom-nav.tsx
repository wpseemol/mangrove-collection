"use client";

import { Home, LayoutGrid, ShoppingBag, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { cartCount, useCartStore } from "@/stores/cart";

export function MobileBottomNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);

  const count = hydrated ? cartCount(items) : 0;
  const signedIn = hydrated && Boolean(user);

  const tabs = [
    { href: "/", label: "Home", icon: Home, active: pathname === "/" },
    { href: "/categories", label: "Categories", icon: LayoutGrid, active: pathname.startsWith("/categories") },
    { href: "/shop", label: "Shop", icon: Store, active: pathname.startsWith("/shop") || pathname.startsWith("/product") },
    { href: "/cart", label: "Cart", icon: ShoppingBag, active: pathname.startsWith("/cart") || pathname.startsWith("/checkout"), badge: count },
    {
      href: signedIn ? "/account" : "/login",
      label: signedIn ? "Account" : "Sign in",
      icon: UserRound,
      active: ["/account", "/login", "/register"].some((p) => pathname.startsWith(p)),
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden"
    >
      <ul className="grid h-16 grid-cols-5">
        {tabs.map(({ href, label, icon: Icon, active, badge }) => (
          <li key={label}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-primary dark:text-brand" : "text-muted-foreground active:text-foreground",
              )}
            >
              <span className="relative">
                <Icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                {badge ? (
                  <span className="absolute -top-1.5 -right-2.5 flex min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] leading-[18px] font-semibold text-white ring-2 ring-background">
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

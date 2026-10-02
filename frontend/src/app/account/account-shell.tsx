"use client";

import { LayoutDashboard, LogOut, MapPin, Package, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Container } from "@/components/shared/container";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import { useLogout } from "@/hooks/use-logout";
import { useMe } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "My orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Account settings", icon: Settings },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const { token, user } = useAuthStore();
  const logout = useLogout();
  useMe();

  useEffect(() => {
    if (hydrated && !token) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [hydrated, token, pathname, router]);

  if (!hydrated || !token) {
    return (
      <Container className="grid gap-6 py-8 md:grid-cols-[240px_1fr]">
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </Container>
    );
  }

  const isActive = (href: string) => (href === "/account" ? pathname.replace(/\/$/, "") === "/account" : pathname.startsWith(href));

  return (
    <Container>
      <PageBreadcrumb items={[{ label: "My account" }]} />
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <aside className="h-fit overflow-hidden rounded-2xl border bg-white md:sticky md:top-28">
          <div className="flex items-center gap-3 border-b bg-surface/60 p-5">
            <Avatar className="size-12 ring-2 ring-white">
              <AvatarImage src={user?.avatar ?? "/assets/user-avatar.png"} alt="" />
              <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col">
            {LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(href) ? "bg-secondary text-primary" : "text-gray-700 hover:bg-muted",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={logout}
              className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-destructive md:mt-1 md:border-t md:pt-3"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}

"use client";

import { MapPin, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddresses, useMyOrders } from "@/lib/queries";
import { useAuthStore } from "@/stores/auth";

import { OrdersList } from "./orders/orders-table";

export function AccountOverview() {
  const user = useAuthStore((s) => s.user);
  const { data: orders, isLoading } = useMyOrders(1);
  const { data: addresses } = useAddresses();

  const stats = [
    { label: "Total orders", value: orders?.meta.total ?? "—", icon: Package, href: "/account/orders" },
    { label: "Saved addresses", value: addresses?.length ?? "—", icon: MapPin, href: "/account/addresses" },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-forest p-8 text-white">
        <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-brand/25 blur-3xl" />
        <p className="relative text-xs font-semibold tracking-[0.2em] text-gold uppercase">My account</p>
        <h1 className="font-heading relative mt-2 text-3xl font-semibold">Hello, {user?.name?.split(" ")[0] ?? "there"}!</h1>
        <p className="relative mt-1 text-sm text-white/80">Manage your orders, addresses and account details.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="flex items-center gap-4 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lg hover:shadow-black/5">
            <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-foreground">Recent orders</h2>
          {orders && orders.data.length > 0 && (
            <Link href="/account/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-40" />
        ) : orders?.data.length ? (
          <OrdersList orders={orders.data.slice(0, 5)} />
        ) : (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="When you place an order it will show up here."
            action={
              <Button asChild>
                <Link href="/shop">Start shopping</Link>
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}

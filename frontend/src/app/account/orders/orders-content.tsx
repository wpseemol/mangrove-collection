"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyOrders } from "@/lib/queries";

import { OrdersList } from "./orders-table";

export function OrdersContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyOrders(page);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">My orders</h1>
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data?.data.length ? (
        <>
          <OrdersList orders={data.data} />
          <SimplePagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />
        </>
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
    </div>
  );
}

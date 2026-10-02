import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/account/orders/details?number=${encodeURIComponent(order.order_number)}`}
            className="flex items-center gap-4 p-5 transition-colors hover:bg-surface/60"
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-medium text-foreground">{order.order_number}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.created_at)}
                {order.items ? ` · ${order.items.length} item(s)` : ""}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
            <span className="w-24 text-right text-sm font-medium">{formatPrice(order.total)}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

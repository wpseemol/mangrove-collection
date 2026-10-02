import { Check } from "lucide-react";
import Link from "next/link";

import { RemoteImage } from "@/components/shared/remote-image";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPrice, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

import { OrderStatusBadge, PaymentStatusBadge } from "./order-status-badge";

const STEPS: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">This order has been cancelled.</p>;
  }

  const current = STEPS.indexOf(status);

  return (
    <ol className="grid grid-cols-4 gap-1">
      {STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step} className="flex flex-col items-center gap-1.5 text-center">
            <span className="flex w-full items-center">
              <span className={cn("h-0.5 flex-1", index === 0 ? "invisible" : done ? "bg-primary" : "bg-gray-200")} />
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium",
                  done ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-gray-400",
                )}
              >
                {done ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span className={cn("h-0.5 flex-1", index === STEPS.length - 1 ? "invisible" : index < current ? "bg-primary" : "bg-gray-200")} />
            </span>
            <span className={cn("text-xs", done ? "font-medium text-primary" : "text-muted-foreground")}>{ORDER_STATUS_LABEL[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetails({ order, actions }: { order: Order; actions?: React.ReactNode }) {
  const address = order.shipping_address;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Order number</p>
          <p className="font-mono text-lg font-semibold text-gray-900">{order.order_number}</p>
          <p className="text-sm text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
          {actions}
        </div>
      </div>

      <OrderProgress status={order.status} />

      <div className="overflow-hidden rounded-2xl border bg-white">
        <ul className="divide-y">
          {order.items?.map((item) => (
            <li key={item.id} className="flex gap-4 p-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border bg-muted">
                <RemoteImage src={item.image} alt={item.product_name} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/product?slug=${item.product_slug}`} className="font-bangla line-clamp-2 text-sm text-gray-900 hover:text-primary">
                  {item.product_name}
                </Link>
                {item.variant_title && <p className="text-xs text-muted-foreground">{item.variant_title}</p>}
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item.unit_price)} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium whitespace-nowrap">{formatPrice(item.line_total)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-2 bg-surface/70 p-5 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          <Row label={`Shipping${order.shipping_method ? ` (${order.shipping_method})` : ""}`} value={order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : "Free"} />
          {order.discount > 0 && <Row label="Discount" value={`- ${formatPrice(order.discount)}`} />}
          <Separator className="my-2" />
          <Row label="Total" value={formatPrice(order.total)} strong />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 text-sm">
          <h3 className="mb-2 font-medium text-gray-900">Delivery address</h3>
          <p className="text-gray-800">{address.name}</p>
          <p className="text-muted-foreground">{address.phone}</p>
          {address.email && <p className="text-muted-foreground">{address.email}</p>}
          <p className="mt-1 text-muted-foreground">
            {[address.full_address, address.landmark, address.zone, address.city, address.region].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 text-sm">
          <h3 className="mb-2 font-medium text-gray-900">Payment</h3>
          <p className="text-gray-800">{PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method}</p>
          {order.transaction_id && <p className="text-muted-foreground">Transaction ID: {order.transaction_id}</p>}
          {order.customer_note && (
            <>
              <h3 className="mt-3 mb-1 font-medium text-gray-900">Note</h3>
              <p className="text-muted-foreground">{order.customer_note}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4", strong ? "text-base font-semibold text-gray-900" : "text-gray-700")}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

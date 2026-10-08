import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/format";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const AMBER = "bg-amber-100 text-amber-800";
const GREEN = "bg-green-100 text-green-800";
const RED = "bg-red-100 text-red-700";

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  pending: AMBER,
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: GREEN,
  cancelled: RED,
};

const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  pending: AMBER,
  verifying: "bg-sky-100 text-sky-800",
  paid: GREEN,
  failed: RED,
  refunded: "bg-muted text-foreground/80",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={cn("border-0", ORDER_STATUS_STYLE[status])}>{ORDER_STATUS_LABEL[status] ?? status}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge className={cn("border-0", PAYMENT_STATUS_STYLE[status])}>{PAYMENT_STATUS_LABEL[status] ?? status}</Badge>;
}

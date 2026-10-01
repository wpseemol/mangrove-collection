import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL } from "@/lib/format";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-200 text-gray-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={cn("border-0", ORDER_STATUS_STYLE[status])}>{ORDER_STATUS_LABEL[status] ?? status}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge className={cn("border-0 capitalize", PAYMENT_STATUS_STYLE[status])}>Payment {status}</Badge>;
}

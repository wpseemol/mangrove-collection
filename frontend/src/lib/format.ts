export function formatPrice(amount: number | null | undefined, symbol = "৳"): string {
  const value = Number(amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return `${value} ${symbol}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Payment pending",
  verifying: "Verifying payment",
  paid: "Paid",
  failed: "Payment not verified",
  refunded: "Refunded",
};

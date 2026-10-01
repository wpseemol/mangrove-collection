import type { Order } from "@/lib/types";

const KEY = "mc-last-order";

/** Guests cannot fetch their order again without the phone, so the confirmation page reads it from here. */
export function rememberLastOrder(order: Order) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    // Storage may be unavailable (private mode); the page falls back to the order number.
  }
}

export function readLastOrder(orderNumber: string | null): Order | null {
  try {
    const order = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as Order | null;
    return order && order.order_number === orderNumber ? order : null;
  } catch {
    return null;
  }
}

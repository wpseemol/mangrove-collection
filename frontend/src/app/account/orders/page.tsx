import type { Metadata } from "next";

import { OrdersContent } from "./orders-content";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return <OrdersContent />;
}

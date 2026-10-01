"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";

import { OrderDetails } from "@/components/order/order-details";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { readLastOrder } from "@/lib/last-order";
import { useAuthStore } from "@/stores/auth";

const subscribe = () => () => {};

export function OrderSuccessContent() {
  const orderNumber = useSearchParams().get("number");
  const token = useAuthStore((s) => s.token);
  const raw = useSyncExternalStore(
    subscribe,
    () => sessionStorage.getItem("mc-last-order"),
    () => null,
  );
  const order = raw ? readLastOrder(orderNumber) : null;

  return (
    <Container className="max-w-3xl py-10">
      <div className="mb-8 text-center">
        <CircleCheck className="mx-auto mb-3 size-14 text-brand" />
        <h1 className="text-2xl font-semibold text-gray-900">Thank you for your order!</h1>
        <p className="mt-2 text-muted-foreground">
          {orderNumber ? (
            <>
              Your order <strong className="font-mono text-gray-900">{orderNumber}</strong> has been placed. We will call you shortly to confirm it.
            </>
          ) : (
            "Your order has been placed. We will call you shortly to confirm it."
          )}
        </p>
      </div>

      {order && (
        <div className="rounded-sm border p-5">
          <OrderDetails order={order} />
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
        {token && orderNumber ? (
          <Button asChild variant="outline">
            <Link href={`/account/orders/details?number=${encodeURIComponent(orderNumber)}`}>View order</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={`/track-order${orderNumber ? `?number=${encodeURIComponent(orderNumber)}` : ""}`}>Track order</Link>
          </Button>
        )}
      </div>
    </Container>
  );
}

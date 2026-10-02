"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { OrderDetails } from "@/components/order/order-details";
import { Container } from "@/components/shared/container";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-breadcrumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import type { Order } from "@/lib/types";

export function TrackOrderContent() {
  const params = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("number") ?? "");
  const [phone, setPhone] = useState("");

  const track = useMutation({
    mutationFn: () =>
      api<{ data: Order }>("/orders/track", { query: { order_number: orderNumber.trim(), phone: phone.trim() } }).then((r) => r.data),
  });

  const error = track.error instanceof ApiError ? track.error : null;
  const notFound = error?.status === 404;

  return (
    <>
      <PageHeader title="Track your order" description="Enter your order number and the phone number used at checkout." breadcrumb={[{ label: "Track order" }]} />
      <Container className="max-w-3xl">
        <div className="rounded-2xl border bg-card p-6 md:p-8">
          <form
            className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              track.mutate();
            }}
          >
            <FormField id="order_number" label="Order number" error={error?.field("order_number")}>
              <Input id="order_number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="e.g. MC261001AB12CD" required />
            </FormField>
            <FormField id="phone" label="Phone number" error={error?.field("phone")}>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" required />
            </FormField>
            <Button type="submit" disabled={track.isPending} className="h-10 px-6">
              {track.isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Track
            </Button>
          </form>

          {track.isError && (
            <Alert variant="destructive" className="mt-5">
              <AlertDescription>
                {notFound ? "We couldn't find an order with that number and phone. Please check and try again." : track.error.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {track.data && (
          <div className="mt-6 rounded-2xl border bg-card p-6">
            <OrderDetails order={track.data} />
          </div>
        )}
      </Container>
    </>
  );
}

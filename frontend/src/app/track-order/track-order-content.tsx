"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, PackageSearch } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { OrderDetails } from "@/components/order/order-details";
import { Container } from "@/components/shared/container";
import { FormField } from "@/components/shared/form-field";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
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
    <Container className="max-w-3xl">
      <PageBreadcrumb items={[{ label: "Track order" }]} />

      <div className="rounded-sm border bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
            <PackageSearch className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Track your order</h1>
            <p className="text-sm text-muted-foreground">Enter your order number and the phone number used at checkout.</p>
          </div>
        </div>

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
          <Button type="submit" disabled={track.isPending} className="h-9">
            {track.isPending && <Loader2 className="size-4 animate-spin" />}
            Track
          </Button>
        </form>

        {track.isError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              {notFound ? "We couldn't find an order with that number and phone. Please check and try again." : track.error.message}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {track.data && (
        <div className="mt-6 rounded-sm border p-5">
          <OrderDetails order={track.data} />
        </div>
      )}
    </Container>
  );
}

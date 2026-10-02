"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, PackageX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { OrderDetails } from "@/components/order/order-details";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { api, errorMessage } from "@/lib/api";
import { useMyOrder } from "@/lib/queries";
import type { Order } from "@/lib/types";

export function OrderDetailContent() {
  const orderNumber = useSearchParams().get("number");
  const queryClient = useQueryClient();
  const { data: order, isLoading, isError } = useMyOrder(orderNumber);

  const cancel = useMutation({
    mutationFn: () => api<{ data: Order }>(`/account/orders/${orderNumber}/cancel`, { method: "POST" }).then((r) => r.data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["my-order", orderNumber], updated);
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Your order has been cancelled.");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div>
      <Button asChild variant="link" className="mb-2 px-0">
        <Link href="/account/orders">
          <ArrowLeft className="size-4" /> Back to orders
        </Link>
      </Button>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : isError || !order ? (
        <EmptyState icon={PackageX} title="Order not found" description="We couldn't find this order in your account." />
      ) : (
        <div className="rounded-2xl border bg-card p-6">
          <OrderDetails
            order={order}
            actions={
              order.can_cancel && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
                      Cancel order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel this order?</DialogTitle>
                      <DialogDescription>Order {order.order_number} will be cancelled. This can&apos;t be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Keep order</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button variant="destructive" onClick={() => cancel.mutate()} disabled={cancel.isPending}>
                          {cancel.isPending && <Loader2 className="size-4 animate-spin" />}
                          Yes, cancel
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )
            }
          />
        </div>
      )}
    </div>
  );
}

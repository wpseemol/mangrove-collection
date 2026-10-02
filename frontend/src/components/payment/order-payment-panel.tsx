"use client";

import { useMutation } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, Clock, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api";
import { formatDate, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { usePaymentOptions } from "@/lib/queries";
import type { Order, WalletMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

import { SendMoneyGuide, validateWalletPayment, type WalletPaymentField, type WalletPaymentValues } from "./send-money-guide";
import { formatWalletNumber, isWallet, WALLETS, WalletMark } from "./wallet";

/** Payment summary for an order: method, the submitted TrxID and its review outcome. */
export function OrderPaymentSummary({ order }: { order: Order }) {
  const payment = order.payment;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <WalletMark method={order.payment_method} className="size-8 text-[10px]" />
        <p className="font-medium text-foreground">{PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method}</p>
      </div>

      {payment && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
          <dt>TrxID</dt>
          <dd className="font-mono text-foreground">{payment.transaction_id}</dd>
          {payment.sender_number && (
            <>
              <dt>From</dt>
              <dd className="text-foreground">{payment.sender_number}</dd>
            </>
          )}
          {payment.account_number && (
            <>
              <dt>Sent to</dt>
              <dd className="text-foreground">{formatWalletNumber(payment.account_number)}</dd>
            </>
          )}
        </dl>
      )}

      {order.payment_status === "verifying" && (
        <StatusNote tone="info" icon={Clock}>
          We are checking your payment. Your order will be confirmed once it is verified.
        </StatusNote>
      )}
      {order.payment_status === "paid" && isWallet(order.payment_method) && (
        <StatusNote tone="success" icon={CircleCheck}>
          Payment verified{payment?.reviewed_at ? ` on ${formatDate(payment.reviewed_at)}` : ""}.
        </StatusNote>
      )}
      {order.payment_status === "failed" && payment?.status === "rejected" && (
        <StatusNote tone="error" icon={CircleAlert}>
          We couldn&apos;t verify this payment{payment.rejection_reason ? `: ${payment.rejection_reason}` : "."}
        </StatusNote>
      )}
    </div>
  );
}

function StatusNote({ tone, icon: Icon, children }: { tone: "info" | "success" | "error"; icon: typeof Clock; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg px-3 py-2 text-xs",
        tone === "info" && "bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300",
        tone === "success" && "bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-300",
        tone === "error" && "bg-destructive/10 text-destructive",
      )}
    >
      <Icon className="mt-px size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/**
 * Lets the customer send a (new) transaction ID when the order accepts one,
 * e.g. after staff could not verify the first one.
 */
export function PaymentResubmitPanel({ order, phone, onUpdated }: { order: Order; phone?: string; onUpdated: (order: Order) => void }) {
  const { data: options, isLoading } = usePaymentOptions();
  const wallets = (options ?? []).filter((option) => isWallet(option.method));
  const [method, setMethod] = useState<WalletMethod | null>(null);
  const [values, setValues] = useState<WalletPaymentValues>({ accountId: null, transactionId: "", senderNumber: order.payment?.sender_number ?? "" });
  const [errors, setErrors] = useState<Partial<Record<WalletPaymentField, string>>>({});

  const current = isWallet(order.payment_method) ? order.payment_method : null;
  const selected = wallets.find((option) => option.method === (method ?? current)) ?? wallets[0];
  const accounts = selected?.accounts ?? [];

  const submit = useMutation({
    mutationFn: () =>
      api<{ data: Order }>(`/orders/${encodeURIComponent(order.order_number)}/payment`, {
        method: "POST",
        body: {
          payment_account_id: values.accountId ?? accounts[0]?.id,
          transaction_id: values.transactionId,
          payment_sender_number: values.senderNumber.trim(),
          phone: phone || undefined,
        },
      }).then((r) => r.data),
    onSuccess: (updated) => {
      toast.success("Thanks! We will verify your payment shortly.");
      onUpdated(updated);
    },
    onError: (e) => {
      const apiError = e instanceof ApiError ? e : null;
      setErrors({
        payment_account_id: apiError?.field("payment_account_id"),
        transaction_id: apiError?.field("transaction_id"),
        payment_sender_number: apiError?.field("payment_sender_number"),
      });
      if (!apiError || Object.keys(apiError.errors).length === 0) toast.error(apiError?.message ?? "Something went wrong.");
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!selected) {
    return <p className="text-sm text-muted-foreground">Mobile payments are not available right now. Please contact us to complete your payment.</p>;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateWalletPayment(values);
    setErrors(found);
    if (Object.keys(found).length === 0) submit.mutate();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border bg-surface/60 p-5" noValidate>
      <div>
        <h3 className="font-medium text-foreground">{order.payment ? "Submit a new transaction ID" : "Complete your payment"}</h3>
        <p className="text-sm text-muted-foreground">Send the order total and enter the details from your confirmation SMS.</p>
      </div>

      {wallets.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {wallets.map((option) => (
            <Button
              key={option.method}
              type="button"
              variant={option.method === selected.method ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setMethod(option.method as WalletMethod);
                setValues((v) => ({ ...v, accountId: null }));
              }}
            >
              {WALLETS[option.method as WalletMethod].name}
            </Button>
          ))}
        </div>
      )}

      <SendMoneyGuide
        method={selected.method as WalletMethod}
        accounts={accounts}
        amount={order.total}
        values={values}
        onChange={setValues}
        errorFor={(field) => errors[field]}
        idPrefix={`resubmit-${order.id}`}
      />

      <Button type="submit" disabled={submit.isPending}>
        {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Submit payment
      </Button>
    </form>
  );
}

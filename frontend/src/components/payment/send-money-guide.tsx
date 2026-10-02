"use client";

import { ShieldCheck } from "lucide-react";

import { FormField } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/format";
import type { PaymentAccount, WalletMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

import { CopyButton } from "./copy-button";
import { formatWalletNumber, WALLETS } from "./wallet";

export type WalletPaymentValues = {
  accountId: number | null;
  transactionId: string;
  senderNumber: string;
};

export type WalletPaymentField = "payment_account_id" | "transaction_id" | "payment_sender_number";

/** Keeps what the customer types close to what the API stores: letters and digits, upper case. */
export const cleanTransactionId = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);

/**
 * Step-by-step "Send Money" instructions for a wallet account, plus the fields
 * the customer fills in from the confirmation SMS.
 */
export function SendMoneyGuide({
  method,
  accounts,
  amount,
  values,
  onChange,
  errorFor,
  idPrefix = "wallet",
}: {
  method: WalletMethod;
  accounts: PaymentAccount[];
  amount: number;
  values: WalletPaymentValues;
  onChange: (values: WalletPaymentValues) => void;
  errorFor: (field: WalletPaymentField) => string | undefined;
  idPrefix?: string;
}) {
  const wallet = WALLETS[method];
  const account = accounts.find((a) => a.id === values.accountId) ?? accounts[0];

  if (!account) {
    return <p className="text-sm text-muted-foreground">{wallet.name} is not available right now. Please choose another payment method.</p>;
  }

  const amountText = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

  return (
    <div className="space-y-5">
      {accounts.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Send to</p>
          <RadioGroup
            value={String(account.id)}
            onValueChange={(id) => onChange({ ...values, accountId: Number(id) })}
            className="gap-2 sm:grid-cols-2"
          >
            {accounts.map((option) => (
              <Label
                key={option.id}
                htmlFor={`${idPrefix}-account-${option.id}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-normal",
                  option.id === account.id ? "border-primary bg-secondary/60" : "hover:border-primary/40",
                )}
              >
                <RadioGroupItem value={String(option.id)} id={`${idPrefix}-account-${option.id}`} />
                <span className="font-mono text-sm text-foreground">{formatWalletNumber(option.account_number)}</span>
                <span className="text-xs text-muted-foreground">{option.action}</span>
              </Label>
            ))}
          </RadioGroup>
          {errorFor("payment_account_id") && <p className="text-xs text-destructive">{errorFor("payment_account_id")}</p>}
        </div>
      )}

      <ol className="space-y-3 text-sm">
        <Step n={1}>
          Open the <strong>{wallet.name} app</strong> or dial <strong className="font-mono">{wallet.dial}</strong>
        </Step>
        <Step n={2}>
          Choose <strong>&ldquo;{account.action}&rdquo;</strong>
        </Step>
        <Step n={3}>
          <span className="flex flex-wrap items-center gap-2">
            Enter our {wallet.name} number
            <strong className="rounded-md bg-background px-2 py-0.5 font-mono text-base tracking-wide text-foreground ring-1 ring-border">
              {formatWalletNumber(account.account_number)}
            </strong>
            <CopyButton value={account.account_number} label={`${wallet.name} number`} />
          </span>
          {account.account_name && <span className="mt-1 block text-xs text-muted-foreground">Account name: {account.account_name}</span>}
        </Step>
        <Step n={4}>
          <span className="flex flex-wrap items-center gap-2">
            Enter the exact amount
            <strong className="rounded-md bg-background px-2 py-0.5 text-base text-primary ring-1 ring-border">{formatPrice(amount)}</strong>
            <CopyButton value={amountText} label="amount" />
          </span>
        </Step>
        <Step n={5}>Confirm with your PIN. You will get an SMS with a Transaction ID (TrxID).</Step>
      </ol>

      {account.instructions && (
        <p className="rounded-lg border border-dashed bg-background/60 px-4 py-3 text-sm whitespace-pre-line text-foreground/80">{account.instructions}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${idPrefix}-sender`} label={`Your ${wallet.name} number`} required error={errorFor("payment_sender_number")}>
          <Input
            id={`${idPrefix}-sender`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.senderNumber}
            onChange={(e) => onChange({ ...values, senderNumber: e.target.value })}
            placeholder="01XXXXXXXXX"
            maxLength={20}
            aria-invalid={Boolean(errorFor("payment_sender_number")) || undefined}
          />
        </FormField>
        <FormField id={`${idPrefix}-trx`} label="Transaction ID (TrxID)" required error={errorFor("transaction_id")}>
          <Input
            id={`${idPrefix}-trx`}
            value={values.transactionId}
            onChange={(e) => onChange({ ...values, transactionId: cleanTransactionId(e.target.value) })}
            placeholder="e.g. 9AB7CD6E5F"
            autoComplete="off"
            spellCheck={false}
            className="font-mono tracking-wider uppercase"
            aria-invalid={Boolean(errorFor("transaction_id")) || undefined}
          />
        </FormField>
      </div>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        We check every payment against our {wallet.name} statement. Your order is confirmed as soon as the payment is verified.
      </p>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{n}</span>
      <div className="min-w-0 flex-1 pt-0.5 text-foreground/80">{children}</div>
    </li>
  );
}

/** Client-side check mirroring the API rules so customers see mistakes before submitting. */
export function validateWalletPayment(values: WalletPaymentValues): Partial<Record<WalletPaymentField, string>> {
  const errors: Partial<Record<WalletPaymentField, string>> = {};
  const sender = values.senderNumber.trim();

  if (!sender) errors.payment_sender_number = "Enter the number you sent the money from.";
  else if (!/^\+?[0-9][0-9\s\-()]{5,19}$/.test(sender)) errors.payment_sender_number = "Enter a valid phone number.";

  if (!values.transactionId) errors.transaction_id = "Enter the Transaction ID from your payment SMS.";
  else if (!/^[A-Z0-9]{6,20}$/.test(values.transactionId)) errors.transaction_id = "The Transaction ID should be 6–20 letters or digits.";

  return errors;
}

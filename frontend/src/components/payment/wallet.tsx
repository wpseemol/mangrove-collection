import type { PaymentMethod, WalletMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

export const WALLETS: Record<WalletMethod, { name: string; color: string; dial: string }> = {
  bkash: { name: "bKash", color: "#E2136E", dial: "*247#" },
  nagad: { name: "Nagad", color: "#EC1C24", dial: "*167#" },
  rocket: { name: "Rocket", color: "#8C3494", dial: "*322#" },
};

export const isWallet = (method: PaymentMethod | "" | null | undefined): method is WalletMethod => Boolean(method) && method !== "cod";

/** 01712345678 → 01712-345678, easier to read aloud and type into a wallet app. */
export function formatWalletNumber(number: string | null | undefined): string {
  if (!number) return "";
  return /^\d{11,12}$/.test(number) ? `${number.slice(0, 5)}-${number.slice(5)}` : number;
}

export function WalletMark({ method, className }: { method: PaymentMethod; className?: string }) {
  if (!isWallet(method)) {
    return (
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary", className)}>
        COD
      </span>
    );
  }

  const wallet = WALLETS[method];

  return (
    <span
      className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white", className)}
      style={{ backgroundColor: wallet.color }}
      aria-hidden
    >
      {wallet.name.slice(0, 2)}
    </span>
  );
}

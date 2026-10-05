import type { PaymentAccountType, WalletMethod } from '@/lib/types'

export const WALLETS: Record<WalletMethod, { name: string; color: string }> = {
  bkash: { name: 'bKash', color: '#E2136E' },
  nagad: { name: 'Nagad', color: '#EC1C24' },
  rocket: { name: 'Rocket', color: '#8C3494' },
}

export const WALLET_METHODS = Object.keys(WALLETS) as WalletMethod[]

export const ACCOUNT_TYPES: { value: PaymentAccountType; label: string; action: string; hint: string }[] = [
  { value: 'personal', label: 'Personal', action: 'Send Money', hint: 'Customers use "Send Money". Free for the customer.' },
  { value: 'agent', label: 'Agent', action: 'Cash Out', hint: 'Customers use "Cash Out" and pay the cash-out fee.' },
  { value: 'merchant', label: 'Merchant', action: 'Payment', hint: 'Customers use "Payment" / "Make Payment".' },
]

/** 01712345678 → 01712-345678 */
export function formatWalletNumber(number: string | null | undefined): string {
  if (!number) return '—'
  return /^\d{11,12}$/.test(number) ? `${number.slice(0, 5)}-${number.slice(5)}` : number
}

import { WALLETS } from '@/lib/payments'
import type { WalletMethod } from '@/lib/types'
import { cn } from '@/lib/utils'

export function WalletMark({ method, className }: { method: WalletMethod; className?: string }) {
  const wallet = WALLETS[method]

  return (
    <span
      className={cn('flex size-8 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white', className)}
      style={{ backgroundColor: wallet.color }}
      title={wallet.name}
      aria-hidden
    >
      {wallet.name.slice(0, 2)}
    </span>
  )
}

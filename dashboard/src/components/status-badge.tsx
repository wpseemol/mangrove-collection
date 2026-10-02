import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrderStatus, ProductStatus } from '@/lib/types'

const STYLES: Record<OrderStatus | ProductStatus, string> = {
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  draft: 'bg-zinc-100 text-zinc-700 ring-zinc-500/20',
  pending: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  processing: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  shipped: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
  refunded: 'bg-zinc-100 text-zinc-700 ring-zinc-500/20',
}

export function StatusBadge({ status, className }: { status: OrderStatus | ProductStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn('border-0 capitalize ring-1 ring-inset', STYLES[status], className)}>
      {status}
    </Badge>
  )
}

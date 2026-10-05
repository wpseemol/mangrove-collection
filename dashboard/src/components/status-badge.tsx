import { Badge } from '@/components/ui/badge'
import { TONES } from '@/lib/tones'
import { cn } from '@/lib/utils'
import type { OrderStatus, ProductStatus } from '@/lib/types'

const STYLES: Record<OrderStatus | ProductStatus, string> = {
  published: TONES.green,
  draft: TONES.neutral,
  pending: TONES.amber,
  processing: TONES.sky,
  shipped: TONES.indigo,
  delivered: TONES.green,
  cancelled: TONES.red,
}

export function StatusBadge({ status, className }: { status: OrderStatus | ProductStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn('border-0 capitalize ring-1 ring-inset', STYLES[status], className)}>
      {status}
    </Badge>
  )
}

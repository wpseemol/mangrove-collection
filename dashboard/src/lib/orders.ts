import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { ordersQueryKey, paymentsQueryKey } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from '@/lib/types'

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

/** The usual forward move from each status, offered as a one-click action. */
export const NEXT_STEP: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  pending: { status: 'processing', label: 'Start processing' },
  processing: { status: 'shipped', label: 'Mark shipped' },
  shipped: { status: 'delivered', label: 'Mark delivered' },
}

export const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'verifying', 'paid', 'failed', 'refunded']

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Unpaid',
  verifying: 'Verifying',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, string> = {
  pending: TONES.amber,
  verifying: TONES.sky,
  paid: TONES.green,
  failed: TONES.red,
  refunded: TONES.neutral,
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cod: 'Cash on delivery',
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
}

export function statusToast(order: Order): string {
  if (order.status === 'delivered') {
    return order.payment_method === 'cod'
      ? `${order.order_number} delivered. Cash on delivery recorded as paid, and the customer can now review it.`
      : `${order.order_number} delivered. The customer can now review it.`
  }
  if (order.status === 'cancelled') return `${order.order_number} cancelled and its stock returned.`
  return `${order.order_number} is now ${ORDER_STATUS_LABEL[order.status].toLowerCase()}.`
}

export type OrderUpdate = { status?: OrderStatus; payment_status?: PaymentStatus; admin_note?: string | null }

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: OrderUpdate & { id: number }) =>
      api<{ data: Order }>(`/admin/orders/${id}`, { method: 'PATCH', body }).then((r) => r.data),
    onSuccess: (order) => {
      queryClient.setQueryData([...ordersQueryKey, 'detail', order.id], order)
      queryClient.invalidateQueries({ queryKey: [...ordersQueryKey, 'list'] })
      queryClient.invalidateQueries({ queryKey: [...ordersQueryKey, 'pending-count'] })
      queryClient.invalidateQueries({ queryKey: paymentsQueryKey })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

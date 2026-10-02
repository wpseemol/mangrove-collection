import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CircleCheck, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api, errorMessage } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { formatWalletNumber, WALLETS } from '@/lib/payments'
import { paymentsQueryKey } from '@/lib/queries'
import type { Payment } from '@/lib/types'
import { cn } from '@/lib/utils'
import { isUnsafeText, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'

const REJECT_REASONS = [
  'No payment found with this transaction ID',
  'Amount received is less than the order total',
  'Money was sent to a different number',
  'Sender number does not match',
]

function useReview(payment: Payment | null, action: 'verify' | 'reject', onDone: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body?: { reason: string }) =>
      api<{ data: Payment }>(`/admin/payments/${payment?.id}/${action}`, { method: 'POST', body }).then((r) => r.data),
    onSuccess: (updated) => {
      toast.success(
        action === 'verify'
          ? `Payment for ${updated.order?.order_number} verified. The order is now paid.`
          : `Payment for ${updated.order?.order_number} rejected. The customer can submit a new transaction ID.`,
      )
      queryClient.invalidateQueries({ queryKey: paymentsQueryKey })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      onDone()
    },
    onError: (error) => {
      toast.error(errorMessage(error))
      queryClient.invalidateQueries({ queryKey: paymentsQueryKey })
    },
  })
}

/** What staff should find in the wallet statement before verifying. */
function StatementChecklist({ payment }: { payment: Payment }) {
  const wallet = WALLETS[payment.method]
  const mismatch = payment.order && Math.abs(payment.order.total - payment.amount) > 0.009

  const rows = [
    { label: `${wallet.name} account`, value: formatWalletNumber(payment.account_number) },
    { label: 'Transaction ID', value: payment.transaction_id, mono: true },
    { label: 'Amount', value: formatPrice(payment.amount, payment.currency) },
    { label: 'From', value: payment.sender_number ?? '—' },
  ]

  return (
    <div className="space-y-2">
      <dl className="divide-y rounded-lg border text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-3 py-2">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className={cn('text-right font-medium', row.mono && 'font-mono tracking-wide')}>{row.value}</dd>
          </div>
        ))}
      </dl>
      {mismatch && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          The order total is now {formatPrice(payment.order?.total, payment.currency)}; the customer was asked to send{' '}
          {formatPrice(payment.amount, payment.currency)}.
        </p>
      )}
    </div>
  )
}

export function VerifyPaymentDialog({ payment, onOpenChange }: { payment: Payment | null; onOpenChange: (open: boolean) => void }) {
  const verify = useReview(payment, 'verify', () => onOpenChange(false))

  return (
    <Dialog open={payment !== null} onOpenChange={(open) => !verify.isPending && onOpenChange(open)}>
      <DialogContent className="sm:max-w-md">
        {payment && (
          <>
            <DialogHeader>
              <DialogTitle>Verify payment for {payment.order?.order_number}?</DialogTitle>
              <DialogDescription>
                Open your {WALLETS[payment.method].name} app or statement and confirm this transaction is there with the same amount.
              </DialogDescription>
            </DialogHeader>
            <StatementChecklist payment={payment} />
            <p className="text-xs text-muted-foreground">
              The order will be marked paid and moved to processing, and the customer gets a confirmation SMS (if SMS is on).
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={verify.isPending}>
                Cancel
              </Button>
              <Button onClick={() => verify.mutate(undefined)} disabled={verify.isPending}>
                {verify.isPending ? <Loader2 className="animate-spin" /> : <CircleCheck />}
                Yes, payment received
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function RejectPaymentDialog({ payment, onOpenChange }: { payment: Payment | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={payment !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {payment && <RejectForm key={payment.id} payment={payment} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function RejectForm({ payment, onDone }: { payment: Payment; onDone: () => void }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()
  const reject = useReview(payment, 'reject', onDone)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = reason.trim()
    if (text.length < 3) return setError('Tell the customer why, so they can fix it.')
    if (text.length > 255) return setError('Use 255 characters or fewer.')
    if (isUnsafeText(text)) return setError(UNSAFE_TEXT_MESSAGE)
    reject.mutate({ reason: text })
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <DialogHeader>
        <DialogTitle>Reject payment for {payment.order?.order_number}?</DialogTitle>
        <DialogDescription>The customer sees this reason and can submit a new transaction ID from their order page.</DialogDescription>
      </DialogHeader>
      <StatementChecklist payment={payment} />
      <div className="space-y-2">
        <Label htmlFor="reject-reason">Reason</Label>
        <div className="flex flex-wrap gap-1.5">
          {REJECT_REASONS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setReason(preset)
                setError(undefined)
              }}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors hover:border-primary/50',
                reason === preset && 'border-primary bg-primary/10 text-primary',
              )}
            >
              {preset}
            </button>
          ))}
        </div>
        <Textarea
          id="reject-reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value)
            setError(undefined)
          }}
          rows={2}
          maxLength={255}
          placeholder="Or write your own reason"
          aria-invalid={Boolean(error) || undefined}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={reject.isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive" disabled={reject.isPending}>
          {reject.isPending ? <Loader2 className="animate-spin" /> : <XCircle />}
          Reject payment
        </Button>
      </DialogFooter>
    </form>
  )
}

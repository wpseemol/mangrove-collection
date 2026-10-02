import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Pencil, Plus, Power, Trash2, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { PaymentAccountDialog } from '@/components/payments/payment-account-dialog'
import { WalletMark } from '@/components/payments/wallet-mark'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api, errorMessage } from '@/lib/api'
import { formatWalletNumber, WALLET_METHODS, WALLETS } from '@/lib/payments'
import { paymentAccountsQueryKey, usePaymentAccounts } from '@/lib/queries'
import { TONES } from '@/lib/tones'
import type { PaymentAccount } from '@/lib/types'
import { cn } from '@/lib/utils'

export function PaymentAccountsPage() {
  const queryClient = useQueryClient()
  const { data: accounts, isPending } = usePaymentAccounts()
  const [editing, setEditing] = useState<PaymentAccount | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toDelete, setToDelete] = useState<PaymentAccount | null>(null)

  const openDialog = (account: PaymentAccount | null) => {
    setEditing(account)
    setDialogOpen(true)
  }

  const invalidate = () => queryClient.invalidateQueries({ queryKey: paymentAccountsQueryKey })

  const toggle = useMutation({
    mutationFn: (account: PaymentAccount) =>
      api(`/admin/payment-accounts/${account.id}`, { method: 'PATCH', body: { is_active: !account.is_active } }),
    onSuccess: (_, account) => {
      toast.success(`${WALLETS[account.method].name} ${formatWalletNumber(account.account_number)} ${account.is_active ? 'turned off' : 'turned on'}.`)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const remove = useMutation({
    mutationFn: (account: PaymentAccount) => api(`/admin/payment-accounts/${account.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Payment account deleted.')
      setToDelete(null)
      invalidate()
    },
    onError: (error) => {
      toast.error(errorMessage(error))
      setToDelete(null)
    },
  })

  const liveWallets = WALLET_METHODS.filter((method) => accounts?.some((a) => a.method === method && a.is_active))

  return (
    <>
      <PageHeader
        title="Payment accounts"
        description="bKash, Nagad and Rocket numbers customers send money to at checkout."
        actions={
          <Button onClick={() => openDialog(null)}>
            <Plus /> Add account
          </Button>
        }
      />

      {!isPending && (
        <p className="text-sm text-muted-foreground">
          {liveWallets.length
            ? `Offered at checkout: ${liveWallets.map((m) => WALLETS[m].name).join(', ')}.`
            : 'No wallet is offered at checkout yet. Add an active account to start accepting mobile payments.'}{' '}
          Cash on delivery is switched on or off in{' '}
          <Link to="/settings?tab=commerce" className="text-primary hover:underline">
            Settings → Checkout
          </Link>
          .
        </p>
      )}

      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Account</TableHead>
              <TableHead>Customers use</TableHead>
              <TableHead className="hidden md:table-cell">Payments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12 pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 3 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-8 rounded-md" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : accounts?.length ? (
              accounts.map((account) => (
                <TableRow key={account.id} className={cn(!account.is_active && 'text-muted-foreground')}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <WalletMark method={account.method} className={cn(!account.is_active && 'opacity-50')} />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => openDialog(account)}
                          className="font-mono font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {formatWalletNumber(account.account_number)}
                        </button>
                        <p className="truncate text-xs text-muted-foreground">
                          {WALLETS[account.method].name}
                          {account.account_name ? ` · ${account.account_name}` : ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{account.action}</span>
                    <p className="text-xs text-muted-foreground capitalize">{account.account_type} account</p>
                  </TableCell>
                  <TableCell className="hidden tabular-nums md:table-cell">
                    <Link to={`/payments?method=${account.method}&q=${account.account_number}`} className="hover:text-primary hover:underline">
                      {account.payments_count ?? 0}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('border-0 ring-1 ring-inset', account.is_active ? TONES.green : TONES.neutral)}>
                      {account.is_active ? 'Active' : 'Off'}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${account.account_number}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onSelect={() => openDialog(account)}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => toggle.mutate(account)}>
                          <Power /> {account.is_active ? 'Turn off' : 'Turn on'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(account)}>
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                      <Wallet className="size-5" />
                    </span>
                    <div>
                      <p className="font-medium">No payment accounts yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add your bKash, Nagad or Rocket number to let customers pay with Send Money.
                      </p>
                    </div>
                    <Button size="sm" onClick={() => openDialog(null)}>
                      <Plus /> Add account
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <PaymentAccountDialog open={dialogOpen} onOpenChange={setDialogOpen} account={editing} />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this payment account?"
        description={
          <>
            <span className="font-mono font-medium text-foreground">{formatWalletNumber(toDelete?.account_number)}</span> will no longer
            be offered at checkout. Past payments keep the number they were sent to. To pause it instead, turn it off.
          </>
        }
        confirmLabel="Delete account"
        pending={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete)}
      />
    </>
  )
}

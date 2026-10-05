import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { FormField, Optional } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { api, ApiError } from '@/lib/api'
import { ACCOUNT_TYPES, WALLET_METHODS, WALLETS } from '@/lib/payments'
import { paymentAccountsQueryKey } from '@/lib/queries'
import type { PaymentAccount, PaymentAccountInput, WalletMethod } from '@/lib/types'
import { isUnsafeText, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'

import { WalletMark } from './wallet-mark'

type Errors = Partial<Record<keyof PaymentAccountInput, string>>

const EMPTY: PaymentAccountInput = {
  method: 'bkash',
  account_type: 'personal',
  account_number: '',
  account_name: '',
  instructions: '',
  is_active: true,
  sort_order: 0,
}

/** Mirrors the API: digits only, without a leading 88 / +88 country code. */
const normalizeWalletNumber = (value: string) => value.replace(/[\s\-().]/g, '').replace(/^\+?88(?=01)/, '')

function validate(values: PaymentAccountInput): Errors {
  const errors: Errors = {}
  const number = normalizeWalletNumber(values.account_number)
  const pattern = values.method === 'rocket' ? /^01[3-9]\d{8}\d?$/ : /^01[3-9]\d{8}$/

  if (!number) errors.account_number = 'Enter the wallet number customers will send money to.'
  else if (!pattern.test(number)) {
    errors.account_number =
      values.method === 'rocket'
        ? 'Enter the 11-digit mobile number, plus the 12th check digit if your Rocket number has one.'
        : 'Enter an 11-digit mobile number, e.g. 01712345678.'
  }

  if ((values.account_name ?? '').length > 100) errors.account_name = 'Use 100 characters or fewer.'
  else if (isUnsafeText(values.account_name ?? '')) errors.account_name = UNSAFE_TEXT_MESSAGE

  if ((values.instructions ?? '').length > 1000) errors.instructions = 'Use 1000 characters or fewer.'
  else if (isUnsafeText(values.instructions ?? '')) errors.instructions = UNSAFE_TEXT_MESSAGE

  return errors
}

export function PaymentAccountDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: PaymentAccount | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && <AccountForm key={account?.id ?? 'new'} account={account} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function AccountForm({ account, onDone }: { account: PaymentAccount | null; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<PaymentAccountInput>(
    account
      ? {
          method: account.method,
          account_type: account.account_type,
          account_number: account.account_number,
          account_name: account.account_name ?? '',
          instructions: account.instructions ?? '',
          is_active: account.is_active,
          sort_order: account.sort_order,
        }
      : EMPTY,
  )
  const [errors, setErrors] = useState<Errors>({})

  const set = <K extends keyof PaymentAccountInput>(key: K, value: PaymentAccountInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const save = useMutation({
    mutationFn: () => {
      const body = {
        ...values,
        account_number: normalizeWalletNumber(values.account_number),
        account_name: values.account_name?.trim() || null,
        instructions: values.instructions?.trim() || null,
      }
      return account
        ? api<{ data: PaymentAccount }>(`/admin/payment-accounts/${account.id}`, { method: 'PUT', body })
        : api<{ data: PaymentAccount }>('/admin/payment-accounts', { method: 'POST', body })
    },
    onSuccess: () => {
      toast.success(account ? 'Payment account updated.' : 'Payment account added.')
      queryClient.invalidateQueries({ queryKey: paymentAccountsQueryKey })
      onDone()
    },
    onError: (error) => {
      if (error instanceof ApiError && Object.keys(error.errors).length) {
        setErrors(Object.fromEntries(Object.entries(error.errors).map(([key, messages]) => [key, messages[0]])))
      } else {
        toast.error(error.message)
      }
    },
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length === 0) save.mutate()
  }

  const type = ACCOUNT_TYPES.find((t) => t.value === values.account_type)

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <DialogHeader>
        <DialogTitle>{account ? 'Edit payment account' : 'Add payment account'}</DialogTitle>
        <DialogDescription>Customers send money to this number at checkout. Double-check it — payments go here.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="method" label="Wallet" error={errors.method}>
          <Select value={values.method} onValueChange={(value) => set('method', value as WalletMethod)}>
            <SelectTrigger id="method" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WALLET_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  <WalletMark method={method} className="size-5 rounded text-[8px]" />
                  {WALLETS[method].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="account_type" label="Account type" error={errors.account_type}>
          <Select value={values.account_type} onValueChange={(value) => set('account_type', value as PaymentAccountInput['account_type'])}>
            <SelectTrigger id="account_type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label} · {t.action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        {type && <p className="-mt-2 text-xs text-muted-foreground sm:col-span-2">{type.hint}</p>}

        <FormField id="account_number" label={`${WALLETS[values.method].name} number`} error={errors.account_number} className="sm:col-span-2">
          <Input
            id="account_number"
            type="tel"
            inputMode="tel"
            value={values.account_number}
            onChange={(e) => set('account_number', e.target.value)}
            placeholder={values.method === 'rocket' ? '017123456789' : '01712345678'}
            maxLength={20}
            className="font-mono"
            aria-invalid={Boolean(errors.account_number) || undefined}
          />
        </FormField>

        <FormField id="account_name" label="Account name" hint={<Optional />} error={errors.account_name} className="sm:col-span-2">
          <Input
            id="account_name"
            value={values.account_name ?? ''}
            onChange={(e) => set('account_name', e.target.value)}
            placeholder="Shown so customers can confirm the receiver, e.g. Mangrove Collection"
            maxLength={100}
          />
        </FormField>

        <FormField
          id="instructions"
          label="Extra instructions"
          hint={<Optional />}
          error={errors.instructions}
          description="Shown under the payment steps at checkout."
          className="sm:col-span-2"
        >
          <Textarea
            id="instructions"
            value={values.instructions ?? ''}
            onChange={(e) => set('instructions', e.target.value)}
            placeholder="e.g. Please write your order phone number in the reference."
            rows={3}
            maxLength={1000}
          />
        </FormField>

        <FormField id="sort_order" label="Display order" error={errors.sort_order} description="Lower numbers are shown first.">
          <Input
            id="sort_order"
            type="number"
            inputMode="numeric"
            min={0}
            max={9999}
            value={values.sort_order}
            onChange={(e) => set('sort_order', Math.max(0, Math.min(9999, Number(e.target.value) || 0)))}
          />
        </FormField>

        <div className="flex items-end">
          <Label className="flex w-full items-center justify-between gap-3 rounded-lg border p-3 font-normal">
            <span>
              <span className="block text-sm font-medium">Active</span>
              <span className="block text-xs text-muted-foreground">Offered at checkout</span>
            </span>
            <Switch checked={values.is_active} onCheckedChange={(checked) => set('is_active', checked)} />
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" />}
          {account ? 'Save changes' : 'Add account'}
        </Button>
      </DialogFooter>
    </form>
  )
}

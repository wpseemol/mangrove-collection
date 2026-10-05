import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Minus, PackageSearch, Plus, Search, Trash2, UserRoundCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { api, ApiError, errorMessage } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, PAYMENT_STATUSES, useCreateOrder, type StaffOrderInput } from '@/lib/orders'
import type { CustomerLookup, Paginated, PaymentMethod, PaymentStatus, Product, ProductVariant, ShippingMethod } from '@/lib/types'
import { cn } from '@/lib/utils'
import { isUnsafeText, UNSAFE_TEXT_MESSAGE } from '@/lib/validation'

type Line = { variant: ProductVariant; product: Pick<Product, 'id' | 'name' | 'thumbnail'>; quantity: number }

const ADDRESS_FIELDS = [
  { key: 'region', label: 'Division' },
  { key: 'city', label: 'District / city' },
  { key: 'zone', label: 'Area' },
  { key: 'landmark', label: 'Landmark' },
] as const

const STATUSES = ['pending', 'processing', 'shipped', 'delivered'] as const
const PAYMENT_METHODS: PaymentMethod[] = ['cod', 'bkash', 'nagad', 'rocket']
const PHONE = /^\+?[0-9][0-9\s\-()]{5,19}$/

type Address = StaffOrderInput['address']
const EMPTY_ADDRESS: Address = { name: '', phone: '', email: '', region: '', city: '', zone: '', landmark: '', full_address: '' }

export function OrderCreatePage() {
  const navigate = useNavigate()
  const create = useCreateOrder()

  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS)
  const [userId, setUserId] = useState<number | null>(null)
  const [lookup, setLookup] = useState<CustomerLookup | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [chosenShipping, setShippingId] = useState<string>('')
  const [shippingCost, setShippingCost] = useState('')
  const [discount, setDiscount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending')
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('pending')
  const [customerNote, setCustomerNote] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const shipping = useQuery({
    queryKey: ['admin', 'shipping-methods'],
    queryFn: () => api<{ data: ShippingMethod[] }>('/admin/shipping-methods').then((r) => r.data),
  })
  const methods = useMemo(() => (shipping.data ?? []).filter((m) => m.is_active), [shipping.data])
  const shippingId = chosenShipping || (methods[0] ? String(methods[0].id) : '')
  const method = methods.find((m) => String(m.id) === shippingId)

  const subtotal = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0)
  const delivery = shippingCost.trim() !== '' ? Number(shippingCost) || 0 : (method?.price ?? 0)
  const off = Math.min(Number(discount) || 0, subtotal + delivery)
  const total = Math.max(0, subtotal + delivery - off)

  const clearError = (key: string) =>
    setErrors((current) => {
      if (!(key in current)) return current
      const next = { ...current }
      delete next[key]
      return next
    })

  const setField = (key: keyof Address, value: string) => {
    setAddress((current) => ({ ...current, [key]: value }))
    clearError(`address.${key}`)
  }

  const findCustomer = async () => {
    const phone = address.phone.trim()
    if (!PHONE.test(phone)) return
    try {
      const result = (await api<{ data: CustomerLookup }>('/admin/orders/customer-lookup', { query: { phone } })).data
      setLookup(result)
      setUserId(result.user?.id ?? null)
      const previous = result.address
      setAddress((current) => ({
        ...current,
        name: current.name || previous?.name || result.user?.name || '',
        email: current.email || previous?.email || result.user?.email || '',
        region: current.region || previous?.region || '',
        city: current.city || previous?.city || '',
        zone: current.zone || previous?.zone || '',
        landmark: current.landmark || previous?.landmark || '',
        full_address: current.full_address || previous?.full_address || '',
      }))
    } catch {
      setLookup(null)
    }
  }

  const addVariant = (product: Product, variant: ProductVariant) => {
    setLines((current) => {
      const existing = current.find((line) => line.variant.id === variant.id)
      if (existing) return current.map((line) => (line === existing ? { ...line, quantity: line.quantity + 1 } : line))
      return [...current, { variant, product: { id: product.id, name: product.name, thumbnail: product.thumbnail }, quantity: 1 }]
    })
    clearError('items')
  }

  const setQuantity = (variantId: number, quantity: number) =>
    setLines((current) => current.map((line) => (line.variant.id === variantId ? { ...line, quantity: Math.max(1, Math.min(1000, quantity || 1)) } : line)))

  const validate = (): Record<string, string> => {
    const found: Record<string, string> = {}
    if (!address.name.trim()) found['address.name'] = 'Enter the customer name.'
    if (!PHONE.test(address.phone.trim())) found['address.phone'] = 'Enter a valid phone number.'
    if (!address.full_address.trim()) found['address.full_address'] = 'Enter the delivery address.'
    if (!lines.length) found.items = 'Add at least one product.'
    if (!method) found.shipping_method_id = 'Choose a delivery method.'
    for (const [key, value] of Object.entries({ ...address, customer_note: customerNote, admin_note: adminNote })) {
      if (value && isUnsafeText(value)) found[key in address ? `address.${key}` : key] = UNSAFE_TEXT_MESSAGE
    }
    return found
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) return toast.error('Please fix the highlighted fields.')

    const blank = (value: string | null | undefined) => (value?.trim() ? value.trim() : null)
    create.mutate(
      {
        items: lines.map((line) => ({ variant_id: line.variant.id, quantity: line.quantity })),
        shipping_method_id: method!.id,
        shipping_cost: shippingCost.trim() !== '' ? Number(shippingCost) : null,
        discount: Number(discount) > 0 ? Number(discount) : null,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        status,
        customer_note: blank(customerNote),
        admin_note: blank(adminNote),
        user_id: userId,
        address: {
          name: address.name.trim(),
          phone: address.phone.trim(),
          email: blank(address.email),
          region: blank(address.region),
          city: blank(address.city),
          zone: blank(address.zone),
          landmark: blank(address.landmark),
          full_address: address.full_address.trim(),
        },
      },
      {
        onSuccess: (order) => {
          toast.success(`Order ${order.order_number} created.`)
          navigate(`/orders/${order.id}`)
        },
        onError: (err) => {
          if (err instanceof ApiError && Object.keys(err.errors).length) {
            const mapped = Object.fromEntries(Object.entries(err.errors).map(([key, messages]) => [key.startsWith('items.') ? 'items' : key, messages[0]]))
            setErrors(mapped)
            toast.error(Object.values(mapped)[0] ?? err.message)
          } else toast.error(errorMessage(err))
        },
      },
    )
  }

  return (
    <form onSubmit={submit} noValidate>
      <Button variant="link" asChild className="mb-1 h-auto px-0 text-muted-foreground">
        <Link to="/orders">
          <ArrowLeft /> All orders
        </Link>
      </Button>
      <PageHeader title="New order" description="Record an order taken by phone, Facebook, WhatsApp or in person. Prices come from the catalog and stock is reserved." />

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>Start with the phone number: returning customers are filled in automatically.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" error={errors['address.phone']} required>
                <Input
                  value={address.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  onBlur={findCustomer}
                  inputMode="tel"
                  placeholder="01XXXXXXXXX"
                  aria-invalid={Boolean(errors['address.phone']) || undefined}
                />
              </Field>
              <Field label="Name" error={errors['address.name']} required>
                <Input value={address.name} onChange={(e) => setField('name', e.target.value)} aria-invalid={Boolean(errors['address.name']) || undefined} />
              </Field>
              {lookup && (lookup.user || lookup.orders_count > 0) && (
                <p className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-sm sm:col-span-2">
                  <UserRoundCheck className="size-4 text-primary" />
                  {lookup.user ? `Linked to ${lookup.user.name}'s account. ` : 'Returning customer. '}
                  {lookup.orders_count} previous order{lookup.orders_count === 1 ? '' : 's'}.
                </p>
              )}
              <Field label="Email" error={errors['address.email']}>
                <Input type="email" value={address.email ?? ''} onChange={(e) => setField('email', e.target.value)} placeholder="Optional" />
              </Field>
              {ADDRESS_FIELDS.map(({ key, label }) => (
                <Field key={key} label={label} error={errors[`address.${key}`]}>
                  <Input value={address[key] ?? ''} onChange={(e) => setField(key, e.target.value)} placeholder="Optional" />
                </Field>
              ))}
              <Field label="Full address" error={errors['address.full_address']} required className="sm:col-span-2">
                <Textarea
                  value={address.full_address}
                  onChange={(e) => setField('full_address', e.target.value)}
                  rows={2}
                  placeholder="House, road, village / area"
                  aria-invalid={Boolean(errors['address.full_address']) || undefined}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Search by product name or SKU and click a size to add it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductPicker onPick={addVariant} />
              {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}
              {lines.length > 0 && (
                <ul className="divide-y rounded-lg border">
                  {lines.map((line) => {
                    const overStock = line.variant.stock !== null && line.quantity > line.variant.stock
                    return (
                      <li key={line.variant.id} className="flex flex-wrap items-center gap-3 p-3">
                        <span className="size-11 shrink-0 overflow-hidden rounded-md border bg-muted">
                          {line.product.thumbnail && <img src={line.product.thumbnail} alt="" className="size-full object-cover" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium">{line.product.name}</p>
                          <p className={cn('text-xs', overStock ? 'text-destructive' : 'text-muted-foreground')}>
                            {line.variant.title} · {formatPrice(line.variant.price)}
                            {line.variant.stock !== null && ` · ${line.variant.stock} in stock`}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => setQuantity(line.variant.id, line.quantity - 1)} aria-label="Decrease quantity">
                            <Minus />
                          </Button>
                          <Input
                            value={line.quantity}
                            onChange={(e) => setQuantity(line.variant.id, Number(e.target.value.replace(/\D/g, '')))}
                            className="mx-1 h-8 w-14 text-center tabular-nums"
                            inputMode="numeric"
                            aria-label="Quantity"
                          />
                          <Button type="button" size="icon" variant="outline" className="size-8" onClick={() => setQuantity(line.variant.id, line.quantity + 1)} aria-label="Increase quantity">
                            <Plus />
                          </Button>
                        </div>
                        <p className="w-24 text-right text-sm font-medium tabular-nums">{formatPrice(line.variant.price * line.quantity)}</p>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setLines((current) => current.filter((l) => l !== line))}
                          aria-label={`Remove ${line.product.name}`}
                        >
                          <Trash2 />
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Customer note" error={errors.customer_note}>
                <Textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} rows={3} maxLength={1000} placeholder="Shown on the invoice, e.g. deliver after 5 pm" />
              </Field>
              <Field label="Staff note" error={errors.admin_note}>
                <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} maxLength={5000} placeholder="Only visible to staff, e.g. ordered via Facebook" />
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardHeader>
              <CardTitle>Delivery &amp; payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Delivery method" error={errors.shipping_method_id} required>
                <Select value={shippingId} onValueChange={setShippingId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={shipping.isPending ? 'Loading…' : 'Choose'} />
                  </SelectTrigger>
                  <SelectContent>
                    {methods.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.title} · {formatPrice(m.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Delivery charge" error={errors.shipping_cost}>
                  <Input value={shippingCost} onChange={(e) => setShippingCost(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" placeholder={method ? String(method.price) : 'Auto'} />
                </Field>
                <Field label="Discount" error={errors.discount}>
                  <Input value={discount} onChange={(e) => setDiscount(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" placeholder="0" />
                </Field>
              </div>
              <Field label="Payment method">
                <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {PAYMENT_METHOD_LABEL[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Payment">
                  <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {PAYMENT_STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Order status">
                  <Select value={status} onValueChange={(value) => setStatus(value as (typeof STATUSES)[number])}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {ORDER_STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-1.5 text-sm">
              <SummaryRow label={`Subtotal (${lines.reduce((n, l) => n + l.quantity, 0)} items)`} value={formatPrice(subtotal)} />
              <SummaryRow label="Delivery" value={formatPrice(delivery)} />
              {off > 0 && <SummaryRow label="Discount" value={`− ${formatPrice(off)}`} />}
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                The customer gets the usual order SMS and email. Free-shipping rules apply unless you set a delivery charge.
              </p>
              <Button type="submit" className="mt-3 w-full" disabled={create.isPending}>
                {create.isPending && <Loader2 className="animate-spin" />}
                Create order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}

function Field({ label, error, required, className, children }: { label: string; error?: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground tabular-nums">{value}</span>
    </div>
  )
}

function ProductPicker({ onPick }: { onPick: (product: Product, variant: ProductVariant) => void }) {
  const [term, setTerm] = useState('')
  const [q, setQ] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setQ(term.trim()), 300)
    return () => clearTimeout(timer)
  }, [term])

  const { data, isFetching } = useQuery({
    queryKey: ['admin', 'products', 'picker', q],
    queryFn: () => api<Paginated<Product>>('/admin/products', { query: { q: q || undefined, status: 'published', per_page: 8 } }).then((r) => r.data),
    enabled: !isUnsafeText(q),
  })

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search products…" className="pl-8" aria-label="Search products" />
        {isFetching && <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>
      <div className="max-h-72 overflow-y-auto rounded-lg border">
        {data?.length ? (
          <ul className="divide-y">
            {data.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center gap-3 p-2.5">
                <span className="size-9 shrink-0 overflow-hidden rounded border bg-muted">{product.thumbnail && <img src={product.thumbnail} alt="" className="size-full object-cover" />}</span>
                <p className="min-w-0 flex-1 truncate text-sm">{product.name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((variant) => {
                    const soldOut = variant.stock !== null && variant.stock <= 0
                    return (
                      <Button key={variant.id} type="button" size="sm" variant="outline" disabled={soldOut} onClick={() => onPick(product, variant)} className="h-7 text-xs">
                        <Plus className="size-3" />
                        {variant.title} · {formatPrice(variant.price)}
                        {soldOut && ' (sold out)'}
                      </Button>
                    )
                  })}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
            <PackageSearch className="size-4" /> {isFetching ? 'Searching…' : 'No published products found.'}
          </p>
        )}
      </div>
    </div>
  )
}

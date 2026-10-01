"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AddressFields, EMPTY_ADDRESS, type AddressValues } from "@/components/order/address-fields";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { RemoteImage } from "@/components/shared/remote-image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useHydrated } from "@/hooks/use-hydrated";
import { api, ApiError } from "@/lib/api";
import { formatPrice, PAYMENT_METHOD_LABEL } from "@/lib/format";
import { rememberLastOrder } from "@/lib/last-order";
import { useAddresses, useSettings, useShippingMethods } from "@/lib/queries";
import type { Order, PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { cartSubtotal, useCartStore } from "@/stores/cart";

const NEW_ADDRESS = "new";

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 font-medium text-gray-900">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-white">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function OptionCard({ value, checked, children }: { value: string; checked: boolean; children: React.ReactNode }) {
  return (
    <Label
      htmlFor={`option-${value}`}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-sm border p-3 font-normal transition-colors",
        checked ? "border-primary bg-secondary/60" : "hover:border-primary/40",
      )}
    >
      <RadioGroupItem value={value} id={`option-${value}`} className="mt-0.5" />
      <div className="flex-1">{children}</div>
    </Label>
  );
}

export function CheckoutContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const { token, user } = useAuthStore();

  const { data: settings } = useSettings();
  const { data: shippingMethods, isLoading: loadingShipping } = useShippingMethods();
  const { data: addresses } = useAddresses(hydrated && Boolean(token));

  const [chosenAddress, setAddressChoice] = useState<string | null>(null);
  const [editedAddress, setAddress] = useState<AddressValues | null>(null);
  const [saveAddress, setSaveAddress] = useState(true);
  const [shippingId, setShippingId] = useState<string>("");
  const [payment, setPayment] = useState<PaymentMethod | "">("");
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<ApiError | null>(null);

  const defaultAddress = addresses?.find((a) => a.is_default) ?? addresses?.[0];
  const addressChoice = chosenAddress ?? (defaultAddress ? String(defaultAddress.id) : NEW_ADDRESS);
  const address = editedAddress ?? { ...EMPTY_ADDRESS, name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" };

  const paymentMethods = useMemo<PaymentMethod[]>(() => (settings?.payment_methods?.length ? settings.payment_methods : ["cod"]), [settings]);
  const selectedPayment = payment || paymentMethods[0];
  const selectedShipping = shippingMethods?.find((m) => String(m.id) === shippingId) ?? shippingMethods?.[0];

  const subtotal = cartSubtotal(items);
  const threshold = settings?.free_shipping_threshold ?? null;
  const freeShipping = Boolean(threshold && threshold > 0 && subtotal >= threshold);
  const shippingCost = selectedShipping && !freeShipping ? selectedShipping.price : 0;
  const total = subtotal + shippingCost;

  const paymentNumber = selectedPayment && selectedPayment !== "cod" ? settings?.[`${selectedPayment}_number`] : null;

  const checkout = useMutation({
    mutationFn: () => {
      const usingSaved = addressChoice !== NEW_ADDRESS;
      return api<{ data: Order }>("/checkout", {
        method: "POST",
        body: {
          items: items.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })),
          shipping_method_id: selectedShipping?.id,
          payment_method: selectedPayment,
          transaction_id: selectedPayment === "cod" ? null : transactionId || null,
          payment_sender_number: selectedPayment === "cod" ? null : senderNumber || null,
          customer_note: note || null,
          ...(usingSaved ? { address_id: Number(addressChoice) } : { address, save_address: Boolean(token) && saveAddress }),
        },
      }).then((r) => r.data);
    },
    onSuccess: (order) => {
      rememberLastOrder(order);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      router.push(`/order-success?number=${encodeURIComponent(order.order_number)}`);
    },
    onError: (e) => {
      const apiError = e instanceof ApiError ? e : new ApiError(String(e), 0);
      setError(apiError);
      toast.error(Object.keys(apiError.errors).length > 0 ? "Please fix the highlighted fields." : apiError.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  if (!hydrated) {
    return (
      <Container className="py-8">
        <Skeleton className="h-96 w-full" />
      </Container>
    );
  }

  if (items.length === 0 && !checkout.isSuccess) {
    return (
      <Container className="py-10">
        <EmptyState
          icon={ShoppingBasket}
          title="Your cart is empty"
          description="Add some products before checking out."
          action={
            <Button asChild>
              <Link href="/shop">Browse products</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const fieldError = (name: string) => error?.field(name);
  const itemErrors = Object.entries(error?.errors ?? {})
    .filter(([key]) => key.startsWith("items"))
    .flatMap(([, messages]) => messages);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    checkout.mutate();
  };

  return (
    <Container>
      <PageBreadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="font-heading mb-6 text-xl font-medium tracking-[0.12em] uppercase">Checkout</h1>

      {!token && (
        <p className="mb-4 rounded-sm bg-surface px-4 py-3 text-sm text-gray-700">
          Already have an account?{" "}
          <Link href="/login?redirect=/checkout" className="font-medium text-primary underline-offset-4 hover:underline">
            Log in
          </Link>{" "}
          for faster checkout and order history.
        </p>
      )}

      {itemErrors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {itemErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]" noValidate>
        <div className="space-y-5">
          <Section step={1} title="Delivery address">
            {addresses && addresses.length > 0 && (
              <RadioGroup value={addressChoice} onValueChange={setAddressChoice} className="mb-4 gap-2">
                {addresses.map((saved) => (
                  <OptionCard key={saved.id} value={String(saved.id)} checked={addressChoice === String(saved.id)}>
                    <p className="text-sm font-medium text-gray-900">
                      {saved.label ? `${saved.label} · ` : ""}
                      {saved.name} <span className="font-normal text-muted-foreground">({saved.phone})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{[saved.full_address, saved.zone, saved.city].filter(Boolean).join(", ")}</p>
                  </OptionCard>
                ))}
                <OptionCard value={NEW_ADDRESS} checked={addressChoice === NEW_ADDRESS}>
                  <p className="text-sm font-medium text-gray-900">Use a new address</p>
                </OptionCard>
              </RadioGroup>
            )}
            {fieldError("address_id") && <p className="mb-3 text-xs text-destructive">{fieldError("address_id")}</p>}

            {addressChoice === NEW_ADDRESS && (
              <>
                <AddressFields values={address} onChange={setAddress} errorFor={(field) => fieldError(`address.${field}`)} />
                {token && (
                  <Label className="mt-4 flex items-center gap-2 font-normal text-gray-700">
                    <Checkbox checked={saveAddress} onCheckedChange={(checked) => setSaveAddress(checked === true)} />
                    Save this address to my account
                  </Label>
                )}
              </>
            )}
          </Section>

          <Section step={2} title="Delivery method">
            {loadingShipping ? (
              <Skeleton className="h-16 w-full" />
            ) : shippingMethods?.length ? (
              <RadioGroup value={String(selectedShipping?.id ?? "")} onValueChange={setShippingId} className="gap-2">
                {shippingMethods.map((method) => (
                  <OptionCard key={method.id} value={String(method.id)} checked={selectedShipping?.id === method.id}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-medium text-gray-900">{method.title}</span>
                      <span className="text-primary">{freeShipping ? "Free" : formatPrice(method.price)}</span>
                    </div>
                    {method.description && <p className="text-xs text-muted-foreground">{method.description}</p>}
                  </OptionCard>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-sm text-muted-foreground">No delivery methods are available right now.</p>
            )}
            {fieldError("shipping_method_id") && <p className="mt-2 text-xs text-destructive">{fieldError("shipping_method_id")}</p>}
          </Section>

          <Section step={3} title="Payment">
            <RadioGroup value={selectedPayment} onValueChange={(value) => setPayment(value as PaymentMethod)} className="gap-2 sm:grid-cols-2">
              {paymentMethods.map((method) => (
                <OptionCard key={method} value={method} checked={selectedPayment === method}>
                  <span className="text-sm font-medium text-gray-900">{PAYMENT_METHOD_LABEL[method] ?? method}</span>
                </OptionCard>
              ))}
            </RadioGroup>
            {fieldError("payment_method") && <p className="mt-2 text-xs text-destructive">{fieldError("payment_method")}</p>}

            {selectedPayment !== "cod" && (
              <div className="mt-4 space-y-4 rounded-sm bg-surface p-4">
                <p className="text-sm text-gray-700">
                  Send <strong>{formatPrice(total)}</strong> via {PAYMENT_METHOD_LABEL[selectedPayment]} (Send Money)
                  {paymentNumber ? (
                    <>
                      {" "}
                      to <strong className="font-mono">{paymentNumber}</strong>
                    </>
                  ) : null}
                  , then enter the transaction ID below.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField id="transaction_id" label="Transaction ID" required error={fieldError("transaction_id")}>
                    <Input id="transaction_id" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="e.g. 8N7A6B5C4D" aria-invalid={Boolean(fieldError("transaction_id")) || undefined} />
                  </FormField>
                  <FormField id="payment_sender_number" label="Sender number" error={fieldError("payment_sender_number")}>
                    <Input id="payment_sender_number" type="tel" value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} placeholder="01XXXXXXXXX" />
                  </FormField>
                </div>
              </div>
            )}

            <FormField id="customer_note" label="Order note (optional)" error={fieldError("customer_note")} className="mt-4">
              <Textarea id="customer_note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Anything we should know about delivery?" />
            </FormField>
          </Section>
        </div>

        <aside className="h-fit space-y-4 rounded-sm border bg-surface p-5 lg:sticky lg:top-28">
          <h2 className="font-medium text-gray-900">Your order</h2>
          <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-muted">
                  <RemoteImage src={item.image} alt={item.name} sizes="56px" />
                  <span className="absolute top-0 right-0 rounded-bl-sm bg-primary px-1.5 text-[10px] text-white">{item.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bangla line-clamp-2 text-sm text-gray-900">{item.name}</p>
                  {item.variantTitle && <p className="text-xs text-muted-foreground">{item.variantTitle}</p>}
                </div>
                <span className="text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{freeShipping ? "Free" : formatPrice(shippingCost)}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button type="submit" size="lg" className="w-full shadow-md shadow-primary/30" disabled={checkout.isPending || !selectedShipping}>
            {checkout.isPending && <Loader2 className="size-4 animate-spin" />}
            Place order
          </Button>
          <Button asChild variant="link" className="w-full">
            <Link href="/cart">Back to cart</Link>
          </Button>
        </aside>
      </form>
    </Container>
  );
}

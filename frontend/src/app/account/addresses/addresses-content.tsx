"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AddressFields, EMPTY_ADDRESS, type AddressValues } from "@/components/order/address-fields";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError, errorMessage } from "@/lib/api";
import { useAddresses } from "@/lib/queries";
import type { Address } from "@/lib/types";

type Editing = { id: number | null; label: string; is_default: boolean; values: AddressValues };

const toValues = (address: Address): AddressValues => ({
  name: address.name,
  email: address.email ?? "",
  phone: address.phone,
  region: address.region ?? "",
  city: address.city ?? "",
  zone: address.zone ?? "",
  landmark: address.landmark ?? "",
  full_address: address.full_address,
});

export function AddressesContent() {
  const queryClient = useQueryClient();
  const { data: addresses, isLoading } = useAddresses();
  const [editing, setEditing] = useState<Editing | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const save = useMutation({
    mutationFn: (draft: Editing) => {
      const body = { ...draft.values, label: draft.label || null, is_default: draft.is_default };
      return draft.id
        ? api(`/account/addresses/${draft.id}`, { method: "PUT", body })
        : api("/account/addresses", { method: "POST", body });
    },
    onSuccess: () => {
      toast.success("Address saved.");
      setEditing(null);
      refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/account/addresses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Address removed.");
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const makeDefault = useMutation({
    mutationFn: (id: number) => api(`/account/addresses/${id}`, { method: "PUT", body: { is_default: true } }),
    onSuccess: refresh,
    onError: (e) => toast.error(errorMessage(e)),
  });

  const error = save.error instanceof ApiError ? save.error : null;

  const open = (draft: Editing) => {
    save.reset();
    setEditing(draft);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold text-gray-900">Saved addresses</h1>
        <Button size="sm" onClick={() => open({ id: null, label: "", is_default: !addresses?.length, values: EMPTY_ADDRESS })}>
          <Plus className="size-4" /> Add address
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : addresses?.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="flex flex-col rounded-2xl border bg-white p-5 text-sm">
              <div className="mb-2 flex items-center gap-2">
                <p className="font-medium text-gray-900">{address.label || address.name}</p>
                {address.is_default && <Badge className="bg-secondary text-primary">Default</Badge>}
              </div>
              <p className="text-gray-800">{address.name}</p>
              <p className="text-muted-foreground">{address.phone}</p>
              <p className="mt-1 flex-1 text-muted-foreground">
                {[address.full_address, address.landmark, address.zone, address.city, address.region].filter(Boolean).join(", ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => open({ id: address.id, label: address.label ?? "", is_default: address.is_default, values: toValues(address) })}
                >
                  <Pencil className="size-3.5" /> Edit
                </Button>
                {!address.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => makeDefault.mutate(address.id)} disabled={makeDefault.isPending}>
                    Set as default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-destructive hover:bg-red-50 hover:text-destructive"
                  onClick={() => remove.mutate(address.id)}
                  disabled={remove.isPending}
                  aria-label="Delete address"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={MapPin} title="No saved addresses" description="Save an address for faster checkout." />
      )}

      <Dialog open={editing !== null} onOpenChange={(isOpen) => !isOpen && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit address" : "Add address"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              id="address-form"
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
            >
              <FormField id="addr-label" label="Label" error={error?.field("label")}>
                <Input id="addr-label" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} placeholder="Home, Office..." />
              </FormField>
              <AddressFields idPrefix="addr" values={editing.values} onChange={(values) => setEditing({ ...editing, values })} errorFor={(field) => error?.field(field)} />
              <Label className="flex items-center gap-2 font-normal text-gray-700">
                <Checkbox checked={editing.is_default} onCheckedChange={(checked) => setEditing({ ...editing, is_default: checked === true })} />
                Use as default address
              </Label>
            </form>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="address-form" disabled={save.isPending}>
              {save.isPending && <Loader2 className="size-4 animate-spin" />}
              Save address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { FormField } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type AddressValues = {
  name: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  zone: string;
  landmark: string;
  full_address: string;
};

export const EMPTY_ADDRESS: AddressValues = {
  name: "",
  email: "",
  phone: "",
  region: "",
  city: "",
  zone: "",
  landmark: "",
  full_address: "",
};

export function AddressFields({
  values,
  onChange,
  errorFor,
  idPrefix = "address",
}: {
  values: AddressValues;
  onChange: (values: AddressValues) => void;
  errorFor: (field: keyof AddressValues) => string | undefined;
  idPrefix?: string;
}) {
  const bind = (field: keyof AddressValues) => ({
    id: `${idPrefix}-${field}`,
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...values, [field]: e.target.value }),
    "aria-invalid": Boolean(errorFor(field)) || undefined,
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField id={`${idPrefix}-name`} label="Full name" required error={errorFor("name")}>
        <Input {...bind("name")} autoComplete="name" placeholder="Your name" />
      </FormField>
      <FormField id={`${idPrefix}-phone`} label="Phone number" required error={errorFor("phone")}>
        <Input {...bind("phone")} type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
      </FormField>
      <FormField id={`${idPrefix}-email`} label="Email" error={errorFor("email")} className="sm:col-span-2">
        <Input {...bind("email")} type="email" autoComplete="email" placeholder="you@example.com" />
      </FormField>
      <FormField id={`${idPrefix}-region`} label="Division" error={errorFor("region")}>
        <Input {...bind("region")} autoComplete="address-level1" placeholder="e.g. Khulna" />
      </FormField>
      <FormField id={`${idPrefix}-city`} label="District / City" error={errorFor("city")}>
        <Input {...bind("city")} autoComplete="address-level2" placeholder="e.g. Satkhira" />
      </FormField>
      <FormField id={`${idPrefix}-zone`} label="Area / Thana" error={errorFor("zone")}>
        <Input {...bind("zone")} placeholder="e.g. Shyamnagar" />
      </FormField>
      <FormField id={`${idPrefix}-landmark`} label="Landmark" error={errorFor("landmark")}>
        <Input {...bind("landmark")} placeholder="Near ..." />
      </FormField>
      <FormField id={`${idPrefix}-full_address`} label="Full address" required error={errorFor("full_address")} className="sm:col-span-2">
        <Textarea {...bind("full_address")} autoComplete="street-address" rows={3} placeholder="House, road, village" />
      </FormField>
    </div>
  );
}

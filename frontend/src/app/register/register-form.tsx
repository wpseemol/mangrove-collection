"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { GoogleButton } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";
import { FormField } from "@/components/shared/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { api, ApiError } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";

export function RegisterForm() {
  const { redirect, signIn } = useAuthRedirect();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", password_confirmation: "" });

  const mutation = useMutation({
    mutationFn: () =>
      api<AuthResponse>("/auth/register", {
        method: "POST",
        body: { ...form, phone: form.phone || null, device_name: "storefront" },
      }),
    onSuccess: signIn,
  });

  const error = mutation.error instanceof ApiError ? mutation.error : null;
  const hasFieldErrors = error && Object.keys(error.errors).length > 0;
  const bind = (field: keyof typeof form) => ({
    id: field,
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value }),
    "aria-invalid": Boolean(error?.field(field)) || undefined,
  });

  return (
    <>
      {mutation.isError && !hasFieldErrors && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      )}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <FormField id="name" label="Full name" required error={error?.field("name")}>
          <Input {...bind("name")} autoComplete="name" required />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="email" label="Email" required error={error?.field("email")}>
            <Input {...bind("email")} type="email" autoComplete="email" required />
          </FormField>
          <FormField id="phone" label="Phone" error={error?.field("phone")}>
            <Input {...bind("phone")} type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="password" label="Password" required error={error?.field("password")}>
            <PasswordInput {...bind("password")} autoComplete="new-password" minLength={8} required />
          </FormField>
          <FormField id="password_confirmation" label="Confirm password" required>
            <PasswordInput {...bind("password_confirmation")} autoComplete="new-password" required />
          </FormField>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <GoogleButton label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}

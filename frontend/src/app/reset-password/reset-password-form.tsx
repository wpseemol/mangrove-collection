"use client";

import { useMutation } from "@tanstack/react-query";
import { CircleCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { PasswordInput } from "@/components/auth/password-input";
import { FormField } from "@/components/shared/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";

export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: { token, email, password, password_confirmation: confirmation },
      }),
  });

  const error = mutation.error instanceof ApiError ? mutation.error : null;

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          This reset link is invalid.{" "}
          <Link href="/forgot-password" className="underline">
            Request a new one
          </Link>
          .
        </AlertDescription>
      </Alert>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="text-center">
        <CircleCheck className="mx-auto mb-3 size-12 text-primary" />
        <p className="text-sm text-foreground/80">Your password has been reset. You can now log in with your new password.</p>
        <Button asChild className="mt-5">
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <FormField id="email" label="Email" error={error?.field("email")}>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </FormField>
      <FormField id="password" label="New password" error={error?.field("password")}>
        <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
      </FormField>
      <FormField id="password_confirmation" label="Confirm new password">
        <PasswordInput id="password_confirmation" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" required />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Reset password
      </Button>
    </form>
  );
}

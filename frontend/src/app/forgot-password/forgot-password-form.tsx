"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLoginMethods } from "@/hooks/use-login-methods";
import { api, ApiError } from "@/lib/api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const methods = useLoginMethods();

  const mutation = useMutation({
    mutationFn: () => api<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } }),
  });

  const error = mutation.error instanceof ApiError ? mutation.error : null;

  if (!methods.password) {
    return (
      <div className="text-center">
        <p className="text-sm text-foreground/80">Password sign-in is turned off for customers{methods.google ? ", so there is no password to reset. Sign in with Google instead." : "."}</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/login">Back to log in</Link>
        </Button>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto mb-3 size-12 text-primary" />
        <p className="text-sm text-foreground/80">{mutation.data.message}</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/login">Back to log in</Link>
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
      <FormField id="email" label="Email" error={error?.field("email") ?? error?.message}>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Send reset link
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

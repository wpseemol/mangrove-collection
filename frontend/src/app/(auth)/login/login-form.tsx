"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { GoogleButton } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { api, ApiError } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";

export function LoginForm() {
  const { redirect, signIn } = useAuthRedirect();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => api<AuthResponse>("/auth/login", { method: "POST", body: { login, password, device_name: "storefront" } }),
    onSuccess: signIn,
  });

  const error = mutation.error instanceof ApiError ? mutation.error : null;
  const loginError = error?.field("login") ?? (error && !error.field("password") ? error.message : undefined);

  return (
    <>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <FormField id="login" label="Email or phone" error={loginError}>
          <Input id="login" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" placeholder="you@example.com or 01XXXXXXXXX" required aria-invalid={Boolean(loginError) || undefined} />
        </FormField>
        <FormField
          id="password"
          label="Password"
          error={error?.field("password")}
          hint={
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          }
        >
          <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
          Log in
        </Button>
      </form>

      <GoogleButton />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Mangrove Collection?{" "}
        <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} scroll={false} className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}

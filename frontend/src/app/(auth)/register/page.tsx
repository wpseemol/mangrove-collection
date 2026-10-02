import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="Join us for faster checkout and order tracking.">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}

import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send you a link to reset it.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}

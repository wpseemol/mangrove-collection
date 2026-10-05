import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { pageMetadata } from "@/lib/seo";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = pageMetadata({
  title: "Forgot password",
  description: "Reset the password for your Mangrove Collection account.",
  path: "/forgot-password/",
  noindex: true,
});

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send you a link to reset it.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { pageMetadata } from "@/lib/seo";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = pageMetadata({
  title: "Reset password",
  description: "Choose a new password for your Mangrove Collection account.",
  noindex: true,
});

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" subtitle="Your new password must be at least 8 characters.">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}

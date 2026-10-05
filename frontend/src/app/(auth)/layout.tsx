import { AuthSwitcher } from "@/components/auth/auth-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthSwitcher>{children}</AuthSwitcher>;
}

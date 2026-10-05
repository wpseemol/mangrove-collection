import type { Metadata } from "next";

import { AccountShell } from "./account-shell";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s | My account | Mangrove Collection" },
  robots: { index: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}

import { LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Shown when the admin has switched off every customer sign-in method. */
export function SignInUnavailable() {
  return (
    <div className="py-4 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <LockKeyhole className="size-6" />
      </span>
      <p className="mt-4 font-semibold text-foreground">Sign-in is unavailable right now</p>
      <p className="mt-1 text-sm text-muted-foreground">Please try again later, or contact us if you need help with an order.</p>
      <Button asChild variant="outline" className="mt-5">
        <Link href="/contact">Contact us</Link>
      </Button>
    </div>
  );
}

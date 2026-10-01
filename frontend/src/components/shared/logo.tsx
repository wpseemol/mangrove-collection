import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} aria-label="Mangrove Collection home">
      <Image src="/assets/logo.png" alt="" width={44} height={44} className="size-11 rounded-sm bg-white object-contain" priority />
      <span className={cn("text-sm leading-tight font-medium text-brand", textClassName)}>
        Mangrove
        <br />
        Collection
      </span>
    </Link>
  );
}

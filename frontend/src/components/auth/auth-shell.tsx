import { Leaf, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/shared/container";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Container className="py-10">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-md border bg-white shadow-sm md:grid-cols-[5fr_6fr]">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-8 text-white md:flex">
          <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-brand/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-black/30 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <Image src="/assets/logo.png" alt="" width={48} height={48} className="size-12 rounded-sm bg-white object-contain" />
            <p className="leading-tight font-medium text-brand">
              Mangrove
              <br />
              Collection
            </p>
          </div>

          <div className="relative">
            <p className="font-heading text-xs tracking-[0.2em] text-brand uppercase">From the heart of Sundarban</p>
            <h2 className="mt-2 text-2xl leading-snug font-semibold">Pure, fresh &amp; natural products delivered to your door.</h2>
          </div>

          <ul className="relative space-y-3 text-sm text-white/85">
            <li className="flex items-center gap-2">
              <Leaf className="size-4 text-brand" /> Collected directly from the Sundarbans
            </li>
            <li className="flex items-center gap-2">
              <Truck className="size-4 text-brand" /> Home delivery all over Bangladesh
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-brand" /> Cash on delivery &amp; mobile banking
            </li>
          </ul>
        </div>

        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </Container>
  );
}

import { Leaf, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";

import { Container } from "@/components/shared/container";

const POINTS = [
  { icon: Leaf, text: "Collected directly from the Sundarbans" },
  { icon: Truck, text: "Home delivery all over Bangladesh" },
  { icon: ShieldCheck, text: "Cash on delivery & mobile banking" },
];

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Container className="py-12 md:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border bg-white shadow-xl shadow-black/5 md:grid-cols-[5fr_6fr]">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-forest p-10 text-white md:flex">
          <div className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-brand/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 size-64 rounded-full bg-gold/20 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <Image src="/assets/logo.png" alt="" width={48} height={48} className="size-12 rounded-full bg-white object-contain" />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-xl font-semibold">Mangrove</span>
              <span className="mt-1 text-[10px] font-medium tracking-[0.32em] text-white/70 uppercase">Collection</span>
            </span>
          </div>

          <div className="relative py-10">
            <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">From the heart of Sundarban</p>
            <h2 className="font-heading mt-3 text-3xl leading-tight font-semibold">Pure, fresh &amp; natural — delivered to your door.</h2>
          </div>

          <ul className="relative space-y-3.5 text-sm text-white/85">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-white/10">
                  <Icon className="size-4 text-gold" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-7 sm:p-10 md:p-12">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </Container>
  );
}

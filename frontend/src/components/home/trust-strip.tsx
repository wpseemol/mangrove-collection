import { Leaf, ShieldCheck, Truck, Wallet } from "lucide-react";

import { Container } from "@/components/shared/container";

const ITEMS = [
  { icon: Leaf, title: "Directly sourced", text: "Collected from the Sundarbans" },
  { icon: ShieldCheck, title: "Carefully checked", text: "Fresh, natural & hygienic packing" },
  { icon: Truck, title: "Nationwide delivery", text: "Home delivery all over Bangladesh" },
  { icon: Wallet, title: "Easy payment", text: "Cash on delivery & mobile banking" },
];

export function TrustStrip() {
  return (
    <Container className="mt-6">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 bg-white p-4 sm:p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Icon className="size-5" strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-900">{title}</span>
              <span className="block text-xs text-muted-foreground">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </Container>
  );
}

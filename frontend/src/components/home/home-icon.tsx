import {
  Award,
  Clock,
  Fish,
  Heart,
  Leaf,
  type LucideIcon,
  type LucideProps,
  PackageCheck,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wallet,
} from "lucide-react";

import type { HomeIcon as HomeIconName } from "@/lib/home-content";

const ICONS: Record<HomeIconName, LucideIcon> = {
  leaf: Leaf,
  "shield-check": ShieldCheck,
  truck: Truck,
  wallet: Wallet,
  fish: Fish,
  "package-check": PackageCheck,
  heart: Heart,
  star: Star,
  clock: Clock,
  sparkles: Sparkles,
  award: Award,
  phone: Phone,
};

export function HomeIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name as HomeIconName] ?? Leaf;
  return <Icon {...props} />;
}

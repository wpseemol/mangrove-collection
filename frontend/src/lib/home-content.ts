"use client";

import { useMemo } from "react";

import { usePage } from "@/lib/queries";
import type { PageSection } from "@/lib/types";

/**
 * Home page copy is stored as typed blocks in the `sections` of the dashboard-managed `home` page.
 * Keep the block shapes and defaults in sync with `dashboard/src/lib/home-content.ts`.
 */

export const HOME_ICONS = [
  "leaf",
  "shield-check",
  "truck",
  "wallet",
  "fish",
  "package-check",
  "heart",
  "star",
  "clock",
  "sparkles",
  "award",
  "phone",
] as const;
export type HomeIcon = (typeof HOME_ICONS)[number];

export type IconItem = { icon: string; title: string; text: string };
export type HeroPromo = { eyebrow: string; title: string; link_label: string; link_url: string };

export type HeroBlock = {
  type: "hero";
  /** `static`: headline and buttons; `slider`: image slides managed as banners. */
  mode: "static" | "slider";
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  primary_label: string;
  primary_url: string;
  secondary_label: string;
  secondary_url: string;
  image: string;
  autoplay_seconds: number;
  show_side_cards: boolean;
  promos: HeroPromo[];
};

export type TrustBlock = { type: "trust"; enabled: boolean; items: IconItem[] };

export type HeadingBlock = {
  type: "categories" | "popular" | "latest";
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  link_label: string;
};

export type PromiseBlock = {
  type: "promise";
  enabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  primary_label: string;
  primary_url: string;
  secondary_label: string;
  secondary_url: string;
  steps: IconItem[];
};

export type StoryBlock = {
  type: "story";
  enabled: boolean;
  eyebrow: string;
  title: string;
  /** Plain text, one paragraph per line. */
  body: string;
  image: string;
  button_label: string;
  button_url: string;
  stats: { value: string; label: string }[];
};

export type HomeContent = {
  hero: HeroBlock;
  trust: TrustBlock;
  categories: HeadingBlock;
  popular: HeadingBlock;
  latest: HeadingBlock;
  promise: PromiseBlock;
  story: StoryBlock;
};

export const DEFAULT_HOME: HomeContent = {
  hero: {
    type: "hero",
    mode: "slider",
    eyebrow: "From the heart of the Sundarbans",
    title: "Fresh from the mangrove,",
    highlight: "delivered to your door.",
    description:
      "Fish, crab, prawn and pure honey collected directly from the Sundarbans — carefully packed and delivered all over Bangladesh.",
    primary_label: "Shop now",
    primary_url: "/shop",
    secondary_label: "Browse categories",
    secondary_url: "/categories",
    image: "",
    autoplay_seconds: 5,
    show_side_cards: true,
    promos: [
      { eyebrow: "Just landed", title: "New arrivals", link_label: "Shop now", link_url: "/shop?sort=latest" },
      { eyebrow: "Limited time", title: "Today's offers", link_label: "Shop now", link_url: "/offers" },
    ],
  },
  trust: {
    type: "trust",
    enabled: true,
    items: [
      { icon: "leaf", title: "Directly sourced", text: "Collected from the Sundarbans" },
      { icon: "shield-check", title: "Carefully checked", text: "Fresh, natural & hygienic packing" },
      { icon: "truck", title: "Nationwide delivery", text: "Home delivery all over Bangladesh" },
      { icon: "wallet", title: "Easy payment", text: "Cash on delivery & mobile banking" },
    ],
  },
  categories: {
    type: "categories",
    enabled: true,
    eyebrow: "Shop by category",
    title: "Explore our collection",
    subtitle: "Hand-picked produce from the Sundarbans, sorted for you.",
    link_label: "All categories",
  },
  popular: {
    type: "popular",
    enabled: true,
    eyebrow: "Best sellers",
    title: "Popular right now",
    subtitle: "Our customers' favourites from the Sundarbans.",
    link_label: "View all",
  },
  latest: {
    type: "latest",
    enabled: true,
    eyebrow: "Fresh in",
    title: "New arrivals",
    subtitle: "The latest catch and harvest, just added to the store.",
    link_label: "View all",
  },
  promise: {
    type: "promise",
    enabled: true,
    eyebrow: "Our promise",
    title: "From the heart of the Sundarbans to your kitchen.",
    description:
      "Mangrove Collection sources directly from the Sundarbans, so you get honest, fresh and natural products without the middlemen.",
    primary_label: "Read our story",
    primary_url: "/about",
    secondary_label: "Contact us",
    secondary_url: "/contact",
    steps: [
      { icon: "fish", title: "Collected at the source", text: "Local collectors gather fish, crab, prawn and honey straight from the Sundarbans." },
      { icon: "leaf", title: "Kept natural", text: "No shortcuts — products are cleaned, sorted and kept as close to nature as possible." },
      { icon: "package-check", title: "Packed & delivered", text: "Carefully packed and sent to your door anywhere in Bangladesh." },
    ],
  },
  story: {
    type: "story",
    enabled: true,
    eyebrow: "Our story",
    title: "Born on the edge of the Sundarbans",
    body:
      "Mangrove Collection began with a simple idea: the honest, natural food of the Sundarbans should reach every kitchen in Bangladesh without losing its freshness on the way.\nWe work side by side with local fishermen and honey collectors, paying them fairly and bringing their harvest straight to you.",
    image: "",
    button_label: "Read our full story",
    button_url: "/about",
    stats: [
      { value: "100%", label: "Natural products" },
      { value: "64", label: "Districts delivered" },
      { value: "Direct", label: "From local collectors" },
    ],
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** Takes each default key from `stored` when it has the same type; array items are merged against the first default item. */
function merge<T extends object>(defaults: T, stored: unknown): T {
  if (!isRecord(stored)) return defaults;

  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const fallback = defaults[key];
    const value = stored[key as string];

    if (Array.isArray(fallback)) {
      if (!Array.isArray(value)) continue;
      const template = fallback[0];
      result[key] = (isRecord(template) ? value.filter(isRecord).map((item) => merge(template, item)) : value) as T[keyof T];
    } else if (typeof value === typeof fallback) {
      result[key] = value as T[keyof T];
    }
  }
  return result;
}

export function parseHomeContent(sections: PageSection[] | undefined): HomeContent {
  const find = (type: string) => sections?.find((section) => section.type === type);

  return Object.fromEntries(
    (Object.keys(DEFAULT_HOME) as (keyof HomeContent)[]).map((key) => [key, merge(DEFAULT_HOME[key], find(key))]),
  ) as HomeContent;
}

/** `ready` turns true once the saved copy has loaded (or failed to), so defaults never flash before edited text. */
export function useHomeContent() {
  const { data, isLoading } = usePage("home");
  const content = useMemo(() => parseHomeContent(data?.sections), [data]);

  return { content, ready: !isLoading };
}

export const paragraphs = (text: string) =>
  text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

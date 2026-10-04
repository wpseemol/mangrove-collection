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

/** Card text supports `**bold**` and `[label](/path or https://link)`; each line is a paragraph. */
export type InfoCard = { title: string; body: string };

export type InfoBlock = {
  type: "info";
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Cards shown before "Read more"; 0 shows every card. */
  visible_count: number;
  read_more_label: string;
  read_less_label: string;
  items: InfoCard[];
};

export type NewsletterBlock = {
  type: "newsletter";
  enabled: boolean;
  title: string;
  subtitle: string;
  placeholder: string;
  button_label: string;
  success_message: string;
  note: string;
};

export type HomeContent = {
  hero: HeroBlock;
  trust: TrustBlock;
  categories: HeadingBlock;
  popular: HeadingBlock;
  latest: HeadingBlock;
  promise: PromiseBlock;
  story: StoryBlock;
  info: InfoBlock;
  newsletter: NewsletterBlock;
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
  info: {
    type: "info",
    enabled: true,
    eyebrow: "Why Mangrove Collection",
    title: "Natural food from the Sundarbans, delivered with care",
    subtitle: "Everything you need to know about where our products come from and how we get them to you.",
    visible_count: 6,
    read_more_label: "Read more",
    read_less_label: "Show less",
    items: [
      {
        title: "Bangladesh's Sundarbans food store",
        body: "Mangrove Collection brings the natural harvest of the Sundarbans straight to your kitchen. From [raw mangrove honey](/shop?category=honey) to [fresh seawater fish](/shop?category=seawater-fish), every product is sourced directly from local collectors and fishermen — **no middlemen, no shortcuts**.",
      },
      {
        title: "Pure, raw Sundarbans honey",
        body: "Our **Khalisha** and **Goran** flower honey is gathered by traditional honey collectors deep in the mangrove forest. It is raw, unprocessed and never mixed with sugar syrup — exactly as nature made it. [Shop honey](/shop?category=honey).",
      },
      {
        title: "Fresh fish, crab and prawn",
        body: "Hilsa, bhetki, pomfret, parshe, mud crab and golda prawn are landed, cleaned and packed the same day. Careful cold packing keeps every order fresh until it reaches your door. Browse the [latest catch](/shop?sort=latest).",
      },
      {
        title: "Delivery to all 64 districts",
        body: "We deliver to Dhaka, Chattogram, Khulna, Sylhet and every other district in Bangladesh. Pay with **cash on delivery** or mobile banking, and follow your parcel on the [order tracking](/track-order) page.",
      },
      {
        title: "Quality you can trust",
        body: "Every batch is checked for freshness, hygiene and weight before it leaves us. If anything isn't right, our team will put it right — just [contact us](/contact).",
      },
      {
        title: "Fair to the people of the forest",
        body: "Buying from us supports the fishermen and honey collectors who live alongside the Sundarbans. We pay fairly and source responsibly, so the forest can keep feeding Bangladesh for generations. [Read our story](/about).",
      },
      {
        title: "Weekly offers and seasonal specials",
        body: "From the first honey of the season to festival-time fish, we run fresh deals every week. See what's on today in our [offers](/offers), or subscribe below to hear about them first.",
      },
      {
        title: "Simple, secure checkout",
        body: "Add products to your cart, choose a delivery method and place your order in a few taps. You can [create an account](/register) to save addresses and see your order history.",
      },
      {
        title: "Here to help, every day",
        body: "Not sure which honey or fish is right for you? Our team is happy to advise on taste, size and storage. Browse [all categories](/categories) or reach us any time from the [contact page](/contact).",
      },
    ],
  },
  newsletter: {
    type: "newsletter",
    enabled: true,
    title: "Subscribe to our newsletter",
    subtitle: "Be the first to hear about fresh arrivals, seasonal honey harvests and subscriber-only offers.",
    placeholder: "Enter your email address",
    button_label: "Subscribe",
    success_message: "Thanks for subscribing! Watch your inbox for fresh arrivals and offers.",
    note: "No spam, ever. Unsubscribe at any time.",
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

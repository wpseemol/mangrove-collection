"use client";

import { useMemo } from "react";

import { merge, type IconItem } from "@/lib/home-content";
import { usePage } from "@/lib/queries";
import type { PageSection } from "@/lib/types";

/**
 * About page copy is stored as typed blocks in the `sections` of the dashboard-managed `about` page.
 * Keep the block shapes and defaults in sync with `dashboard/src/lib/about-content.ts`.
 */

export type Stat = { value: string; label: string };
export type Milestone = { year: string; title: string; text: string };
export type TeamMember = { name: string; role: string; image: string; bio: string };
export type GalleryImage = { image: string; caption: string };

type Heading = { enabled: boolean; eyebrow: string; title: string; subtitle: string };

export type AboutContent = {
  hero: {
    type: "hero";
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    image: string;
    primary_label: string;
    primary_url: string;
    secondary_label: string;
    secondary_url: string;
  };
  stats: { type: "stats"; enabled: boolean; items: Stat[] };
  story: {
    type: "story";
    enabled: boolean;
    eyebrow: string;
    title: string;
    body: string;
    image: string;
    quote: string;
    quote_author: string;
  };
  values: Heading & { type: "values"; items: IconItem[] };
  process: Heading & { type: "process"; steps: IconItem[] };
  milestones: Heading & { type: "milestones"; items: Milestone[] };
  team: Heading & { type: "team"; members: TeamMember[] };
  gallery: Heading & { type: "gallery"; images: GalleryImage[] };
  cta: {
    type: "cta";
    enabled: boolean;
    title: string;
    description: string;
    primary_label: string;
    primary_url: string;
    secondary_label: string;
    secondary_url: string;
  };
};

export const DEFAULT_ABOUT: AboutContent = {
  hero: {
    type: "hero",
    eyebrow: "Our story",
    title: "Honest food from the",
    highlight: "heart of the Sundarbans",
    description:
      "We work side by side with the fishermen and honey collectors of the world's largest mangrove forest, bringing their harvest to kitchens across Bangladesh — fresh, natural and fairly paid.",
    image: "",
    primary_label: "Shop our products",
    primary_url: "/shop",
    secondary_label: "Contact us",
    secondary_url: "/contact",
  },
  stats: {
    type: "stats",
    enabled: true,
    items: [
      { value: "100%", label: "Natural products" },
      { value: "64", label: "Districts delivered" },
      { value: "50+", label: "Local collectors" },
      { value: "Same day", label: "Catch to cold pack" },
    ],
  },
  story: {
    type: "story",
    enabled: true,
    eyebrow: "How it began",
    title: "Born on the edge of the mangrove forest",
    body:
      "Mangrove Collection began with a simple idea: the honest, natural food of the Sundarbans should reach every kitchen in Bangladesh without losing its freshness on the way.\nFor generations, local fishermen and **mouwals** (honey collectors) have harvested the forest by hand. Too often their work passed through many middlemen before it reached a family table — losing freshness, and paying the collectors very little.\nWe buy directly from them, check every batch ourselves and pack it carefully, so you get the real taste of the Sundarbans and the people of the forest get a fair price.",
    image: "",
    quote: "We only sell what we would proudly serve to our own families.",
    quote_author: "The Mangrove Collection team",
  },
  values: {
    type: "values",
    enabled: true,
    eyebrow: "What we stand for",
    title: "Our promise in every order",
    subtitle: "Four things we never compromise on, from the forest to your door.",
    items: [
      { icon: "leaf", title: "Pure & natural", text: "No chemicals, no sugar syrup, no shortcuts — exactly as nature made it." },
      { icon: "heart", title: "Fair to collectors", text: "We buy directly and pay fairly, supporting the families who live alongside the forest." },
      { icon: "shield-check", title: "Checked by hand", text: "Every batch is checked for freshness, hygiene and weight before it leaves us." },
      { icon: "truck", title: "Delivered with care", text: "Cold packing and careful handling keep every order fresh all the way to you." },
    ],
  },
  process: {
    type: "process",
    enabled: true,
    eyebrow: "From forest to kitchen",
    title: "How your order reaches you",
    subtitle: "",
    steps: [
      { icon: "fish", title: "Collected at the source", text: "Local fishermen and honey collectors harvest straight from the Sundarbans." },
      { icon: "sparkles", title: "Cleaned & sorted", text: "Products are cleaned, graded and checked by our team the same day." },
      { icon: "package-check", title: "Packed fresh", text: "Fish and seafood are cold-packed; honey is sealed in food-grade jars." },
      { icon: "truck", title: "Delivered to your door", text: "Couriers bring your order to any district in Bangladesh." },
    ],
  },
  milestones: {
    type: "milestones",
    enabled: true,
    eyebrow: "Our journey",
    title: "Milestones along the way",
    subtitle: "",
    items: [
      { year: "2021", title: "The first harvest", text: "We started with a few jars of Khalisha honey from collectors we knew personally." },
      { year: "2022", title: "Fresh fish and crab", text: "Same-day cold packing let us bring fish, crab and prawn to Khulna and Dhaka." },
      { year: "2024", title: "Nationwide delivery", text: "Orders now reach all 64 districts, with cash on delivery and mobile banking." },
    ],
  },
  team: {
    type: "team",
    enabled: false,
    eyebrow: "The people behind it",
    title: "Meet our team",
    subtitle: "A small team from Khulna and the Sundarbans, working with collectors every day.",
    members: [],
  },
  gallery: {
    type: "gallery",
    enabled: false,
    eyebrow: "Life in the mangroves",
    title: "From the Sundarbans",
    subtitle: "",
    images: [],
  },
  cta: {
    type: "cta",
    enabled: true,
    title: "Taste the Sundarbans at home",
    description: "Fresh fish, crab, prawn and raw honey — delivered anywhere in Bangladesh.",
    primary_label: "Shop now",
    primary_url: "/shop",
    secondary_label: "Talk to us",
    secondary_url: "/contact",
  },
};

export function parseAboutContent(sections: PageSection[] | undefined): AboutContent {
  const find = (type: string) => sections?.find((section) => section.type === type);

  return Object.fromEntries(
    (Object.keys(DEFAULT_ABOUT) as (keyof AboutContent)[]).map((key) => [key, mergeBlock(DEFAULT_ABOUT[key], find(key))]),
  ) as AboutContent;
}

/** Lists that start empty by default (team, gallery) have no template item for `merge`, so their items are typed here. */
function mergeBlock<T extends object>(defaults: T, stored: unknown): T {
  const block = merge(defaults, stored) as Record<string, unknown>;
  const raw = stored && typeof stored === "object" ? (stored as Record<string, unknown>) : {};
  const templates: Record<string, Record<string, string>> = {
    members: { name: "", role: "", image: "", bio: "" },
    images: { image: "", caption: "" },
  };

  for (const [key, template] of Object.entries(templates)) {
    if (key in block && Array.isArray(raw[key])) {
      block[key] = (raw[key] as unknown[]).map((item) => merge(template, item));
    }
  }
  return block as T;
}

/** `ready` turns true once the saved copy has loaded (or failed to), so defaults never flash before edited text. */
export function useAboutContent() {
  const { data, isLoading } = usePage("about");
  const content = useMemo(() => parseAboutContent(data?.sections), [data]);

  return { content, page: data, ready: !isLoading };
}

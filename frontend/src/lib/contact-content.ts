"use client";

import { useMemo } from "react";

import { merge } from "@/lib/home-content";
import { usePage } from "@/lib/queries";
import type { PageSection } from "@/lib/types";

/**
 * Contact page copy is stored as typed blocks in the `sections` of the dashboard-managed `contact` page.
 * Phone, email, address, WhatsApp and social links themselves come from the store settings.
 * Keep the block shapes and defaults in sync with `dashboard/src/lib/contact-content.ts`.
 */

export type OpeningHours = { days: string; hours: string };
export type Faq = { question: string; answer: string };

type Heading = { enabled: boolean; eyebrow: string; title: string; subtitle: string };

export type ContactContent = {
  hero: { type: "hero"; eyebrow: string; title: string; highlight: string; description: string };
  channels: {
    type: "channels";
    enabled: boolean;
    phone_note: string;
    whatsapp_note: string;
    email_note: string;
    address_note: string;
  };
  form: {
    type: "form";
    enabled: boolean;
    eyebrow: string;
    title: string;
    description: string;
    topics: string[];
    whatsapp_label: string;
    email_label: string;
    note: string;
  };
  hours: { type: "hours"; enabled: boolean; title: string; items: OpeningHours[]; note: string };
  social: { type: "social"; enabled: boolean; title: string; text: string };
  map: { type: "map"; enabled: boolean; title: string; embed_url: string; directions_url: string };
  faq: Heading & { type: "faq"; items: Faq[] };
};

export const DEFAULT_CONTACT: ContactContent = {
  hero: {
    type: "hero",
    eyebrow: "We're here to help",
    title: "Let's talk about",
    highlight: "your order",
    description:
      "Questions about an order, delivery or which honey or fish to choose? Call, message or email us — a real person from our team will get back to you quickly.",
  },
  channels: {
    type: "channels",
    enabled: true,
    phone_note: "Every day, 9am – 9pm",
    whatsapp_note: "Fastest reply, usually within minutes",
    email_note: "We reply within one working day",
    address_note: "Khulna, near the Sundarbans",
  },
  form: {
    type: "form",
    enabled: true,
    eyebrow: "Send a message",
    title: "Tell us how we can help",
    description: "Fill in the form and send it straight to our team on WhatsApp or by email.",
    topics: ["Order & delivery", "Product question", "Bulk or corporate order", "Feedback", "Something else"],
    whatsapp_label: "Send on WhatsApp",
    email_label: "Send by email",
    note: "We never share your details with anyone.",
  },
  hours: {
    type: "hours",
    enabled: true,
    title: "Opening hours",
    items: [
      { days: "Saturday – Thursday", hours: "9:00 am – 9:00 pm" },
      { days: "Friday", hours: "3:00 pm – 9:00 pm" },
    ],
    note: "Orders placed online are accepted 24/7.",
  },
  social: {
    type: "social",
    enabled: true,
    title: "Follow the harvest",
    text: "Fresh catches, honey season updates and offers — follow us for the latest from the Sundarbans.",
  },
  map: {
    type: "map",
    enabled: false,
    title: "Find us",
    embed_url: "",
    directions_url: "",
  },
  faq: {
    type: "faq",
    enabled: true,
    eyebrow: "Quick answers",
    title: "Frequently asked questions",
    subtitle: "You might find your answer here before you even need to ask.",
    items: [
      {
        question: "How long does delivery take?",
        answer: "Inside Dhaka orders usually arrive in **2–3 working days**, and in **3–5 working days** everywhere else in Bangladesh.",
      },
      {
        question: "How can I track my order?",
        answer: "Use the [order tracking](/track-order) page with your order number and phone number, or see every order in [your account](/account).",
      },
      {
        question: "Which payment methods do you accept?",
        answer: "Cash on delivery and mobile banking (bKash, Nagad and Rocket). You choose at checkout.",
      },
      {
        question: "What if something arrives damaged?",
        answer: "Contact us within 24 hours with a photo of the product and we will replace it or refund you.",
      },
    ],
  },
};

const CONTACT_BLOCKS = Object.keys(DEFAULT_CONTACT) as (keyof ContactContent)[];

export function parseContactContent(sections: PageSection[] | undefined): ContactContent {
  const find = (type: string) => sections?.find((section) => section.type === type);
  const content = Object.fromEntries(CONTACT_BLOCKS.map((key) => [key, merge(DEFAULT_CONTACT[key], find(key))])) as ContactContent;
  return { ...content, form: { ...content.form, topics: content.form.topics.filter((topic) => typeof topic === "string" && topic.trim()) } };
}

/** A Google Maps "Embed a map" link; anything else is not shown in the frame. */
export const isMapEmbed = (url: string) => /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed\?/i.test(url.trim());

/** `ready` turns true once the saved copy has loaded (or failed to), so defaults never flash before edited text. */
export function useContactContent() {
  const { data, isLoading } = usePage("contact");
  const content = useMemo(() => parseContactContent(data?.sections), [data]);

  return { content, page: data, ready: !isLoading };
}

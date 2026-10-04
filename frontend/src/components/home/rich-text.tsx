import Link from "next/link";
import type { ReactNode } from "react";

import { paragraphs } from "@/lib/home-content";
import { cn } from "@/lib/utils";

const TOKEN = /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*/g;

const isSitePath = (href: string) => href.startsWith("/") && !href.startsWith("//") && !href.includes("\\");
const isWebLink = (href: string) => /^https?:\/\/[^\s/]+/i.test(href);

function inline(text: string, linkClassName?: string, strongClassName?: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;

  for (const match of text.matchAll(TOKEN)) {
    const [whole, label, href, bold] = match;
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = match.index;

    if (bold !== undefined) {
      nodes.push(
        <strong key={key} className={strongClassName}>
          {bold}
        </strong>,
      );
    } else if (isSitePath(href)) {
      nodes.push(
        <Link key={key} href={href} className={linkClassName}>
          {label}
        </Link>,
      );
    } else if (isWebLink(href)) {
      nodes.push(
        <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
          {label}
        </a>,
      );
    } else {
      nodes.push(label);
    }
    last = match.index + whole.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type RichTextProps = {
  text: string;
  className?: string;
  linkClassName?: string;
  strongClassName?: string;
};

/** Plain text with `**bold**` and `[label](/path or https://link)`; each line becomes a paragraph. */
export function RichText({ text, className, linkClassName, strongClassName }: RichTextProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {paragraphs(text).map((line, index) => (
        <p key={index}>{inline(line, linkClassName, strongClassName)}</p>
      ))}
    </div>
  );
}

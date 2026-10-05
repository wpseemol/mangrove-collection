"use client";

import { HomeIcon } from "@/components/home/home-icon";
import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomeContent } from "@/lib/home-content";

export function TrustStrip() {
  const { content, ready } = useHomeContent();
  const items = content.trust.items.filter((item) => item.title || item.text);

  if (ready && (!content.trust.enabled || !items.length)) return null;

  return (
    <Container className="mt-6">
      {!ready ? (
        <Skeleton className="h-36 rounded-2xl lg:h-20" />
      ) : (
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-3 bg-card p-4 sm:p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <HomeIcon name={item.icon} className="size-5" strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{item.title}</span>
                <span className="block text-xs text-muted-foreground">{item.text}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

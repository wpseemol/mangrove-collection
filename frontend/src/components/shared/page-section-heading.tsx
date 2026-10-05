import { cn } from "@/lib/utils";

/** Larger centred heading for content pages (About, Contact) where every part is optional. */
export function PageSectionHeading({ eyebrow, title, subtitle, className }: { eyebrow?: string; title?: string; subtitle?: string; className?: string }) {
  if (!eyebrow && !title && !subtitle) return null;
  return (
    <header className={cn("mx-auto mb-12 max-w-2xl text-center", className)}>
      {eyebrow && <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold uppercase">{eyebrow}</p>}
      {title && <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground md:text-4xl">{title}</h2>}
      {subtitle && <p className="mt-4 text-[15px] leading-relaxed text-pretty text-muted-foreground">{subtitle}</p>}
    </header>
  );
}

import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  align = "center",
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: "center" | "left";
  className?: string;
  /** Rendered on the right of a left-aligned heading, e.g. a "View all" link. */
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn(align === "center" && "max-w-2xl")}>
        {eyebrow && <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-gold uppercase">{eyebrow}</p>}
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

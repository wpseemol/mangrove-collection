import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-6 text-center", className)}>
      <h2 className="font-heading text-xl font-medium tracking-[0.12em] text-gray-900 uppercase md:text-2xl">
        {title}
        {children}
      </h2>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
}

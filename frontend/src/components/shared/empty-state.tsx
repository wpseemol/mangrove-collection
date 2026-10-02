import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed bg-surface/60 px-6 py-16 text-center", className)}>
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-white text-primary shadow-sm ring-1 ring-border">
        <Icon className="size-7" strokeWidth={1.6} />
      </div>
      <h3 className="font-heading text-xl font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

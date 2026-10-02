import Link from "next/link";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export function PageBreadcrumb({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <Breadcrumb className={cn("py-5", className)}>
      <BreadcrumbList className="text-xs sm:text-[13px]">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item) => (
          <Fragment key={item.label}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="line-clamp-1 font-medium">{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** Title band shown at the top of inner pages. */
export function PageHeader({
  title,
  description,
  breadcrumb,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  breadcrumb: { label: string; href?: string }[];
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 border-b bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6">
        <PageBreadcrumb items={breadcrumb} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">{title}</h1>
            {description && <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

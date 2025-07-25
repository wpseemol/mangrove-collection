"use client";

import { cn } from "@/lib/utils";

export default function ProductEditContainer({
     children,
     title,
     className,
     id,
}: {
     children: React.ReactNode;
     title: string;
     className?: string;
     id?: string;
}) {
     return (
          <section
               id={id}
               className={cn(
                    "w-full shadow border border-neutral-500/30 rounded mb-4",
                    className
               )}
          >
               <header className="border-b border-neutral-500/30">
                    <h2 className="font-semibold text-3xl md:p-3 p-2">
                         {title}
                    </h2>
               </header>

               <section className="p-1">{children}</section>
          </section>
     );
}

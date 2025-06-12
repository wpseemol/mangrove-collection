"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLink({
     children,
     className,
     href,
}: {
     children: React.ReactNode;
     className?: string;
     href: string;
}) {
     const pathName = usePathname();

     return (
          <Link
               className={`${
                    pathName === href ? "text-primary-foreground" : ""
               } ${className} hover:text-primary-foreground duration-200`}
               href={href}
          >
               {children}
          </Link>
     );
}

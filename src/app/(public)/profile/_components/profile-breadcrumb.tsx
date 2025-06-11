"use client";

import {
     Breadcrumb,
     BreadcrumbItem,
     BreadcrumbLink,
     BreadcrumbList,
     BreadcrumbPage,
     BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";

export default function ProfileBreadcrumb() {
     const pathname = usePathname();
     const pathSegments = pathname ? pathname.split("/").filter(Boolean) : [];

     const breadcrumbItems = [
          { name: "Home", href: "/" },
          ...pathSegments.map((segment, idx) => ({
               name: segment.replace(/-/g, " "),
               href: "/" + pathSegments.slice(0, idx + 1).join("/"),
          })),
     ];

     return (
          <Breadcrumb>
               <BreadcrumbList>
                    {breadcrumbItems.map((item, idx) => (
                         <React.Fragment key={item.href}>
                              <BreadcrumbItem>
                                   {idx === breadcrumbItems.length - 1 ? (
                                        <BreadcrumbPage className="capitalize">
                                             {item.name}
                                        </BreadcrumbPage>
                                   ) : (
                                        <BreadcrumbLink
                                             href={item.href}
                                             className="capitalize"
                                        >
                                             {item.name}
                                        </BreadcrumbLink>
                                   )}
                              </BreadcrumbItem>
                              {idx < breadcrumbItems.length - 1 && (
                                   <BreadcrumbSeparator />
                              )}
                         </React.Fragment>
                    ))}
               </BreadcrumbList>
          </Breadcrumb>
     );
}

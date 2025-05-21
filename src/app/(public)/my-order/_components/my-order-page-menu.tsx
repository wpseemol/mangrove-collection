"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function MyOrderPageMenu() {
     const pathname = usePathname();
     const searchParams = useSearchParams();
     const section = searchParams.get("section");

     return (
          <div className="sticky top-16">
               <h3 className="text-xl font-medium text-neutral-950/90 dark:text-white/90">
                    Manage My Details
               </h3>
               <div className="pl-4 flex flex-col w-full items-start">
                    <Button
                         variant="link"
                         className={`${
                              pathname === "/my-order" && !section
                                   ? "underline font-semibold"
                                   : ""
                         }`}
                    >
                         <Link href="/my-order">My Order</Link>
                    </Button>
               </div>

               <h3 className="text-xl font-medium text-neutral-950/90 dark:text-white/90">
                    My Order
               </h3>
               <div className="pl-4 flex flex-col w-full items-start">
                    <Button
                         variant="link"
                         className={`${
                              section === "address-book"
                                   ? "underline font-semibold"
                                   : ""
                         }`}
                    >
                         <Link href="/my-order?section=address-book">
                              Address Book
                         </Link>
                    </Button>
                    <Button
                         variant="link"
                         className={`${
                              section === "add-new-address"
                                   ? "underline font-semibold"
                                   : ""
                         }`}
                    >
                         <Link href="/my-order?section=add-new-address">
                              Add Address
                         </Link>
                    </Button>
               </div>
          </div>
     );
}

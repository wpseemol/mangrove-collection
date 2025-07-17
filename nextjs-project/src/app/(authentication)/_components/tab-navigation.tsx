"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabNavigation() {
     const pathname = usePathname();

     return (
          <div className="flex bg-gray-100 rounded-lg p-1">
               <Link
                    href="/login"
                    className={`flex-1 py-2 px-4 text-center rounded-md text-sm font-medium transition-colors duration-200 ${
                         pathname === "/login"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                    }`}
               >
                    Sign In
               </Link>
               <Link
                    href="/register"
                    className={`flex-1 py-2 px-4 text-center rounded-md text-sm font-medium transition-colors duration-200 ${
                         pathname === "/register"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                    }`}
               >
                    Sign Up
               </Link>
          </div>
     );
}

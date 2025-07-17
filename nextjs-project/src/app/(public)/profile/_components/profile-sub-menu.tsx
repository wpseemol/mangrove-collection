"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { profileMenuItems } from "./profile-page-menu";

export default function ProfileSubMenu() {
     const pathname = usePathname();

     return (
          <div className="border-b border-gray-200">
               <ul className="flex justify-center items-center gap-2 mb-2">
                    {profileMenuItems.map((menu) => (
                         <li
                              key={menu.id}
                              className={`${
                                   menu.href === pathname
                                        ? "border-primary-foreground"
                                        : "hover:border-primary-foreground border-gray-200"
                              } border duration-200 group px-3 py-1.5 rounded`}
                         >
                              <Link
                                   href={menu.href}
                                   className="flex items-center gap-1"
                              >
                                   {menu.icon}
                                   <h3
                                        className={`${
                                             menu.href === pathname
                                                  ? "text-primary-foreground"
                                                  : "group-hover:text-primary-foreground"
                                        } duration-200`}
                                   >
                                        {menu.title}
                                   </h3>
                              </Link>
                         </li>
                    ))}
               </ul>
          </div>
     );
}

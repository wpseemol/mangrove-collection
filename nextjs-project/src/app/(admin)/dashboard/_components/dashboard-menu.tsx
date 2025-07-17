"use client";

import DashboardLink from "@/components/dashboard-link";
import { JSX } from "react";

import { FaUpload } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";
import { ImProfile } from "react-icons/im";
import { IoSettings } from "react-icons/io5";
import { TbHelpHexagonFilled } from "react-icons/tb";

export default function DashboardMenu({
     isDryerClose,
}: {
     isDryerClose: boolean;
}) {
     return (
          <ul className="">
               {adminMenus.map((menu) => (
                    <li key={menu?.id} className="my-1 mx-auto ">
                         <DashboardLink href={menu?.href}>
                              <p className="flex item-center text-xl gap-3 py-3 px-1">
                                   <span className="text-2xl">
                                        {menu?.icon}{" "}
                                   </span>
                                   <span
                                        className={`${
                                             isDryerClose ? "sm:hidden" : ""
                                        }`}
                                   >
                                        {menu?.name}
                                   </span>
                              </p>
                         </DashboardLink>
                    </li>
               ))}
          </ul>
     );
}

interface MenuArraysType {
     href: string;
     icon: JSX.Element;
     name: string;
     id: number;
}

const adminMenus: MenuArraysType[] = [
     {
          href: "/dashboard/add-product",
          icon: <FaUpload />,
          name: "Add Product",
          id: 1,
     },
     {
          href: "/dashboard/products",
          icon: (
               <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="1.2em"
                    height="1.2em"
               >
                    <path d="M4 7V6a2 2 0 012-2h12a2 2 0 012 2v1h1a1 1 0 011 1v2a1 1 0 01-1 1h-1v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7H3a1 1 0 01-1-1V8a1 1 0 011-1h1zm2 0h12V6H6v1zm0 2v7h12V9H6zm2 2h2v3H8v-3zm4 0h2v3h-2v-3z" />
               </svg>
          ),
          name: "Products",
          id: 2,
     },
     {
          href: "/dashboard/orders",
          icon: (
               <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="1.2em"
                    height="1.2em"
               >
                    <circle cx="9" cy="21" r="1.5" /> {/* Left wheel */}
                    <circle cx="18" cy="21" r="1.5" /> {/* Right wheel */}
                    <path d="M5 6h16l-1.5 9h-13z" /> {/* Cart body */}
                    <rect x="8" y="10" width="2.5" height="2.5" rx="0.5" />{" "}
                    {/* Product box */}
                    <rect
                         x="13"
                         y="10"
                         width="2.5"
                         height="2.5"
                         rx="0.5"
                    />{" "}
                    {/* Product box */}
                    <path d="M7 6V4a1 1 0 011-1h2" /> {/* Handle */}
               </svg>
          ),
          name: "Orders",
          id: 3,
     },
     {
          href: "/dashboard/users",
          icon: <FaUsersGear />,
          name: "Manage All User",
          id: 4,
     },

     {
          href: "/dashboard/profile",
          icon: <ImProfile />,
          name: "Profile",
          id: 5,
     },
     {
          href: "/dashboard/setting",
          icon: <IoSettings />,
          name: "Setting",
          id: 6,
     },
     {
          href: "/dashboard/help",
          icon: <TbHelpHexagonFilled />,
          name: "Help",
          id: 7,
     },
];

"use client";
import { ProfileMenuList } from "@/types/profile";
import { motion } from "framer-motion";
import Link from "next/link";
import {
     FaHeart,
     FaMapMarkerAlt,
     FaShoppingCart,
     FaStar,
     FaUserEdit,
} from "react-icons/fa";

export default function ProfilePagMenu() {
     return (
          <div className="my-5">
               <motion.ul
                    initial="hidden"
                    animate="visible"
                    variants={{
                         hidden: { opacity: 0, y: 20 },
                         visible: {
                              opacity: 1,
                              y: 0,
                              transition: { staggerChildren: 0.1 },
                         },
                    }}
                    className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 "
               >
                    {profileMenuItems.map((item, idx) => (
                         <motion.li
                              key={item.id}
                              initial="hidden"
                              animate="visible"
                              viewport={{ once: true }}
                              variants={{
                                   hidden: { opacity: 0, y: 20 },
                                   visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                             delay: 0.4 + idx * 0.1,
                                             duration: 0.4 + idx * 0.1,
                                        },
                                   },
                              }}
                              className=""
                         >
                              <Link
                                   href={item.href}
                                   className="flex flex-col items-center gap-3 bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-colors hover:bg-gray-50 hover:border-green-700/40
                              group py-10 border border-gray-200"
                              >
                                   {item.icon}
                                   <span className="font-medium text-gray-800 group-hover:text-primary-foreground duration-200">
                                        {item.title}
                                   </span>
                              </Link>
                         </motion.li>
                    ))}
               </motion.ul>
          </div>
     );
}

export const profileMenuItems: ProfileMenuList[] = [
     {
          id: 1,
          title: "Orders",
          icon: <FaShoppingCart className="text-xl text-blue-500" />,
          href: "/profile/orders",
     },
     {
          id: 2,
          title: "Edit Profile",
          icon: <FaUserEdit className="text-xl text-green-500" />,
          href: "/profile/edit-profile",
     },
     {
          id: 3,
          title: "Address",
          icon: <FaMapMarkerAlt className="text-xl text-yellow-500" />,
          href: "/profile/address",
     },
     {
          id: 4,
          title: "WishList",
          icon: <FaHeart className="text-xl text-pink-500" />,
          href: "/profile/wishlist",
     },
     {
          id: 5,
          title: "Points",
          icon: <FaStar className="text-xl text-purple-500" />,
          href: "/profile/points",
     },
];

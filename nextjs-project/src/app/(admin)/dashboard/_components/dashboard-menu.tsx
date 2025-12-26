

"use client";

import { Fragment, JSX, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion"; // Add this import
import DashboardLink from "@/components/dashboard-link";


// Icons remain the same as your original code
import { FaUpload } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";
import { ImProfile } from "react-icons/im";
import { IoSettings } from "react-icons/io5";
import { TbHelpHexagonFilled } from "react-icons/tb";
import { IoIosArrowDown } from "react-icons/io"; // Add arrow up


// Define animation variants for consistent animation patterns
const menuVariants:Variants = {
  hidden: { 
    opacity: 0,
    height: 0,
    y: -10 
  },
  visible: { 
    opacity: 1,
    height: "auto",
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut", // Keep as string or use array syntax
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0,
    height: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const subMenuItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function DashboardMenu({
  isDryerClose,
  actionDryerClose,
}: {
  isDryerClose: boolean;
  actionDryerClose: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // Track which submenus are open
  const [isSubmenuOpen, setIsSubmenuOpen] = useState<boolean>(false);

  const toggleSubmenu = () => {
    setIsSubmenuOpen((prev) => !prev);
  };


  

  return (
    <ul className="">
      {adminMenus.map((menu) => {
        
        
        return (
          <Fragment key={menu.id}>
            {/* Desktop View */}
            <li className="my-1 mx-auto hidden sm:block">
              <div className="relative">

               { !menu?.submenu &&<DashboardLink href={menu.href}>
                  <p className="flex items-center text-xl gap-3 py-3 px-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <span className="text-2xl">{menu?.icon}</span>
                    <span className={`${isDryerClose ? "sm:hidden" : ""}`}>
                      {menu?.name}
                    </span>
                  </p>
                </DashboardLink>}                
                {/* Arrow icon for menus with submenu */}
                {menu.submenu && (
                  <button
                    onClick={() => toggleSubmenu()}
                    className="w-full flex justify-between items-center text-xl  py-3 px-1 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-foreground rounded-lg transition-colors"
                    aria-label={isSubmenuOpen ? "Collapse submenu" : "Expand submenu"}
                  >

                    <p className="flex items-center text-xl gap-3 ">
                    <span className="text-2xl">{menu?.icon}</span>
                    <span className={`${isDryerClose ? "sm:hidden" : ""}`}>
                      {menu?.name}
                    </span>
                  </p>
                    <motion.span
                      animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                         className="text-2xl mr-2"
                    >
                       <IoIosArrowDown />
                    </motion.span>
                  </button>
                )}
              </div>
              
              {/* Animated Submenu */}
              <AnimatePresence>
                {menu.submenu && !isDryerClose && isSubmenuOpen && (
                  <motion.ul
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={menuVariants}
                    className="ml-6 overflow-hidden"
                  >
                    {pagesSubMenu.map((subMenu) => (
                      <motion.li 
                        key={subMenu.id}
                        variants={subMenuItemVariants}
                      >
                        <DashboardLink href={subMenu.href}>
                          <p className="flex items-center text-xl gap-3 py-2 px-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <span className="text-2xl">
                              {subMenu?.icon}
                            </span>
                            <span>
                              {subMenu?.name}
                            </span>
                          </p>
                        </DashboardLink>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>

            {/* Mobile View - Simplified version */}
            <li className="sm:hidden">

              <div className="relative">

               { !menu?.submenu &&<DashboardLink href={menu.href}
               actionClick={() => actionDryerClose(false)}
               >
                  <p className="flex items-center text-xl gap-3 py-3 px-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <span className="text-2xl">{menu?.icon}</span>
                    <span className={`${isDryerClose ? "sm:hidden" : ""}`}>
                      {menu?.name}
                    </span>
                  </p>
                </DashboardLink>}                
                {/* Arrow icon for menus with submenu */}
                {menu.submenu && (
                  <button
                    onClick={() => toggleSubmenu()}
                    className="w-full flex justify-between items-center text-xl  py-3 px-1 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-foreground rounded-lg transition-colors"
                    aria-label={isSubmenuOpen ? "Collapse submenu" : "Expand submenu"}
                  >

                    <p className="flex items-center text-xl gap-3 ">
                    <span className="text-2xl">{menu?.icon}</span>
                    <span className={`${isDryerClose ? "sm:hidden" : ""}`}>
                      {menu?.name}
                    </span>
                  </p>
                    <motion.span
                      animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                         className="text-2xl mr-2"
                    >
                       <IoIosArrowDown />
                    </motion.span>
                  </button>
                )}
              </div>
              
              {/* Animated Submenu */}
              <AnimatePresence>
                {menu.submenu && isDryerClose && isSubmenuOpen && (
                  <motion.ul
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={menuVariants}
                    className="ml-6"
                  >
                    {pagesSubMenu.map((subMenu) => (
                      <motion.li 
                        key={subMenu.id}
                        variants={subMenuItemVariants}
                      >
                        <DashboardLink href={subMenu.href}
                       
                        actionClick={() => actionDryerClose(false)}
                        >
                          <p className="flex items-center text-xl gap-3 py-2 px-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <span className="text-2xl">
                              {subMenu?.icon}
                            </span>
                            <span>
                              {subMenu?.name}
                            </span>
                          </p>
                        </DashboardLink>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence> 

             

             
            </li>
          </Fragment>
        );
      })}
    </ul>
  );
}

interface MenuArraysType {
     href: string;
     icon: JSX.Element;
     name: string;
     id: number;
     submenu?: boolean;
}

const adminMenus: MenuArraysType[] = [
     {
          href: "/dashboard/add-product",
          icon: <FaUpload />,
          name: "Add Product/Category",
          id: 1,
     },
     {
          href: "/dashboard/categories",
          icon: (
               <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="1.2em"
                    height="1.2em"
               >
                    <path d="M4 4h6v6H4V4zm0 10h6v6H4v-6zm10-10h6v6h-6V4zm0 10h6v6h-6v-6z" />
               </svg>
          ),
          name: "Categories",
          id: 2,
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
          id: 3,
     },
     {
          href: "/dashboard/pages",
          icon: <svg
               xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 24 24"
               fill="currentColor"
               width="1.2em"
               height="1.2em"
          >
               <path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h16V4H4zm2 2h12v2H6V6zm0 4h12v2H6v-2zm0 4h8v2H6v-2z" />
          </svg>,
          name: "Pages",
          id: 4,
          submenu: true,
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
          id: 5,
     },
     {
          href: "/dashboard/users",
          icon: <FaUsersGear />,
          name: "Manage All User",
          id: 6,
     },
     {
          href: "/dashboard/media",
          icon: (<svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="1.2em"
            height="1.2em"
          >
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>),
          
          name: "Media",
          id: 7,
     },

     {
          href: "/dashboard/profile",
          icon: <ImProfile />,
          name: "Profile",
          id: 8,
     },
     {
          href: "/dashboard/setting",
          icon: <IoSettings />,
          name: "Setting",
          id: 9,
     },
     {
          href: "/dashboard/help",
          icon: <TbHelpHexagonFilled />,
          name: "Help",
          id: 10,
     },
];



const pagesSubMenu: MenuArraysType[] = [
  {
    href: "/dashboard/pages/home", 
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="1.2em"
        height="1.2em"
      >
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
    name: "Home",
    id: 1,
  },
  {
    href: "/dashboard/pages/about", 
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="1.2em"
        height="1.2em"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
    name: "About",
    id: 2,
  },
  {
    href: "/dashboard/pages/contact", 
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="1.2em"
        height="1.2em"
      >
        <path d="M20 8l-8 5-8-5V6l8 5 8-5v2zm0-2H4v10h16V6z" />
      </svg>
    ),
    name: "Contact",
    id: 3,
  },
];
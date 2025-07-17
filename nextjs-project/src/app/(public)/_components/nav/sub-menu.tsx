"use client";

import { AnimatePresence, motion } from "framer-motion"; // Import Framer Motion
import { useState } from "react";
import { MenuItem } from "./nav-menu";

export default function SubMenu({
     menuItem,
     SubMenuContent,
}: {
     menuItem: MenuItem;
     SubMenuContent: React.ReactNode;
}) {
     const [menuShow, setMenuShow] = useState<boolean>(false);
     const [isHover, setIsHover] = useState<boolean>(false);

     function handleSubMenu() {
          setMenuShow(!menuShow);
     }

     return (
          <>
               <button
                    onClick={handleSubMenu}
                    className="md:hidden block w-full text-left px-2 md:px-0"
               >
                    {menuItem.label}
               </button>

               {/* full schreen view button on hover */}
               <button
                    onMouseEnter={() => setIsHover(true)}
                    onMouseLeave={() => setIsHover(false)}
                    className="md:block hidden md:py-3 p-2"
               >
                    {menuItem.label}
               </button>

               <AnimatePresence>
                    {/* mobile view */}
                    {menuShow && (
                         <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.35, ease: "easeInOut" }}
                              style={{ overflow: "hidden" }}
                              className="block md:hidden mt-2"
                         >
                              {SubMenuContent}
                         </motion.div>
                    )}
               </AnimatePresence>

               <AnimatePresence>
                    {/* desktop view */}
                    {isHover && (
                         <motion.div
                              onMouseEnter={() => setIsHover(true)}
                              onMouseLeave={() => setIsHover(false)}
                              initial={{ opacity: 0, y: -10, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: "auto" }}
                              exit={{ opacity: 0, y: -10, height: 0 }}
                              className="absolute top-[95%] left-0 bg-white min-w-64 rounded-lg overflow-hidden z-40 hidden md:block shadow-2xl"
                         >
                              {SubMenuContent}
                         </motion.div>
                    )}
               </AnimatePresence>
          </>
     );
}

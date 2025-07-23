"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function SearchBtn({ children }: { children: React.ReactNode }) {
     const [menuShow, setMenuShow] = useState<boolean>(false);

     return (
          <li className="">
               <div
                    className={`text-primaryColor text-2xl`}
                    onClick={() => setMenuShow(!menuShow)}
               >
                    <FaMagnifyingGlass className="text-white" />
               </div>
               {menuShow && (
                    <AnimatePresence>
                         <div>
                              {/* Overlay with animation */}
                              <motion.div
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   exit={{ opacity: 0 }}
                                   onClick={() => setMenuShow(!menuShow)}
                                   className="absolute top-0 left-0 w-full h-screen z-[5] bg-black/25 flex justify-center"
                              ></motion.div>

                              {/* Menu container with animation */}
                              <motion.ul
                                   initial={{ y: -20, opacity: 0 }}
                                   animate={{ y: 0, opacity: 1 }}
                                   exit={{ y: -20, opacity: 0 }}
                                   transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                   }}
                                   className="absolute top-0 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-1rem)]"
                              >
                                   {/* Animated search field */}
                                   <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                   >
                                        {children}
                                   </motion.div>
                              </motion.ul>
                         </div>
                    </AnimatePresence>
               )}
          </li>
     );
}

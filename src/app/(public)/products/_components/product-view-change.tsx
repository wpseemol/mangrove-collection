"use client";

import { getCategoryNameFromSlug } from "@/lib/server/category";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaListUl } from "react-icons/fa6";
import { SlGrid } from "react-icons/sl";

export default function ProductViewChange({
     children,
     listViewCard,
     isEmpty,
}: {
     children: React.ReactNode;
     listViewCard: React.ReactNode;
     isEmpty: boolean;
}) {
     const [isGridView, setIsGridView] = useState("gird");

     useEffect(() => {
          const isCardView = sessionStorage.getItem("card-view");

          if (isCardView) {
               setIsGridView(isCardView);
          }
     }, []);

     const searchParams = useSearchParams();
     const categoryParams = searchParams.get("category");
     const priceParams = searchParams.get("price");
     const sizeParams = searchParams.get("size");

     const [categoryName, setCategoryName] = useState<string>("");

     useEffect(() => {
          if (categoryParams) {
               const categorySlug = decodeURI(categoryParams).split("|");

               getCategoryName(categorySlug);
          }

          async function getCategoryName(slugArray: string[]) {
               const categoryNameArray = await getCategoryNameFromSlug(
                    slugArray
               );
               const categoryName = categoryNameArray.join(",");
               setCategoryName(categoryName);
          }
     }, [categoryParams]);

     let filterMessage = "Products show in";

     if (categoryParams) {
          filterMessage += ` category <b class='capitalize'> ${categoryName.toLowerCase()}</b>`;
     }
     if (priceParams) {
          filterMessage += ` price <b>${priceParams}</b>`;
     }
     if (sizeParams) {
          filterMessage += ` size <b>${sizeParams}</b>`;
     }
     filterMessage += `.`;

     let emptyMessage = "No products available in";

     if (categoryParams) {
          emptyMessage += ` category <b class='capitalize'>${categoryName.toLowerCase()}</b>`;
     }
     if (priceParams) {
          emptyMessage += ` price <b>${priceParams}</b>`;
     }
     if (sizeParams) {
          emptyMessage += ` size <b>${sizeParams}</b>`;
     }
     emptyMessage += `.`;

     return (
          <section className="col-span-4">
               {/* grid button */}
               <div className="border-b w-full flex gap-2 items-center pb-3">
                    <button
                         title="Grid view"
                         onClick={() => {
                              setIsGridView("gird");
                              sessionStorage.removeItem("card-view");
                         }}
                         className={`${
                              isGridView === "gird"
                                   ? "bg-primary hover:bg-primary-foreground text-neutral-100"
                                   : "hover:bg-slate-200/80"
                         } border p-2 text-nowrap rounded-sm duration-150`}
                    >
                         <SlGrid />
                    </button>
                    <button
                         title="List view"
                         onClick={() => {
                              setIsGridView("list");
                              sessionStorage.setItem("card-view", "list");
                         }}
                         className={`${
                              isGridView === "list"
                                   ? "bg-primary hover:bg-primary-foreground text-neutral-100"
                                   : "hover:bg-slate-200/80"
                         } border p-2 text-nowrap rounded-sm duration-150`}
                    >
                         <FaListUl />
                    </button>
               </div>
               {/* grid button end */}

               {/* filst title section here */}
               {!isEmpty && (
                    <AnimatePresence>
                         {(categoryParams || priceParams || sizeParams) && (
                              <motion.div
                                   initial={{ x: 100, opacity: 0 }}
                                   animate={{ x: 0, opacity: 1 }}
                                   transition={{ duration: 0.5 }}
                                   dangerouslySetInnerHTML={{
                                        __html: filterMessage,
                                   }}
                              ></motion.div>
                         )}
                    </AnimatePresence>
               )}
               {/* filst title section here */}

               {/* empty cart here */}
               <AnimatePresence>
                    {isEmpty && (
                         <motion.div
                              key="empty-products"
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={pageVariants}
                              className="flex flex-col items-center justify-center min-h-[500px] text-center p-8"
                         >
                              <motion.div
                                   className="mb-6 text-6xl"
                                   animate={{
                                        rotate: [0, 15, -15, 0],
                                        transition: {
                                             duration: 3,
                                             repeat: Infinity,
                                             ease: "easeInOut",
                                        },
                                   }}
                              >
                                   📦
                              </motion.div>

                              <motion.h2 className="mb-2 text-2xl font-bold text-gray-800">
                                   No Products Found
                              </motion.h2>

                              <motion.p className="mb-8 text-gray-600">
                                   {categoryParams ||
                                   priceParams ||
                                   sizeParams ? (
                                        <>
                                             <span
                                                  initial={{
                                                       x: 100,
                                                       opacity: 0,
                                                  }}
                                                  animate={{ x: 0, opacity: 1 }}
                                                  transition={{ duration: 0.5 }}
                                                  dangerouslySetInnerHTML={{
                                                       __html: filterMessage,
                                                  }}
                                             ></span>
                                        </>
                                   ) : (
                                        "No products found"
                                   )}
                              </motion.p>
                         </motion.div>
                    )}
               </AnimatePresence>
               {/* empty cart here */}
               {/* grid view cart show here */}
               <AnimatePresence>
                    {isGridView === "gird" && (
                         <motion.div
                              key="grid"
                              initial="hidden"
                              animate="visible"
                              exit={{ opacity: 0 }}
                              variants={gridViewVariants}
                              className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 print:mt-4 print:sm:grid-cols-5 print:gap-1 mt-4"
                         >
                              {React.Children.map(children, (child) => (
                                   <motion.div variants={itemVariants} layout>
                                        {child}
                                   </motion.div>
                              ))}
                         </motion.div>
                    )}
               </AnimatePresence>
               {/* grid view cart show here */}
               {/* list view cart show here */}
               <AnimatePresence>
                    {isGridView === "list" && (
                         <motion.div
                              key="list"
                              initial="hidden"
                              animate="visible"
                              exit={{ opacity: 0 }}
                              variants={listViewVariants}
                              className="space-y-4 mt-4"
                         >
                              {React.Children.map(listViewCard, (child) => (
                                   <motion.div variants={itemVariants} layout>
                                        {child}
                                   </motion.div>
                              ))}
                         </motion.div>
                    )}
               </AnimatePresence>
               {/* list view cart show here */}
          </section>
     );
}

const gridViewVariants = {
     hidden: { opacity: 0 },
     visible: {
          opacity: 1,
          transition: { staggerChildren: 0.02, delayChildren: 0.1 },
     },
};

const listViewVariants = {
     hidden: { opacity: 0 },
     visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
     hidden: { opacity: 0, y: 20 },
     visible: { opacity: 1, y: 0 },
};

const emptyCartVariants = {
     hidden: { opacity: 0 },
     visible: {
          opacity: 1,
          transition: {
               delayChildren: 0.3,
               staggerChildren: 0.2,
          },
     },
};

const itemVariantsEmptCart = {
     hidden: { y: 20, opacity: 0 },
     visible: { y: 0, opacity: 1 },
};

const pageVariants = {
     hidden: { opacity: 0, y: 20 },
     visible: { opacity: 1, y: 0 },
     exit: { opacity: 0, y: -20 },
};

const sentenceVariants = {
     hidden: { opacity: 1 },
     visible: {
          opacity: 1,
          transition: {
               staggerChildren: 0.08,
          },
     },
};

const letterVariants = {
     hidden: { x: 50, opacity: 0 },
     visible: {
          x: 0,
          opacity: 1,
          transition: { type: "spring", stiffness: 120 },
     },
};

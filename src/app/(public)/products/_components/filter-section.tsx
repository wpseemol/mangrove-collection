"use client";
import { Button } from "@/components/ui/button";
import { CategoryWithCount, getCategoryWithCount } from "@/lib/server/category";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaFilter, FaFilterCircleXmark } from "react-icons/fa6";
import useFilterSection from "./use-filter-section";

export default function FilterSection({
     categoryWithCount,
}: {
     categoryWithCount: CategoryWithCount[];
}) {
     const [categoryWithCountArray, setCategoryWithCountArray] =
          useState<CategoryWithCount[]>(categoryWithCount);

     const [isShow, setIsShow] = useState<boolean>(false);
     const [loading, setLoading] = useState<boolean>(false);

     const [filterShow, setFilterShow] = useState<boolean>(true);

     async function handelShow() {
          setLoading(true);
          try {
               setIsShow((prev) => !prev);
               const data = await getCategoryWithCount(isShow ? 5 : "ALL");
               setCategoryWithCountArray(data);
          } catch (error) {
               console.error("handel count error:", error);
          } finally {
               setLoading(false);
          }
     }

     useEffect(() => {
          const checkMobile = () => setFilterShow(window.innerWidth > 768);
          checkMobile();
          window.addEventListener("resize", checkMobile);
          return () => window.removeEventListener("resize", checkMobile);
     }, []);

     const {
          handelChange,
          selectCategory,
          selectPrice,
          size,
          clickToRemoveSize,
     } = useFilterSection();

     return (
          <div>
               <Button
                    className="md:hidden block w-fit text-white"
                    onClick={() => setFilterShow((prev) => !prev)}
               >
                    <motion.span
                         key={filterShow ? "close" : "open"}
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         exit={{ scale: 0 }}
                    >
                         {filterShow ? <FaFilterCircleXmark /> : <FaFilter />}
                    </motion.span>
               </Button>

               <AnimatePresence mode="popLayout">
                    {filterShow && (
                         <motion.div
                              initial={{
                                   opacity: 0,
                                   height: 0,
                                   scale: 0.95,
                              }}
                              animate={{
                                   opacity: 1,
                                   height: "auto",
                                   scale: 1,
                              }}
                              exit={{ opacity: 0, height: 0, scale: 0.95 }}
                              transition={{
                                   duration: 0.3,
                                   ease: "easeInOut",
                              }}
                              className={`col-span-1 content-center bg-white dark:bg-transparent dark:text-neutral-200 px-4 pb-6 shadow rounded overflow-hidden md:w-fit w-full mx-auto inline-block ${
                                   filterShow ? "" : "hidden"
                              } md:sticky top-28`}
                         >
                              <motion.div
                                   variants={containerVariants}
                                   initial="hidden"
                                   animate="show"
                                   className="divide-y divide-gray-200 space-y-5"
                              >
                                   {/* Categories Section */}
                                   <div>
                                        <h3 className="text-xl text-gray-800 dark:text-neutral-200 mb-3 uppercase font-medium">
                                             Categories
                                        </h3>
                                        <motion.div className="space-y-2">
                                             <AnimatePresence>
                                                  {categoryWithCountArray?.map(
                                                       (category) => {
                                                            const {
                                                                 id,
                                                                 name,
                                                                 slug,
                                                                 productCount,
                                                            } = category;
                                                            return (
                                                                 <motion.div
                                                                      key={id}
                                                                      variants={
                                                                           itemVariants
                                                                      }
                                                                      layout
                                                                      transition={{
                                                                           duration: 0.2,
                                                                      }}
                                                                      className="flex items-center capitalize"
                                                                 >
                                                                      <motion.input
                                                                           onChange={(
                                                                                event
                                                                           ) =>
                                                                                handelChange(
                                                                                     event,
                                                                                     "categories"
                                                                                )
                                                                           }
                                                                           checked={selectCategory?.includes(
                                                                                slug
                                                                           )}
                                                                           type="checkbox"
                                                                           name={
                                                                                slug
                                                                           }
                                                                           id={
                                                                                slug
                                                                           }
                                                                           className="text-primary focus:ring-0 rounded-sm cursor-pointer"
                                                                           whileHover={{
                                                                                scale: 1.05,
                                                                           }}
                                                                      />
                                                                      <label
                                                                           htmlFor={
                                                                                slug
                                                                           }
                                                                           className="text-gray-600 dark:text-neutral-300 ml-3 cursor-pointer"
                                                                      >
                                                                           <motion.span className="capitalize">
                                                                                {name?.toLowerCase()}
                                                                           </motion.span>
                                                                      </label>
                                                                      <motion.div className="ml-auto text-gray-600 dark:text-neutral-300 text-sm">
                                                                           (
                                                                           {
                                                                                productCount
                                                                           }
                                                                           )
                                                                      </motion.div>
                                                                 </motion.div>
                                                            );
                                                       }
                                                  )}
                                             </AnimatePresence>

                                             <Button
                                                  disabled={loading}
                                                  size="sm"
                                                  variant="ghost"
                                                  className={`border border-neutral-600/60 w-full ${
                                                       loading
                                                            ? "cursor-not-allowed"
                                                            : "cursor-pointer"
                                                  }`}
                                                  onClick={handelShow}
                                             >
                                                  <motion.span
                                                       key={
                                                            isShow
                                                                 ? "less"
                                                                 : "more"
                                                       }
                                                       initial={{
                                                            opacity: 0,
                                                       }}
                                                       animate={{
                                                            opacity: 1,
                                                       }}
                                                       exit={{
                                                            opacity: 0,
                                                       }}
                                                  >
                                                       {loading ? (
                                                            <motion.span
                                                                 animate={{
                                                                      rotate: 360,
                                                                 }}
                                                                 transition={{
                                                                      repeat: Infinity,
                                                                      duration: 1,
                                                                 }}
                                                            >
                                                                 ⏳
                                                            </motion.span>
                                                       ) : isShow ? (
                                                            "See less.."
                                                       ) : (
                                                            "See more..."
                                                       )}
                                                  </motion.span>
                                             </Button>
                                        </motion.div>
                                   </div>

                                   {/* Price Section */}
                                   <motion.div
                                        variants={itemVariants}
                                        className="pt-4"
                                   >
                                        <h3 className="text-xl text-gray-800 dark:text-neutral-200 mb-3 uppercase font-medium">
                                             Price
                                        </h3>
                                        <motion.div
                                             className="mt-4 flex items-center"
                                             initial={{ opacity: 0 }}
                                             animate={{ opacity: 1 }}
                                        >
                                             {/* Price inputs with hover effects */}
                                             <motion.input
                                                  whileHover={{
                                                       scale: 1.02,
                                                  }}
                                                  onChange={(event) =>
                                                       handelChange(
                                                            event,
                                                            "price"
                                                       )
                                                  }
                                                  defaultValue={selectPrice.min}
                                                  type="number"
                                                  name="min"
                                                  id="min"
                                                  className="w-full border-gray-300 focus:border-primary rounded focus:ring-0 px-3 py-1 text-gray-600 shadow-sm dark:text-neutral-300"
                                                  placeholder="min"
                                             />
                                             <span className="mx-3 text-gray-500">
                                                  -
                                             </span>
                                             <motion.input
                                                  whileHover={{
                                                       scale: 1.02,
                                                  }}
                                                  onChange={(event) =>
                                                       handelChange(
                                                            event,
                                                            "price"
                                                       )
                                                  }
                                                  defaultValue={selectPrice.max}
                                                  type="number"
                                                  name="max"
                                                  id="max"
                                                  className="w-full border-gray-300 focus:border-primary rounded focus:ring-0 px-3 py-1 text-gray-600 shadow-sm dark:text-neutral-300"
                                                  placeholder="max"
                                             />
                                        </motion.div>
                                   </motion.div>

                                   {/* Size Section */}
                                   <motion.div
                                        variants={itemVariants}
                                        className="pt-4"
                                   >
                                        <h3 className="text-xl text-gray-800 dark:text-neutral-200 mb-3 uppercase font-medium">
                                             Size
                                        </h3>
                                        <motion.div
                                             className="flex items-center gap-2"
                                             initial="hidden"
                                             animate="show"
                                             variants={{
                                                  hidden: { opacity: 0 },
                                                  show: {
                                                       opacity: 1,
                                                       transition: {
                                                            staggerChildren: 0.05,
                                                       },
                                                  },
                                             }}
                                        >
                                             {sizeArray.map((name) => (
                                                  <motion.div
                                                       key={name}
                                                       variants={{
                                                            hidden: {
                                                                 scale: 0.8,
                                                                 opacity: 0,
                                                            },
                                                            show: {
                                                                 scale: 1,
                                                                 opacity: 1,
                                                            },
                                                       }}
                                                       whileHover={{
                                                            scale: 1.1,
                                                       }}
                                                       whileTap={{
                                                            scale: 0.9,
                                                       }}
                                                  >
                                                       <input
                                                            onChange={(event) =>
                                                                 handelChange(
                                                                      event,
                                                                      "size"
                                                                 )
                                                            }
                                                            type="radio"
                                                            checked={
                                                                 size === name
                                                            }
                                                            name="size"
                                                            id={`size-${name}`}
                                                            value={name}
                                                            className="hidden"
                                                       />
                                                       <label
                                                            title={
                                                                 size === name
                                                                      ? "Click to remove size from filter."
                                                                      : ""
                                                            }
                                                            onClick={() => {
                                                                 if (
                                                                      size ===
                                                                      name
                                                                 )
                                                                      clickToRemoveSize(
                                                                           size
                                                                      );
                                                            }}
                                                            htmlFor={`size-${name}`}
                                                            className={`${
                                                                 size === name
                                                                      ? "bg-primary-foreground text-neutral-100"
                                                                      : ""
                                                            } text-xs border border-gray-200 rounded-sm h-6 w-6 flex items-center justify-center cursor-pointer shadow-sm text-gray-600 uppercase checked:bg-primary-foreground dark:text-neutral-300`}
                                                            style={{
                                                                 backgroundColor:
                                                                      size ===
                                                                      name
                                                                           ? "#yourSelectedColor"
                                                                           : "",
                                                                 transition:
                                                                      "background-color 0.3s ease",
                                                            }}
                                                       >
                                                            {name}
                                                       </label>
                                                  </motion.div>
                                             ))}
                                        </motion.div>
                                   </motion.div>
                              </motion.div>
                         </motion.div>
                    )}
               </AnimatePresence>
          </div>
     );
}

/**
 * `sizeArray` ['xs', 's', 'm', 'l', 'xl']
 */
export const sizeArray: string[] = ["xs", "s", "m", "l", "xl"];

// Add animation variants
const containerVariants = {
     hidden: { opacity: 0 },
     show: {
          opacity: 1,
          transition: {
               staggerChildren: 0.1,
               delayChildren: 0.2,
          },
     },
};

const itemVariants = {
     hidden: { opacity: 0, y: 10 },
     show: { opacity: 1, y: 0 },
};

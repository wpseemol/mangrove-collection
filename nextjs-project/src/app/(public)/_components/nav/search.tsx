"use client";
import { CurrencyIcon } from "@/components/currency-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProductBySearch } from "@/lib/actions/products";
import debounce from "@/utils/debounce";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

export function Search() {
     const searchParamsInstance = useSearchParams();
     const router = useRouter();
     const searchParams = new URLSearchParams(searchParamsInstance);
     const [isShowSearchItem, setIsShowSearchItem] = useState<boolean>(false);
     const [searchValue, setSearchValue] = useState<string>("");
     const [searchProducts, setSearchProducts] =
          useState<SearchProductType[]>(null);
     const [loading, setLoading] = useState<boolean>(false);

     function handleSubmit(event: FormEvent<HTMLFormElement>) {
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);
          const query = formData.get("search") as string;
          const encodedQuery = encodeURIComponent(query.trim());

          if (encodedQuery) {
               searchParams.set("search", encodedQuery);
               router.push(`/products?${searchParams.toString()}`);
          } else {
               searchParams.delete("search");
          }
     }

     async function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
          setLoading(true);
          const inputValue = event.target.value;
          setSearchValue(inputValue);
          const delayDebounce = debounce(async (searchQuery: string) => {
               const response = await getProductBySearch(searchQuery);
               if (response.success && response?.data) {
                    const productArray = JSON.parse(
                         response.data
                    ) as SearchProductType[];
                    setSearchProducts(
                         productArray.length > 0 ? productArray : null
                    );
               }
               setLoading(false);
          }, 300);

          delayDebounce(inputValue);
     }

     return (
          <li className="relative">
               <div className=" 2xl:w-[24.5rem] xl:w-[21.5rem] md:w-[12.5rem] sm:w-[22rem] w-[16rem] md:mt-0 mt-6  relative">
                    <form onSubmit={handleSubmit}>
                         <Input
                              onChange={handleInput}
                              onFocus={() => {
                                   setIsShowSearchItem(true);
                              }}
                              onBlur={() => {
                                   setIsShowSearchItem(false);
                              }}
                              type="text"
                              name="search"
                              id="search"
                              className="w-full border-white border placeholder:text-muted-foreground py-2 pl-3 focus:text-primary-foreground rounded font-medium outline-none text-base rounded-r-2xl text-white"
                              placeholder="Search"
                         />
                         <Button
                              type="submit"
                              className="absolute top-0 z-10 -right-0.5 text-white hover:text-primary-foreground hover:bg-primary md:text-2xl text-xl hidden sm:block disabled:cursor-not-allowed "
                         >
                              <FaMagnifyingGlass />
                         </Button>
                    </form>
               </div>
               <AnimatePresence>
                    {/*  */}
                    {searchValue && isShowSearchItem && (
                         <motion.section
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full mt-2 left-0 min-w-full bg-neutral-100 rounded shadow-lg z-50 p-4 min-h-10"
                         >
                              {/* Your search results content here */}
                              <div className="p-3">
                                   <p className="text-neutral-800">
                                        Search results for: {searchValue}
                                   </p>
                              </div>

                              {/* Add your actual search results components */}

                              {searchProducts && searchProducts.length > 0 && (
                                   <div className="grid grid-cols-3  gap-x-1 gap-y-1.5 mt-2">
                                        {searchProducts.map((product) => (
                                             <SearchProductCart
                                                  key={product.id}
                                                  productDetails={product}
                                             />
                                        ))}
                                   </div>
                              )}

                              {loading && (
                                   <div className="flex justify-center items-center min-h-20">
                                        Searching...
                                   </div>
                              )}
                         </motion.section>
                    )}
               </AnimatePresence>
          </li>
     );
}

function SearchProductCart({
     productDetails,
}: {
     productDetails: SearchProductType;
}) {
     return (
          <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               whileHover={{ scale: 1.03 }}
               whileTap={{ scale: 0.98 }}
               transition={{ duration: 0.3, ease: "easeOut" }}
               className="bg-neutral-200 rounded-xl overflow-hidden"
          >
               <Link
                    href={`/products/${productDetails.slug}`}
                    className="flex items-center flex-col py-3 gap-y-1.5"
               >
                    <motion.figure
                         className="rounded overflow-hidden"
                         whileHover={{ scale: 1.02 }}
                         transition={{ duration: 0.2 }}
                    >
                         <Image
                              src={productDetails.thumbnail}
                              width={80}
                              height={80}
                              alt={productDetails.name}
                              className="object-cover"
                         />
                    </motion.figure>

                    <motion.h3
                         className="text-center px-2"
                         whileHover={{ color: "green" }} // blue-500
                    >
                         {productDetails.name}
                    </motion.h3>

                    <motion.p
                         className="flex items-center gap-1"
                         whileHover={{ scale: 1.05 }}
                    >
                         {productDetails.price.toFixed(2)}
                         <CurrencyIcon currency={productDetails.currency} />
                    </motion.p>
               </Link>
          </motion.div>
     );
}

interface SearchProductType {
     id: string;
     name: string;
     slug: string;
     thumbnail: string;
     price: number;
     currency: string;
}

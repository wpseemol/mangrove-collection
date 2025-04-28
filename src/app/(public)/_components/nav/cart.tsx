import CustomLink from "@/components/custom-link";
import { getCartData } from "@/lib/server/cart";
import { FaCartFlatbed } from "react-icons/fa6";
import CartCount from "./card-item-count";

export async function Cart() {
     const data = await getCartData();
     return (
          <li className="text-white group">
               {" "}
               <CustomLink href="/cart">
                    <div
                         className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1
                hover:text-primary-foreground duration-150 group"
                    >
                         <div className="text-primary-foreground xl:text-3xl md:text-2xl text-xl group-hover:scale-125 duration-200">
                              <FaCartFlatbed />
                         </div>
                         <div>
                              <h2 className="sm:text-lg text-sm font-medium duration-150 group-hover:text-primary-foreground">
                                   Cart
                                   <CartCount data={data} />
                              </h2>
                              <p className="text-sm hidden md:block text-muted dark:text-neutral-300/90 group-hover:text-primary-foreground duration-150">
                                   Add items
                              </p>
                         </div>
                    </div>
               </CustomLink>{" "}
          </li>
     );
}

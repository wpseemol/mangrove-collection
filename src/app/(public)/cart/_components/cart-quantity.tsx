import { Button } from "@/components/ui/button";
import { useCartProducts } from "@/hooks";
import { CartProductsType, cartQuantityUpdate } from "@/lib/server/cart";
import debounce from "@/utils/debounce";
import { Row } from "@tanstack/react-table";

export default function CartQuantity({ row }: { row: Row<CartProductsType> }) {
     const { setCartProducts } = useCartProducts();
     const quantity = row.original.quantity;

     const productId = row.original.id;

     /**
      * set debounce function
      */
     const debouncedUpdateQuantity = debounce(
          async (id: string, updateQuantity: number) => {
               try {
                    await cartQuantityUpdate(id, updateQuantity);
               } catch (error) {
                    console.log("Purchus Patch error:", error);
               }
          },
          350
     );

     const decrease = () => {
          if (quantity > 1) {
               const updateQuantity = quantity - 1;
               setCartProducts((prevData) => {
                    if (!prevData) return null;
                    return prevData.map((item) =>
                         item.id === productId
                              ? { ...item, quantity: updateQuantity }
                              : item
                    );
               });

               debouncedUpdateQuantity(productId, updateQuantity);
          }
     };

     const increase = () => {
          const updateQuantity = quantity + 1;
          setCartProducts((prevData) => {
               if (!prevData) return null;
               return prevData.map((item) =>
                    item.id === productId
                         ? { ...item, quantity: updateQuantity }
                         : item
               );
          });

          debouncedUpdateQuantity(productId, updateQuantity);
     };

     return (
          <div className="font-medium w-fit flex items-center space-x-4 border-t border-b border-neutral-700/10 rounded-lg ml-auto">
               <Button
                    disabled={!(quantity > 1)}
                    onClick={decrease}
                    className="text-white"
               >
                    <svg
                         className="w-4 h-4 text-white"
                         aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg"
                         width="24"
                         height="24"
                         fill="none"
                         viewBox="0 0 24 24"
                    >
                         <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 12h14"
                         />
                    </svg>
               </Button>
               <span>{quantity}</span>

               <Button onClick={increase} className="">
                    <svg
                         className="w-4 h-4 text-white"
                         aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg"
                         width="24"
                         height="24"
                         fill="none"
                         viewBox="0 0 24 24"
                    >
                         <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 12h14m-7 7V5"
                         />
                    </svg>
               </Button>
          </div>
     );
}

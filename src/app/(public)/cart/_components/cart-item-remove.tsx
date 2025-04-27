import { useCart, useCartProducts } from "@/hooks";
import { cartProductDelete } from "@/lib/server/cart";
import { Row } from "@tanstack/react-table";
import { notFound } from "next/navigation";
import { FaTrash } from "react-icons/fa6";
import { CartProductsType } from "./cart-product-table";

export default function CartItemRemove({
     row,
}: {
     row: Row<CartProductsType>;
}) {
     const { setCartProducts } = useCartProducts();
     const { setCart } = useCart();

     const productId = row.original.id;
     async function handelRemove() {
          setCartProducts((prevData) => {
               if (!prevData) return null;
               const removeProduct = prevData.filter(
                    (item) => ![productId].includes(item.id)
               );

               if (removeProduct.length > 0) {
                    return removeProduct;
               }
               /**
                * If no products left, set cartProducts to null
                * to trigger the notFound() in the parent component
                */
               notFound();
               return null;
          });

          setCart((prev) => {
               const removeProduct = prev.cartProductIds.filter(
                    (item) => ![productId].includes(item)
               );
               const cartCount = removeProduct.length;
               return {
                    cartCount,
                    cartProductIds: removeProduct,
               };
          });

          try {
               await cartProductDelete(productId);
          } catch (error) {
               console.error("Cart DELETE error:", error);
          }
     }

     return (
          <div className="text-right font-medium pr-12">
               <button onClick={handelRemove} className="">
                    <FaTrash className="text-red-600/80 group-hover:scale-125 duration-200" />
               </button>
          </div>
     );
}

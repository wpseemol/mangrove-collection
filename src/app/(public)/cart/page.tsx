import { getCartProductDetails } from "@/lib/server/cart";
import { notFound } from "next/navigation";
import CartItems from "./_components/cart-items";
import CartProductsProvider from "./_components/cart-products-provider";

export const dynamic = "force-dynamic";

export default async function CartPage() {
     const cartProducts = await getCartProductDetails();
     if (!cartProducts || cartProducts.length < 1) {
          notFound();
     }
     return (
          <main className="container mx-auto min-h-[calc(100vh-25.45rem)] flex flex-col justify-center">
               <CartProductsProvider>
                    <CartItems data={cartProducts} />
               </CartProductsProvider>
          </main>
     );
}
